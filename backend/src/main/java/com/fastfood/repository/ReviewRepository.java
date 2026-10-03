package com.fastfood.repository;

import com.fastfood.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, String> {

    List<Review> findByRestaurantIdOrderBySortOrderAsc(String restaurantId);
}