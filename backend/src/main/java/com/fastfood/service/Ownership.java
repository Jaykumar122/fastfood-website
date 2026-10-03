package com.fastfood.service;

import com.fastfood.domain.Restaurant;
import com.fastfood.domain.User;
import com.fastfood.exception.ApiException;

/** Shared ownership checks for restaurant scoped resources. */
public final class Ownership {

    private Ownership() {
    }

    public static void requireRestaurantAccess(Restaurant restaurant, User user) {
        if (user.getRole() == com.fastfood.domain.Role.ADMIN) {
            return;
        }
        if (restaurant.getOwnerId() == null || !restaurant.getOwnerId().equals(user.getId())) {
            throw ApiException.forbidden("You don't manage this restaurant");
        }
    }
}