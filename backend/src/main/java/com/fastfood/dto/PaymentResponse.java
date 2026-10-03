package com.fastfood.dto;

import com.fastfood.domain.Payment;

/** Response body for POST /api/payments/create. */
public record PaymentResponse(
        String id,
        String orderId,
        double amount,
        String currency,
        String provider,
        String status,
        String reference
) {
    public static PaymentResponse from(Payment payment) {
        return new PaymentResponse(
                payment.getId(), payment.getOrderId(), payment.getAmount(), payment.getCurrency(),
                payment.getProvider(), payment.getStatus(), payment.getReference()
        );
    }
}