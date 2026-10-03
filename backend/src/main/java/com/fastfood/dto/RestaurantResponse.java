package com.fastfood.dto;

import com.fastfood.domain.Restaurant;

import java.util.List;

/** A restaurant as exposed by GET /api/restaurants and GET /api/restaurants/{id}. */
public record RestaurantResponse(
        String id,
        String name,
        String cuisine,
        double rating,
        int reviews,
        String eta,
        int etaMin,
        double deliveryFee,
        String image,
        int priceLevel,
        double minOrder,
        double distance,
        String promo,
        String badge,
        List<String> tags,
        String address,
        String hours,
        int popularity,
        boolean veg,
        boolean approved,
        String description
) {
    public static RestaurantResponse from(Restaurant r) {
        return new RestaurantResponse(
                r.getId(), r.getName(), r.getCuisine(), r.getRating(), r.getReviews(), r.getEta(), r.getEtaMin(),
                r.getDeliveryFee(), r.getImage(), r.getPriceLevel(), r.getMinOrder(), r.getDistance(), r.getPromo(),
                r.getBadge(), List.copyOf(r.getTags()), r.getAddress(), r.getHours(), r.getPopularity(), r.isVeg(),
                r.isApproved(), r.getDescription()
        );
    }
}