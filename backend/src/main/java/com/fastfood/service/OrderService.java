package com.fastfood.service;

import com.fastfood.domain.Order;
import com.fastfood.domain.OrderItem;
import com.fastfood.domain.OrderStatus;
import com.fastfood.domain.Restaurant;
import com.fastfood.domain.Role;
import com.fastfood.domain.User;
import com.fastfood.dto.CreateOrderRequest;
import com.fastfood.dto.OrderItemRequest;
import com.fastfood.dto.OrderResponse;
import com.fastfood.exception.ApiException;
import com.fastfood.repository.OrderRepository;
import com.fastfood.security.SecurityUtils;
import com.fastfood.util.Dates;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ThreadLocalRandom;

/** Order placement, history and status transitions. */
@Service
public class OrderService {

    private static final double FREE_DELIVERY_THRESHOLD = 35d;
    private static final double SERVICE_FEE = 1.49d;

    private final OrderRepository orderRepository;
    private final RestaurantService restaurantService;
    private final PromoService promoService;
    private final OrderNotifier orderNotifier;

    public OrderService(OrderRepository orderRepository,
                        RestaurantService restaurantService,
                        PromoService promoService,
                        OrderNotifier orderNotifier) {
        this.orderRepository = orderRepository;
        this.restaurantService = restaurantService;
        this.promoService = promoService;
        this.orderNotifier = orderNotifier;
    }

    @Transactional
    public OrderResponse create(CreateOrderRequest request) {
        User customer = SecurityUtils.currentUser().getUser();
        Restaurant restaurant = restaurantService.require(request.restaurantId());

        double subtotal = 0d;
        for (OrderItemRequest line : request.items()) {
            subtotal += (line.price() == null ? 0d : line.price()) * (line.quantity() == null ? 1 : line.quantity());
        }
        subtotal = PromoService.round(subtotal);

        double serviceFee = subtotal > 0 ? SERVICE_FEE : 0d;
        double deliveryFee = subtotal > 0 ? restaurant.getDeliveryFee() : 0d;
        double discount = subtotal > 0 ? promoService.discount(request.promoCode(), subtotal) : 0d;
        if (request.promoCode() != null && subtotal > 0 && promoService.isFreeShipping(request.promoCode())) {
            deliveryFee = 0d;
        }
        if (subtotal >= FREE_DELIVERY_THRESHOLD) {
            deliveryFee = 0d;
        }
        double tip = subtotal > 0 && request.tip() != null ? request.tip() : 0d;
        double total = PromoService.round(Math.max(0d, subtotal - discount + serviceFee + deliveryFee + tip));

        Order order = new Order();
        order.setId(nextOrderId());
        order.setCustomerId(customer.getId());
        order.setCustomerName(customer.getName());
        order.setRestaurantId(restaurant.getId());
        order.setRestaurantName(request.restaurantName() != null && !request.restaurantName().isBlank()
                ? request.restaurantName() : restaurant.getName());
        order.setStatus(OrderStatus.CONFIRMED);
        order.setSubtotal(subtotal);
        order.setServiceFee(serviceFee);
        order.setDeliveryFee(deliveryFee);
        order.setDiscount(discount);
        order.setTip(tip);
        order.setTotal(total);
        order.setAddress(request.address());
        order.setPhone(request.phone());
        order.setPaymentMethod(request.paymentMethod());
        order.setInstructions(request.instructions());
        order.setSchedule(request.schedule());
        order.setPromoCode(request.promoCode());
        order.setPlacedAt(Instant.now());

        for (OrderItemRequest line : request.items()) {
            OrderItem item = new OrderItem();
            item.setMenuItemId(line.resolvedMenuItemId());
            item.setName(line.name() == null ? "Item" : line.name());
            item.setPrice(line.price() == null ? 0d : line.price());
            item.setQuantity(line.quantity() == null ? 1 : line.quantity());
            item.setImage(line.image());
            item.setCustomization(line.customization());
            order.addItem(item);
        }

        Order saved = orderRepository.save(order);
        orderNotifier.publishStatus(saved.getId(), saved.getStatus().name(), Dates.friendly(saved.getPlacedAt()));
        return OrderResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> myOrders() {
        User customer = SecurityUtils.currentUser().getUser();
        return orderRepository.findByCustomerIdOrderByPlacedAtDesc(customer.getId()).stream()
                .map(OrderResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse get(String id) {
        User user = SecurityUtils.currentUser().getUser();
        Order order = require(id);
        assertCanRead(order, user);
        return OrderResponse.from(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> restaurantOrders() {
        User user = SecurityUtils.currentUser().getUser();
        if (user.getRole() == Role.ADMIN) {
            return orderRepository.findAll().stream().map(OrderResponse::from).toList();
        }
        if (user.getRestaurantId() == null) {
            throw ApiException.forbidden("No restaurant linked to this account");
        }
        return orderRepository.findByRestaurantIdOrderByPlacedAtDesc(user.getRestaurantId()).stream()
                .map(OrderResponse::from)
                .toList();
    }

    @Transactional
    public OrderResponse updateStatus(String id, String rawStatus) {
        User user = SecurityUtils.currentUser().getUser();
        Order order = require(id);
        if (user.getRole() != Role.ADMIN
                && (user.getRestaurantId() == null || !user.getRestaurantId().equals(order.getRestaurantId()))) {
            throw ApiException.forbidden("You don't manage this order");
        }
        OrderStatus status = parseStatus(rawStatus);
        order.setStatus(status);
        Order saved = orderRepository.save(order);
        orderNotifier.publishStatus(saved.getId(), status.name(), Dates.friendly(saved.getPlacedAt()));
        return OrderResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public Order require(String id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Order not found: " + id));
    }

    /** Generates a unique human friendly order reference such as {@code FR-4821}. */
    private String nextOrderId() {
        for (int attempt = 0; attempt < 20; attempt++) {
            String candidate = "FR-" + ThreadLocalRandom.current().nextInt(3000, 9000);
            if (!orderRepository.existsById(candidate)) {
                return candidate;
            }
        }
        return "FR-" + System.currentTimeMillis();
    }

    private void assertCanRead(Order order, User user) {
        switch (user.getRole()) {
            case ADMIN -> {
                // full access
            }
            case CUSTOMER -> {
                if (!user.getId().equals(order.getCustomerId())) {
                    throw ApiException.forbidden("This order belongs to another customer");
                }
            }
            case RESTAURANT_OWNER -> {
                if (user.getRestaurantId() == null || !user.getRestaurantId().equals(order.getRestaurantId())) {
                    throw ApiException.forbidden("This order belongs to another restaurant");
                }
            }
            case DELIVERY_PARTNER -> {
                if (order.getRiderId() == null || !user.getId().equals(order.getRiderId())) {
                    throw ApiException.forbidden("This order is not assigned to you");
                }
            }
        }
    }

    public static OrderStatus parseStatus(String raw) {
        if (raw == null || raw.isBlank()) {
            throw ApiException.badRequest("A status is required");
        }
        try {
            return OrderStatus.valueOf(raw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw ApiException.badRequest("Unknown order status: " + raw);
        }
    }
}