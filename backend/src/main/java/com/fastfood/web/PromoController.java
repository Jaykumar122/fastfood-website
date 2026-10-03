package com.fastfood.web;

import com.fastfood.dto.PromoResponse;
import com.fastfood.dto.PromoValidateRequest;
import com.fastfood.service.PromoService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Promo code validation (public: the cart page can apply codes before sign in). */
@RestController
@RequestMapping("/api/promos")
public class PromoController {

    private final PromoService promoService;

    public PromoController(PromoService promoService) {
        this.promoService = promoService;
    }

    @PostMapping("/validate")
    public PromoResponse validate(@Valid @RequestBody PromoValidateRequest request) {
        return promoService.validate(request.code(), request.subtotal());
    }
}