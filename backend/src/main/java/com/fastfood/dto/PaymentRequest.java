package com.fastfood.dto;

/** Payload for POST /api/payments/create. */
public record PaymentRequest(Double amount, String currency, String orderId) {
}