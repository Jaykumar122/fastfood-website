package com.fastfood.dto;

import com.fastfood.domain.Order;
import com.fastfood.domain.OrderItem;
import com.fastfood.util.Dates;

import java.util.List;

/** An order as returned to the frontend. */
public record OrderResponse(
        String id,
        String customerId,
        String customerName,
        String restaurantId,
        String restaurantName,
        String status,
        double subtotal,
        double deliveryFee,
        double serviceFee,
        double discount,
        double tip,
        double total,
        String date,
        String address,
        String phone,
        String paymentMethod,
        String instructions,
        String schedule,
        String promoCode,
        List<OrderItemResponse> items,
        RiderInfo rider
) {
    public static OrderResponse from(Order order) {
        List<OrderItemResponse> lines = order.getItems().stream()
                .map(OrderResponse::line)
                .toList();
        RiderInfo rider = (order.getRiderName() != null)
                ? new RiderInfo(order.getRiderName(), order.getRiderPhone())
                : null;
        return new OrderResponse(
                order.getId(), order.getCustomerId(), order.getCustomerName(), order.getRestaurantId(),
                order.getRestaurantName(), order.getStatus().name(), order.getSubtotal(), order.getDeliveryFee(),
                order.getServiceFee(), order.getDiscount(), order.getTip(), order.getTotal(),
                Dates.friendly(order.getPlacedAt()), order.getAddress(), order.getPhone(), order.getPaymentMethod(),
                order.getInstructions(), order.getSchedule(), order.getPromoCode(), lines, rider
        );
    }

    private static OrderItemResponse line(OrderItem item) {
        String key = item.getMenuItemId() != null ? item.getMenuItemId() : item.getName();
        return new OrderItemResponse(
                key, key, item.getMenuItemId(), item.getName(), item.getPrice(), item.getQuantity(),
                item.getImage(), item.getCustomization()
        );
    }
}