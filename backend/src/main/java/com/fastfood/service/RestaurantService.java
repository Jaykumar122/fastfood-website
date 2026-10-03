package com.fastfood.service;

import com.fastfood.domain.MenuItem;
import com.fastfood.domain.Restaurant;
import com.fastfood.dto.MenuItemResponse;
import com.fastfood.dto.PageResponse;
import com.fastfood.dto.PopularDishResponse;
import com.fastfood.dto.RestaurantResponse;
import com.fastfood.dto.ReviewResponse;
import com.fastfood.exception.ApiException;
import com.fastfood.repository.MenuItemRepository;
import com.fastfood.repository.RestaurantRepository;
import com.fastfood.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

/** Public restaurant browsing: listing, detail, menu, reviews and popular dishes. */
@Service
public class RestaurantService {

    private static final int POPULAR_LIMIT = 24;
    private static final double FREE_DELIVERY_THRESHOLD = 1.0;
    private static final double TOP_RATED_THRESHOLD = 4.7;

    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final ReviewRepository reviewRepository;

    public RestaurantService(RestaurantRepository restaurantRepository,
                             MenuItemRepository menuItemRepository,
                             ReviewRepository reviewRepository) {
        this.restaurantRepository = restaurantRepository;
        this.menuItemRepository = menuItemRepository;
        this.reviewRepository = reviewRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<RestaurantResponse> list(Map<String, String> filters) {
        List<Restaurant> result = new ArrayList<>(restaurantRepository.findByApprovedTrue());

        String search = text(filters.get("search"));
        if (!search.isBlank()) {
            String query = search.toLowerCase(Locale.ROOT);
            Map<String, List<MenuItem>> menusByRestaurant = menusForRestaurants(
                    result.stream().map(Restaurant::getId).toList());
            result.removeIf(restaurant -> !matchesSearch(restaurant,
                    menusByRestaurant.getOrDefault(restaurant.getId(), List.of()), query));
        }

        String cuisine = text(filters.get("cuisine"));
        if (!cuisine.isBlank() && !"All".equalsIgnoreCase(cuisine)) {
            result.removeIf(restaurant -> !cuisine.equalsIgnoreCase(restaurant.getCuisine()));
        }
        if ("true".equalsIgnoreCase(text(filters.get("veg")))) {
            result.removeIf(restaurant -> !restaurant.isVeg());
        }
        if ("true".equalsIgnoreCase(text(filters.get("freeDelivery")))) {
            result.removeIf(restaurant -> restaurant.getDeliveryFee() >= FREE_DELIVERY_THRESHOLD);
        }
        if ("true".equalsIgnoreCase(text(filters.get("topRated")))) {
            result.removeIf(restaurant -> restaurant.getRating() < TOP_RATED_THRESHOLD);
        }
        String price = text(filters.get("price"));
        if (!price.isBlank()) {
            int level = parseInt(price, Integer.MAX_VALUE);
            result.removeIf(restaurant -> restaurant.getPriceLevel() > level);
        }

        result.sort(sorter(text(filters.get("sort"))));

        int page = parseInt(text(filters.get("page")), 0);
        List<RestaurantResponse> content = result.stream().map(RestaurantResponse::from).toList();
        return new PageResponse<>(content, page, 1, content.size());
    }

    @Transactional(readOnly = true)
    public List<PopularDishResponse> popularDishes() {
        Map<String, Restaurant> restaurantsById = restaurantRepository.findByApprovedTrue().stream()
                .collect(Collectors.toMap(Restaurant::getId, restaurant -> restaurant));
        return menuItemRepository.findByBestsellerTrueAndAvailableTrue().stream()
                .filter(item -> restaurantsById.containsKey(item.getRestaurantId()))
                .limit(POPULAR_LIMIT)
                .map(item -> PopularDishResponse.from(item, restaurantsById.get(item.getRestaurantId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public RestaurantResponse get(String id) {
        return RestaurantResponse.from(require(id));
    }

    @Transactional(readOnly = true)
    public List<MenuItemResponse> menu(String id) {
        require(id);
        return menuItemRepository.findByRestaurantIdOrderBySortOrderAsc(id).stream()
                .map(MenuItemResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> reviews(String id) {
        require(id);
        return reviewRepository.findByRestaurantIdOrderBySortOrderAsc(id).stream()
                .map(ReviewResponse::from)
                .toList();
    }

    /** Loads a restaurant or throws 404. Used by other services too. */
    @Transactional(readOnly = true)
    public Restaurant require(String id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Restaurant not found: " + id));
    }

    private Map<String, List<MenuItem>> menusForRestaurants(List<String> ids) {
        if (ids.isEmpty()) {
            return Map.of();
        }
        return menuItemRepository.findByRestaurantIdIn(ids).stream()
                .collect(Collectors.groupingBy(MenuItem::getRestaurantId));
    }

    private boolean matchesSearch(Restaurant restaurant, List<MenuItem> menu, String query) {
        String description = restaurant.getDescription() == null ? "" : restaurant.getDescription();
        String address = restaurant.getAddress() == null ? "" : restaurant.getAddress();
        String haystack = String.join(" ", restaurant.getName(), restaurant.getCuisine(), description, address,
                String.join(" ", restaurant.getTags())).toLowerCase(Locale.ROOT);
        if (haystack.contains(query)) {
            return true;
        }
        return menu.stream().anyMatch(item -> {
            String itemDescription = item.getDescription() == null ? "" : item.getDescription();
            return (item.getName() + " " + itemDescription).toLowerCase(Locale.ROOT).contains(query);
        });
    }

    private Comparator<Restaurant> sorter(String sort) {
        if (sort == null) {
            return Comparator.comparingInt(Restaurant::getPopularity).reversed();
        }
        return switch (sort) {
            case "rating" -> Comparator.comparingDouble(Restaurant::getRating).reversed();
            case "delivery" -> Comparator.comparingDouble(Restaurant::getDeliveryFee);
            case "time" -> Comparator.comparingInt(Restaurant::getEtaMin);
            default -> Comparator.comparingInt(Restaurant::getPopularity).reversed();
        };
    }

    private static String text(String value) {
        return value == null ? "" : value.trim();
    }

    private static int parseInt(String value, int fallback) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException ex) {
            return fallback;
        }
    }
}