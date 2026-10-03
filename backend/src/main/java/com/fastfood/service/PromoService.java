package com.fastfood.service;

import com.fastfood.domain.PromoCode;
import com.fastfood.domain.PromoType;
import com.fastfood.dto.PromoResponse;
import com.fastfood.exception.ApiException;
import com.fastfood.repository.PromoCodeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

/** Promo code validation and discount maths. */
@Service
public class PromoService {

    private final PromoCodeRepository promoCodeRepository;

    public PromoService(PromoCodeRepository promoCodeRepository) {
        this.promoCodeRepository = promoCodeRepository;
    }

    @Transactional(readOnly = true)
    public PromoResponse validate(String code, Double subtotal) {
        PromoCode promo = requireValid(code);
        if (subtotal != null && promo.getMinSubtotal() > 0 && subtotal < promo.getMinSubtotal()) {
            throw ApiException.badRequest(
                    "Spend $" + String.format(Locale.US, "%.2f", promo.getMinSubtotal()) + " to use this code");
        }
        return PromoResponse.from(promo);
    }

    /** Returns the promo or throws 400 so the client shows a friendly message. */
    @Transactional(readOnly = true)
    public PromoCode requireValid(String code) {
        if (code == null || code.isBlank()) {
            throw ApiException.badRequest("That code isn't valid");
        }
        return promoCodeRepository.findById(code.trim().toUpperCase(Locale.ROOT))
                .filter(PromoCode::isActive)
                .orElseThrow(() -> ApiException.badRequest("That code isn't valid"));
    }

    /** Discount applied to a subtotal. Callers handle FREE_SHIP separately via {@link #isFreeShipping}. */
    public double discount(String code, double subtotal) {
        if (code == null || code.isBlank()) {
            return 0d;
        }
        PromoCode promo = requireValid(code);
        if (promo.getMinSubtotal() > 0 && subtotal < promo.getMinSubtotal()) {
            return 0d;
        }
        return switch (promo.getType()) {
            case PERCENT -> round(subtotal * promo.getValue() / 100d);
            case FLAT -> round(Math.min(promo.getValue(), subtotal));
            case SHIPPING -> 0d;
        };
    }

    public boolean isFreeShipping(String code) {
        if (code == null || code.isBlank()) {
            return false;
        }
        return requireValid(code).getType() == PromoType.SHIPPING;
    }

    public static double round(double value) {
        return Math.round(value * 100d) / 100d;
    }
}