package com.fastfood.web;

import com.fastfood.dto.MenuItemRequest;
import com.fastfood.dto.MenuItemResponse;
import com.fastfood.dto.PageResponse;
import com.fastfood.dto.PopularDishResponse;
import com.fastfood.dto.RestaurantResponse;
import com.fastfood.dto.ReviewResponse;
import com.fastfood.service.MenuItemService;
import com.fastfood.service.RestaurantService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/** Public restaurant browsing plus restaurant-owner menu management. */
@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    private final RestaurantService restaurantService;
    private final MenuItemService menuItemService;

    public RestaurantController(RestaurantService restaurantService, MenuItemService menuItemService) {
        this.restaurantService = restaurantService;
        this.menuItemService = menuItemService;
    }

    @GetMapping
    public PageResponse<RestaurantResponse> list(@RequestParam Map<String, String> filters) {
        return restaurantService.list(filters);
    }

    @GetMapping("/popular-dishes")
    public List<PopularDishResponse> popularDishes() {
        return restaurantService.popularDishes();
    }

    @GetMapping("/{id}")
    public RestaurantResponse detail(@PathVariable String id) {
        return restaurantService.get(id);
    }

    @GetMapping("/{id}/menu")
    public List<MenuItemResponse> menu(@PathVariable String id) {
        return restaurantService.menu(id);
    }

    @GetMapping("/{id}/reviews")
    public List<ReviewResponse> reviews(@PathVariable String id) {
        return restaurantService.reviews(id);
    }

    @PostMapping("/menu-items")
    public ResponseEntity<MenuItemResponse> createMenuItem(@Valid @RequestBody MenuItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(menuItemService.save(request));
    }

    @PutMapping("/menu-items")
    public MenuItemResponse updateMenuItem(@Valid @RequestBody MenuItemRequest request) {
        return menuItemService.save(request);
    }

    @DeleteMapping("/menu-items/{id}")
    public Map<String, Object> deleteMenuItem(@PathVariable String id) {
        menuItemService.delete(id);
        return Map.of("id", id, "deleted", true);
    }
}