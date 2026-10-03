package com.fastfood.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

/** A customer review shown on a restaurant page. */
@Entity
@Table(name = "reviews", indexes = @Index(name = "idx_reviews_restaurant", columnList = "restaurant_id"))
public class Review {

    @Id
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    @Column(name = "restaurant_id", nullable = false, length = 36)
    private String restaurantId;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false)
    private int rating;

    @Column(length = 1000)
    private String text;

    /** Human friendly label such as "2 days ago" (matches the frontend contract). */
    @Column(name = "date_label", length = 40)
    private String date;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    public Review() {
    }

    public Review(String id, String restaurantId, String name, int rating, String text, String date, int sortOrder) {
        this.id = id;
        this.restaurantId = restaurantId;
        this.name = name;
        this.rating = rating;
        this.text = text;
        this.date = date;
        this.sortOrder = sortOrder;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(String restaurantId) {
        this.restaurantId = restaurantId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }
}