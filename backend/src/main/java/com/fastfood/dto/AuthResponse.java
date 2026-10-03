package com.fastfood.dto;

/** Response body for register/login: {@code { token, user }}. */
public record AuthResponse(String token, UserResponse user) {
}