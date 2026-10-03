package com.fastfood.service;

import com.fastfood.domain.Payment;
import com.fastfood.dto.PaymentRequest;
import com.fastfood.dto.PaymentResponse;
import com.fastfood.dto.PaymentVerifyRequest;
import com.fastfood.dto.PaymentVerifyResponse;
import com.fastfood.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

/** Mock payment gateway: create an intent, then verify it. */
@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public PaymentResponse create(PaymentRequest request) {
        Payment payment = new Payment();
        payment.setId(UUID.randomUUID().toString());
        payment.setAmount(request.amount() == null ? 0d : request.amount());
        payment.setCurrency(request.currency() == null || request.currency().isBlank() ? "USD" : request.currency());
        payment.setOrderId(request.orderId());
        payment.setStatus("CREATED");
        payment.setProvider("mock-gateway");
        payment.setReference("pay-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12));
        Payment saved = paymentRepository.save(payment);
        return PaymentResponse.from(saved);
    }

    @Transactional
    public PaymentVerifyResponse verify(PaymentVerifyRequest request) {
        Optional<Payment> existing = Optional.empty();
        if (request.id() != null && !request.id().isBlank()) {
            existing = paymentRepository.findById(request.id());
        }
        if (existing.isEmpty() && request.reference() != null && !request.reference().isBlank()) {
            existing = paymentRepository.findByReference(request.reference());
        }

        Payment payment = existing.orElseGet(() -> {
            Payment created = new Payment();
            created.setId(UUID.randomUUID().toString());
            created.setAmount(request.amount() == null ? 0d : request.amount());
            created.setCurrency(request.currency() == null || request.currency().isBlank() ? "USD" : request.currency());
            created.setReference("pay-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12));
            return created;
        });
        payment.setStatus("VERIFIED");
        Payment saved = paymentRepository.save(payment);
        return new PaymentVerifyResponse(true, saved.getId(), saved.getStatus());
    }
}