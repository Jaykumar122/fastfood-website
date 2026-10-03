package com.fastfood.dto;

import com.fastfood.domain.OptionGroup;

import java.util.List;

/** Payload for POST/PUT /api/restaurants/menu-items (restaurant owner menu editing). */
public record MenuItemRequest(
        String id,
        String restaurantId,
        String name,
        String description,
        Double price,
        String image,
        String category,
        Boolean veg,
        Boolean vegan,
        Boolean available,
        Double rating,
        Integer calories,
        Integer spicy,
        Boolean bestseller,
        List<OptionGroup> options,
        Integer sortOrder
) {
}