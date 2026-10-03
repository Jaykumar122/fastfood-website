package com.fastfood.dto;

import jakarta.validation.constraints.NotBlank;

/** Payload for POST /api/promos/validate: {@code { code, subtotal }}. */
public record PromoValidateRequest(@NotBlank String code, Double subtotal) {
}