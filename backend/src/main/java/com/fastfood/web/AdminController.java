package com.fastfood.web;

import com.fastfood.dto.ApproveRestaurantResponse;
import com.fastfood.dto.UserResponse;
import com.fastfood.service.AdminService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Admin console endpoints (role ADMIN). */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public List<UserResponse> users() {
        return adminService.users();
    }

    @PutMapping("/restaurants/{id}/approve")
    public ApproveRestaurantResponse approveRestaurant(@PathVariable String id) {
        return adminService.approveRestaurant(id);
    }
}