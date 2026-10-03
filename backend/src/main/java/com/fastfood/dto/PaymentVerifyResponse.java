package com.fastfood.dto;

/** Response body for POST /api/payments/verify: {@code { verified, paymentId, status }}. */
public record PaymentVerifyResponse(boolean verified, String paymentId, String status) {
}