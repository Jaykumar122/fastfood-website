package com.fastfood.domain;

/** Application roles. Mirrors the role strings used by the frontend. */
public enum Role {
    CUSTOMER,
    RESTAURANT_OWNER,
    DELIVERY_PARTNER,
    ADMIN;

    public String authority() {
        return "ROLE_" + name();
    }
}