package com.fastfood.dto;

/** Body for POST /api/payments/verify (the payment object returned by /create). */
public record PaymentVerifyRequest(String id, String reference, Double amount, String currency) {
}