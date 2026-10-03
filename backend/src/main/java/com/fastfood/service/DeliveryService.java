package com.fastfood.service;

import com.fastfood.domain.Order;
import com.fastfood.domain.OrderStatus;
import com.fastfood.domain.Role;
import com.fastfood.domain.User;
import com.fastfood.dto.OrderResponse;
import com.fastfood.exception.ApiException;
import com.fastfood.repository.OrderRepository;
import com.fastfood.security.SecurityUtils;
import com.fastfood.util.Dates;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Delivery partner operations: assigned jobs and status updates. */
@Service
public class DeliveryService {

    private static final List<OrderStatus> CLOSED = List.of(OrderStatus.DELIVERED, OrderStatus.CANCELLED);

    private final OrderRepository orderRepository;
    private final OrderNotifier orderNotifier;

    public DeliveryService(OrderRepository orderRepository, OrderNotifier orderNotifier) {
        this.orderRepository = orderRepository;
        this.orderNotifier = orderNotifier;
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> assigned() {
        User rider = SecurityUtils.currentUser().getUser();
        return orderRepository.findByRiderIdAndStatusNotInOrderByPlacedAtDesc(rider.getId(), CLOSED).stream()
                .map(OrderResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> available() {
        return orderRepository.findByRiderIdIsNullAndStatusNotInOrderByPlacedAtDesc(CLOSED).stream()
                .map(OrderResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> history() {
        User rider = SecurityUtils.currentUser().getUser();
        return orderRepository.findByRiderIdOrderByPlacedAtDesc(rider.getId()).stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                .map(OrderResponse::from)
                .toList();
    }

    @Transactional
    public OrderResponse updateStatus(String orderId, String rawStatus) {
        User rider = SecurityUtils.currentUser().getUser();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> ApiException.notFound("Order not found: " + orderId));

        if (rider.getRole() != Role.ADMIN) {
            if (order.getRiderId() == null) {
                // Claim an unassigned job so the rider can start the run.
                order.setRiderId(rider.getId());
                order.setRiderName(rider.getName());
                order.setRiderPhone(rider.getPhone());
            } else if (!rider.getId().equals(order.getRiderId())) {
                throw ApiException.forbidden("This order is assigned to another rider");
            }
        }

        OrderStatus status = OrderService.parseStatus(rawStatus);
        order.setStatus(status);
        Order saved = orderRepository.save(order);
        orderNotifier.publishStatus(saved.getId(), status.name(), Dates.friendly(saved.getPlacedAt()));
        return OrderResponse.from(saved);
    }
}