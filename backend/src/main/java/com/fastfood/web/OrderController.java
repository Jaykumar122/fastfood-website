package com.fastfood.web;

import com.fastfood.dto.CreateOrderRequest;
import com.fastfood.dto.OrderResponse;
import com.fastfood.dto.StatusUpdateRequest;
import com.fastfood.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Order placement, history, detail and kitchen status updates. */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.create(request));
    }

    @GetMapping("/my")
    public List<OrderResponse> myOrders() {
        return orderService.myOrders();
    }

    @GetMapping("/restaurant")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER','ADMIN')")
    public List<OrderResponse> restaurantOrders() {
        return orderService.restaurantOrders();
    }

    @GetMapping("/{id}")
    public OrderResponse detail(@PathVariable String id) {
        return orderService.get(id);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER','ADMIN')")
    public OrderResponse updateStatus(@PathVariable String id, @Valid @RequestBody StatusUpdateRequest request) {
        return orderService.updateStatus(id, request.status());
    }
}