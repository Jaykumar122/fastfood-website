package com.fastfood.dto;

import com.fastfood.domain.Restaurant;

/** Minimal restaurant info attached to a popular dish. */
public record RestaurantSummary(String id, String name, double deliveryFee, String eta) {
    public static RestaurantSummary from(Restaurant r) {
        return new RestaurantSummary(r.getId(), r.getName(), r.getDeliveryFee(), r.getEta());
    }
}