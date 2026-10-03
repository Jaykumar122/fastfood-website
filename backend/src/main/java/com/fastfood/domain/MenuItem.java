package com.fastfood.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

/** A dish belonging to a restaurant. */
@Entity
@Table(name = "menu_items", indexes = @Index(name = "idx_menu_restaurant", columnList = "restaurant_id"))
public class MenuItem {

    @Id
    @Column(length = 60, nullable = false, updatable = false)
    private String id;

    @Column(name = "restaurant_id", nullable = false, length = 36)
    private String restaurantId;

    @Column(nullable = false, length = 180)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private double price;

    @Column(length = 512)
    private String image;

    @Column(length = 60)
    private String category;

    @Column(nullable = false)
    private boolean veg;

    @Column(nullable = false)
    private boolean vegan;

    @Column(nullable = false)
    private boolean available = true;

    @Column(nullable = false)
    private double rating;

    @Column(nullable = false)
    private int calories;

    @Column(nullable = false)
    private int spicy;

    @Column(nullable = false)
    private boolean bestseller;

    @Convert(converter = OptionGroupListConverter.class)
    @Column(name = "options_json", length = 4000)
    private List<OptionGroup> options = new ArrayList<>();

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public boolean isVeg() {
        return veg;
    }

    public void setVeg(boolean veg) {
        this.veg = veg;
    }

    public boolean isVegan() {
        return vegan;
    }

    public void setVegan(boolean vegan) {
        this.vegan = vegan;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public int getCalories() {
        return calories;
    }

    public void setCalories(int calories) {
        this.calories = calories;
    }

    public int getSpicy() {
        return spicy;
    }

    public void setSpicy(int spicy) {
        this.spicy = spicy;
    }

    public boolean isBestseller() {
        return bestseller;
    }

    public void setBestseller(boolean bestseller) {
        this.bestseller = bestseller;
    }

    public List<OptionGroup> getOptions() {
        return options;
    }

    public void setOptions(List<OptionGroup> options) {
        this.options = options;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }
}