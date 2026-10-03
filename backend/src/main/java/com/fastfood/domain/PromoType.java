package com.fastfood.domain;

/** Discount strategy for a promo code. Wire values are lower-case. */
public enum PromoType {
    PERCENT,
    FLAT,
    SHIPPING;

    public String wireValue() {
        return name().toLowerCase();
    }
}