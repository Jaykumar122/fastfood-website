package com.fastfood.dto;

import com.fastfood.domain.User;

/** A user as exposed to the frontend (never includes the password). */
public record UserResponse(
        String id,
        String name,
        String email,
        String role,
        boolean active,
        String phone
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.isActive(),
                user.getPhone()
        );
    }
}