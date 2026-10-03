package com.fastfood.dto;

import com.fastfood.domain.Review;

/** A restaurant review: {@code { name, rating, text, date }}. */
public record ReviewResponse(String name, int rating, String text, String date) {
    public static ReviewResponse from(Review r) {
        return new ReviewResponse(r.getName(), r.getRating(), r.getText(), r.getDate());
    }
}