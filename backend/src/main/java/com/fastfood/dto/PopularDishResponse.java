package com.fastfood.dto;

import com.fastfood.domain.MenuItem;
import com.fastfood.domain.OptionGroup;
import com.fastfood.domain.Restaurant;

import java.util.List;

/**
 * A popular dish flattened with its restaurant.
 * Matches the frontend shape: {@code { ...dish, restaurant: { id, name, deliveryFee, eta } }}.
 */
public record PopularDishResponse(
        String id,
        String restaurantId,
        String name,
        String description,
        double price,
        String image,
        String category,
        boolean veg,
        boolean vegan,
        boolean available,
        double rating,
        int calories,
        int spicy,
        boolean bestseller,
        List<OptionGroup> options,
        RestaurantSummary restaurant
) {
    public static PopularDishResponse from(MenuItem m, Restaurant r) {
        return new PopularDishResponse(
                m.getId(), m.getRestaurantId(), m.getName(), m.getDescription(), m.getPrice(), m.getImage(),
                m.getCategory(), m.isVeg(), m.isVegan(), m.isAvailable(), m.getRating(), m.getCalories(),
                m.getSpicy(), m.isBestseller(), m.getOptions(), RestaurantSummary.from(r)
        );
    }
}