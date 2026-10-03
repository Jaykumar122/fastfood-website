package com.fastfood.dto;

import com.fastfood.domain.PromoCode;

/** A validated promo: {@code { code, type, value, label }}. */
public record PromoResponse(String code, String type, double value, String label) {
    public static PromoResponse from(PromoCode promo) {
        return new PromoResponse(promo.getCode(), promo.getType().wireValue(), promo.getValue(), promo.getLabel());
    }
}