package com.fastfood.service;

import com.fastfood.domain.MenuItem;
import com.fastfood.domain.Restaurant;
import com.fastfood.domain.User;
import com.fastfood.dto.MenuItemRequest;
import com.fastfood.dto.MenuItemResponse;
import com.fastfood.exception.ApiException;
import com.fastfood.repository.MenuItemRepository;
import com.fastfood.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Restaurant owner menu editing (create, update, delete). */
@Service
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final RestaurantService restaurantService;

    public MenuItemService(MenuItemRepository menuItemRepository, RestaurantService restaurantService) {
        this.menuItemRepository = menuItemRepository;
        this.restaurantService = restaurantService;
    }

    @Transactional
    public MenuItemResponse save(MenuItemRequest request) {
        User user = SecurityUtils.currentUser().getUser();
        String restaurantId = (request.restaurantId() != null && !request.restaurantId().isBlank())
                ? request.restaurantId() : user.getRestaurantId();
        if (restaurantId == null) {
            throw ApiException.badRequest("A restaurantId is required");
        }
        Restaurant restaurant = restaurantService.require(restaurantId);
        Ownership.requireRestaurantAccess(restaurant, user);

        MenuItem item = resolveItem(request.id(), restaurantId);
        if (request.name() != null && !request.name().isBlank()) {
            item.setName(request.name());
        } else if (item.getName() == null) {
            throw ApiException.badRequest("A dish name is required");
        }
        item.setDescription(request.description());
        item.setPrice(request.price() == null ? item.getPrice() : request.price());
        item.setImage(request.image());
        item.setCategory(request.category());
        item.setVeg(Boolean.TRUE.equals(request.veg()));
        item.setVegan(Boolean.TRUE.equals(request.vegan()));
        item.setAvailable(request.available() == null || request.available());
        item.setRating(request.rating() == null ? 4.5d : request.rating());
        item.setCalories(request.calories() == null ? 0 : request.calories());
        item.setSpicy(request.spicy() == null ? 0 : request.spicy());
        item.setBestseller(Boolean.TRUE.equals(request.bestseller()));
        if (request.options() != null) {
            item.setOptions(request.options());
        }
        if (request.sortOrder() != null) {
            item.setSortOrder(request.sortOrder());
        }

        MenuItem saved = menuItemRepository.save(item);
        return MenuItemResponse.from(saved);
    }

    @Transactional
    public void delete(String id) {
        User user = SecurityUtils.currentUser().getUser();
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Dish not found: " + id));
        Restaurant restaurant = restaurantService.require(item.getRestaurantId());
        Ownership.requireRestaurantAccess(restaurant, user);
        menuItemRepository.delete(item);
    }

    @Transactional(readOnly = true)
    public List<MenuItemResponse> byRestaurant(String restaurantId) {
        return menuItemRepository.findByRestaurantIdOrderBySortOrderAsc(restaurantId).stream()
                .map(MenuItemResponse::from)
                .toList();
    }

    private MenuItem resolveItem(String id, String restaurantId) {
        if (id == null || id.isBlank()) {
            MenuItem created = new MenuItem();
            created.setId(restaurantId + "-" + (System.currentTimeMillis() % 1_000_000L));
            created.setRestaurantId(restaurantId);
            created.setSortOrder(menuItemRepository.findByRestaurantIdOrderBySortOrderAsc(restaurantId).size());
            return created;
        }
        return menuItemRepository.findById(id).map(existing -> {
            if (!restaurantId.equals(existing.getRestaurantId())) {
                throw ApiException.forbidden("That dish belongs to another restaurant");
            }
            return existing;
        }).orElseGet(() -> {
            MenuItem created = new MenuItem();
            created.setId(id);
            created.setRestaurantId(restaurantId);
            return created;
        });
    }
}