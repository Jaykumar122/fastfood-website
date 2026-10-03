package com.fastfood.repository;

import com.fastfood.domain.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, String> {

    List<MenuItem> findByRestaurantIdOrderBySortOrderAsc(String restaurantId);

    List<MenuItem> findByRestaurantIdIn(Collection<String> restaurantIds);

    List<MenuItem> findByBestsellerTrueAndAvailableTrue();

    List<MenuItem> findByAvailableTrue();

    void deleteByRestaurantId(String restaurantId);
}