package com.fastfood.service;

import com.fastfood.domain.Restaurant;
import com.fastfood.dto.ApproveRestaurantResponse;
import com.fastfood.dto.UserResponse;
import com.fastfood.repository.RestaurantRepository;
import com.fastfood.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Admin console operations. */
@Service
public class AdminService {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;

    public AdminService(UserRepository userRepository, RestaurantRepository restaurantRepository) {
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> users() {
        return userRepository.findAllByOrderByCreatedAtAsc().stream()
                .map(UserResponse::from)
                .toList();
    }

    @Transactional
    public ApproveRestaurantResponse approveRestaurant(String id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> com.fastfood.exception.ApiException.notFound("Restaurant not found: " + id));
        restaurant.setApproved(true);
        Restaurant saved = restaurantRepository.save(restaurant);
        return new ApproveRestaurantResponse(saved.getId(), saved.isApproved());
    }
}