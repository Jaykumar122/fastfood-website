package com.fastfood.config;

import com.fastfood.domain.MenuItem;
import com.fastfood.domain.Order;
import com.fastfood.domain.OrderItem;
import com.fastfood.domain.OrderStatus;
import com.fastfood.domain.Restaurant;
import com.fastfood.domain.Role;
import com.fastfood.domain.User;
import com.fastfood.repository.MenuItemRepository;
import com.fastfood.repository.OrderRepository;
import com.fastfood.repository.PromoCodeRepository;
import com.fastfood.repository.RestaurantRepository;
import com.fastfood.repository.ReviewRepository;
import com.fastfood.repository.UserRepository;
import com.fastfood.service.PromoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/** Populates MySQL with demo data on first start (16 restaurants, full menus, demo accounts). */
@Component
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    public static final String DEMO_PASSWORD = "password";

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final ReviewRepository reviewRepository;
    private final PromoCodeRepository promoCodeRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties properties;

    public DataSeeder(UserRepository userRepository,
                      RestaurantRepository restaurantRepository,
                      MenuItemRepository menuItemRepository,
                      ReviewRepository reviewRepository,
                      PromoCodeRepository promoCodeRepository,
                      OrderRepository orderRepository,
                      PasswordEncoder passwordEncoder,
                      AppProperties properties) {
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
        this.menuItemRepository = menuItemRepository;
        this.reviewRepository = reviewRepository;
        this.promoCodeRepository = promoCodeRepository;
        this.orderRepository = orderRepository;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!properties.seed().enabled()) {
            log.info("Seed disabled (app.seed.enabled=false)");
            return;
        }
        if (userRepository.count() > 0 || restaurantRepository.count() > 0) {
            log.info("Seed skipped: data already present");
            return;
        }

        User customer = createUser("u-customer", "Avery Morgan", "customer@fastfood.app", Role.CUSTOMER, null, true);
        User owner = createUser("u-owner", "Maya Chen", "owner@fastfood.app", Role.RESTAURANT_OWNER, "r1", true);
        User rider = createUser("u-rider", "Marcus Reed", "rider@fastfood.app", Role.DELIVERY_PARTNER, null, true);
        createUser("u-admin", "Fastfood Admin", "admin@fastfood.app", Role.ADMIN, null, true);
        createUser("u-extra-1", "Avery Morgan", "avery@example.com", Role.CUSTOMER, null, true);
        createUser("u-extra-2", "Noah Williams", "noah@example.com", Role.CUSTOMER, null, false);

        List<Restaurant> restaurants = restaurantRepository.saveAll(SeedRestaurants.all());
        restaurants.stream()
                .filter(restaurant -> "r1".equals(restaurant.getId()))
                .forEach(restaurant -> {
                    restaurant.setOwnerId(owner.getId());
                    restaurantRepository.save(restaurant);
                });

        Map<String, List<MenuItem>> menus = SeedMenus.all();
        menus.values().forEach(menuItemRepository::saveAll);

        reviewRepository.saveAll(SeedData.reviews(restaurants.stream().map(Restaurant::getId).toList()));
        promoCodeRepository.saveAll(SeedData.promos());

        seedOrders(customer, rider);

        log.info("Seeded {} users, {} restaurants, {} dishes, {} promos",
                userRepository.count(), restaurantRepository.count(), menuItemRepository.count(),
                promoCodeRepository.count());
    }

    private User createUser(String id, String name, String email, Role role, String restaurantId, boolean active) {
        User user = new User(id, name, email, passwordEncoder.encode(DEMO_PASSWORD), role);
        user.setRestaurantId(restaurantId);
        user.setActive(active);
        user.setPhone("+1 555 012 0100");
        return userRepository.save(user);
    }

    private void seedOrders(User customer, User rider) {
        Instant now = Instant.now();
        orderRepository.save(buildOrder("FR-2048", customer, rider, "r1", "Stacked & Smashed",
                OrderStatus.OUT_FOR_DELIVERY, now.minus(Duration.ofMinutes(25)), 31.48, 1.99,
                List.of("r1-1:2", "r1-5:1"), "18 Market Street, Apt 4B"));
        orderRepository.save(buildOrder("FR-1986", customer, null, "r3", "Greenhouse",
                OrderStatus.DELIVERED, now.minus(Duration.ofDays(2)), 24.65, 1.49,
                List.of("r3-1:1"), "18 Market Street, Apt 4B"));
        orderRepository.save(buildOrder("FR-1840", customer, null, "r2", "Nonna's Corner",
                OrderStatus.DELIVERED, now.minus(Duration.ofDays(12)), 38.20, 0.0,
                List.of("r2-1:1", "r2-5:1"), "18 Market Street, Apt 4B"));
        orderRepository.save(buildOrder("FR-2201", customer, rider, "r4", "Spice Route",
                OrderStatus.PICKED_UP, now.minus(Duration.ofMinutes(40)), 29.90, 2.49,
                List.of("r4-1:1", "r4-6:1"), "402 Hayes Street"));
        orderRepository.save(buildOrder("FR-2202", customer, rider, "r1", "Stacked & Smashed",
                OrderStatus.TO_RESTAURANT, now.minus(Duration.ofMinutes(12)), 18.20, 1.99,
                List.of("r1-5:1", "r1-6:1"), "77 9th Ave"));
    }

    private Order buildOrder(String id, User customer, User rider, String restaurantId, String restaurantName,
                             OrderStatus status, Instant placedAt, double total, double deliveryFee,
                             List<String> lines, String address) {
        Order order = new Order();
        order.setId(id);
        order.setCustomerId(customer.getId());
        order.setCustomerName(customer.getName());
        order.setRestaurantId(restaurantId);
        order.setRestaurantName(restaurantName);
        order.setStatus(status);
        order.setPlacedAt(placedAt);
        order.setAddress(address);
        order.setPhone(customer.getPhone());
        order.setPaymentMethod("COD");
        order.setSchedule("ASAP");
        if (rider != null) {
            order.setRiderId(rider.getId());
            order.setRiderName(rider.getName());
            order.setRiderPhone(rider.getPhone());
        }

        double subtotal = 0d;
        for (String line : lines) {
            String[] parts = line.split(":");
            String menuItemId = parts[0];
            int quantity = Integer.parseInt(parts[1]);
            MenuItem menuItem = menuItemRepository.findById(menuItemId).orElse(null);
            OrderItem orderItem = new OrderItem();
            orderItem.setMenuItemId(menuItemId);
            orderItem.setName(menuItem != null ? menuItem.getName() : menuItemId);
            double price = menuItem != null ? menuItem.getPrice() : 0d;
            orderItem.setPrice(price);
            orderItem.setImage(menuItem != null ? menuItem.getImage() : null);
            orderItem.setQuantity(quantity);
            order.addItem(orderItem);
            subtotal += price * quantity;
        }

        order.setSubtotal(PromoService.round(subtotal));
        order.setDeliveryFee(deliveryFee);
        order.setServiceFee(1.49);
        order.setDiscount(0);
        order.setTip(2.0);
        order.setTotal(total);
        return order;
    }
}