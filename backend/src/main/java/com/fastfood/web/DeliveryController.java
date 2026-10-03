package com.fastfood.web;

import com.fastfood.dto.OrderResponse;
import com.fastfood.dto.StatusUpdateRequest;
import com.fastfood.service.DeliveryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Delivery partner endpoints (role DELIVERY_PARTNER). */
@RestController
@RequestMapping("/api/delivery")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @GetMapping("/assigned")
    public List<OrderResponse> assigned() {
        return deliveryService.assigned();
    }

    @GetMapping("/available")
    public List<OrderResponse> available() {
        return deliveryService.available();
    }

    @GetMapping("/history")
    public List<OrderResponse> history() {
        return deliveryService.history();
    }

    @PutMapping("/{orderId}/status")
    public OrderResponse updateStatus(@PathVariable String orderId, @Valid @RequestBody StatusUpdateRequest request) {
        return deliveryService.updateStatus(orderId, request.status());
    }
}