package com.fastfood.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** Payload for POST /api/auth/login. {@code role} is optional and echoes the portal the user used. */
public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password,
        String role
) {
}