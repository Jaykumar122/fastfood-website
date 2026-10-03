package com.fastfood.dto;

/** WebSocket payload broadcast on /topic/orders/{orderId}. */
public record OrderStatusMessage(String id, String status, String date) {
}