package com.fastfood.repository;

import com.fastfood.domain.Order;
import com.fastfood.domain.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, String> {

    List<Order> findByCustomerIdOrderByPlacedAtDesc(String customerId);

    List<Order> findByRestaurantIdOrderByPlacedAtDesc(String restaurantId);

    List<Order> findByRiderIdAndStatusNotInOrderByPlacedAtDesc(String riderId, Collection<OrderStatus> statuses);

    List<Order> findByRiderIdIsNullAndStatusNotInOrderByPlacedAtDesc(Collection<OrderStatus> statuses);

    List<Order> findByRiderIdOrderByPlacedAtDesc(String riderId);

    long countByCustomerId(String customerId);
}