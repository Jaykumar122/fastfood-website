package com.fastfood.dto;

import jakarta.validation.constraints.NotBlank;

/** Payload for PUT /api/orders/{id}/status and PUT /api/delivery/{id}/status. */
public record StatusUpdateRequest(@NotBlank String status) {
}