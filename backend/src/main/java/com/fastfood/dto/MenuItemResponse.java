package com.fastfood.dto;

import com.fastfood.domain.MenuItem;
import com.fastfood.domain.OptionGroup;

import java.util.List;

/** A dish as exposed by the menu and popular-dishes endpoints. */
public record MenuItemResponse(
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
        List<OptionGroup> options
) {
    public static MenuItemResponse from(MenuItem m) {
        return new MenuItemResponse(
                m.getId(), m.getRestaurantId(), m.getName(), m.getDescription(), m.getPrice(), m.getImage(),
                m.getCategory(), m.isVeg(), m.isVegan(), m.isAvailable(), m.getRating(), m.getCalories(),
                m.getSpicy(), m.isBestseller(), m.getOptions()
        );
    }
}