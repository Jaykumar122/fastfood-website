package com.fastfood.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A redeemable promo code. */
@Entity
@Table(name = "promo_codes")
public class PromoCode {

    @Id
    @Column(length = 40, nullable = false, updatable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PromoType type;

    @Column(name = "discount_value", nullable = false)
    private double value;

    @Column(nullable = false, length = 160)
    private String label;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "min_subtotal", nullable = false)
    private double minSubtotal;

    public PromoCode() {
    }

    public PromoCode(String code, PromoType type, double value, String label, double minSubtotal) {
        this.code = code;
        this.type = type;
        this.value = value;
        this.label = label;
        this.minSubtotal = minSubtotal;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public PromoType getType() {
        return type;
    }

    public void setType(PromoType type) {
        this.type = type;
    }

    public double getValue() {
        return value;
    }

    public void setValue(double value) {
        this.value = value;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public double getMinSubtotal() {
        return minSubtotal;
    }

    public void setMinSubtotal(double minSubtotal) {
        this.minSubtotal = minSubtotal;
    }
}