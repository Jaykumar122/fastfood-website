package com.fastfood.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/** Payload for POST /api/orders (the cart payload sent by the frontend checkout). */
public record CreateOrderRequest(
        @NotNull String restaurantId,
        String restaurantName,
        String address,
        String phone,
        String paymentMethod,
        String instructions,
        String schedule,
        String promoCode,
        Double tip,
        Double total,
        @NotEmpty List<OrderItemRequest> items
) {
}