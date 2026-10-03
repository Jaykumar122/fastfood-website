package com.fastfood.repository;

import com.fastfood.domain.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RestaurantRepository extends JpaRepository<Restaurant, String> {

    List<Restaurant> findByApprovedTrue();

    List<Restaurant> findByApprovedTrueOrderByPopularityDesc();
}