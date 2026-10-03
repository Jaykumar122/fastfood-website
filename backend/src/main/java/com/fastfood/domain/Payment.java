package com.fastfood.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/** A payment attempt for an order (mock gateway). */
@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    @Column(name = "order_id", length = 40)
    private String orderId;

    @Column(nullable = false)
    private double amount;

    @Column(nullable = false, length = 8)
    private String currency = "USD";

    @Column(nullable = false, length = 40)
    private String provider = "mock-gateway";

    @Column(nullable = false, length = 20)
    private String status = "CREATED";

    @Column(nullable = false, length = 60, unique = true)
    private String reference;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}