package com.fastfood.domain;

/**
 * Lifecycle of an order. The set is a superset of the values used by the
 * frontend stepper (CONFIRMED → PREPARING → READY_FOR_PICKUP →
 * OUT_FOR_DELIVERY → DELIVERED) and the restaurant dashboard
 * (NEW → PREPARING → READY → PICKED_UP).
 */
public enum OrderStatus {
    NEW,
    CONFIRMED,
    PREPARING,
    READY,
    READY_FOR_PICKUP,
    TO_RESTAURANT,
    PICKED_UP,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED;

    public boolean isTerminal() {
        return this == DELIVERED || this == CANCELLED;
    }
}