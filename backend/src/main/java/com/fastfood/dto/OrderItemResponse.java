package com.fastfood.dto;

/** One line of an order as returned to the frontend. */
public record OrderItemResponse(
        String id,
        String baseId,
        String menuItemId,
        String name,
        double price,
        int quantity,
        String image,
        String customization
) {
}