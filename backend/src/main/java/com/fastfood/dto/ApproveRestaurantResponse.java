package com.fastfood.dto;

/** Response body for PUT /api/admin/restaurants/{id}/approve: {@code { id, approved }}. */
public record ApproveRestaurantResponse(String id, boolean approved) {
}