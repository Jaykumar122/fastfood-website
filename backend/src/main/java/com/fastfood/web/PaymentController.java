package com.fastfood.web;

import com.fastfood.dto.PaymentRequest;
import com.fastfood.dto.PaymentResponse;
import com.fastfood.dto.PaymentVerifyRequest;
import com.fastfood.dto.PaymentVerifyResponse;
import com.fastfood.service.PaymentService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Card payment flow used by checkout: create an intent then verify it. */
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create")
    public PaymentResponse create(@RequestBody PaymentRequest request) {
        return paymentService.create(request);
    }

    @PostMapping("/verify")
    public PaymentVerifyResponse verify(@RequestBody PaymentVerifyRequest request) {
        return paymentService.verify(request);
    }
}