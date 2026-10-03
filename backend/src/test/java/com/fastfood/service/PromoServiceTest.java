package com.fastfood.service;

import com.fastfood.domain.PromoCode;
import com.fastfood.domain.PromoType;
import com.fastfood.dto.PromoResponse;
import com.fastfood.exception.ApiException;
import com.fastfood.repository.PromoCodeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/** Promo validation and discount maths. */
class PromoServiceTest {

    private PromoCodeRepository repository;
    private PromoService promoService;

    @BeforeEach
    void setUp() {
        repository = mock(PromoCodeRepository.class);
        promoService = new PromoService(repository);

        // Generic miss first so the specific stubs below win for their own keys.
        when(repository.findById(anyString())).thenReturn(Optional.empty());
        when(repository.findById("RUSH20"))
                .thenReturn(Optional.of(new PromoCode("RUSH20", PromoType.PERCENT, 20, "20% off your food", 0)));
        when(repository.findById("SAVE5"))
                .thenReturn(Optional.of(new PromoCode("SAVE5", PromoType.FLAT, 5, "$5 off", 0)));
        when(repository.findById("FREESHIP"))
                .thenReturn(Optional.of(new PromoCode("FREESHIP", PromoType.SHIPPING, 100, "Free delivery", 0)));
        when(repository.findById("MIN20"))
                .thenReturn(Optional.of(new PromoCode("MIN20", PromoType.FLAT, 3, "Spend more", 20)));

        PromoCode disabled = new PromoCode("OFF", PromoType.PERCENT, 50, "Disabled", 0);
        disabled.setActive(false);
        when(repository.findById("OFF")).thenReturn(Optional.of(disabled));
    }

    @Test
    void validateReturnsTheWireShapeExpectedByTheFrontend() {
        PromoResponse response = promoService.validate("rush20", 40.0);

        assertThat(response.code()).isEqualTo("RUSH20");
        assertThat(response.type()).isEqualTo("percent");
        assertThat(response.value()).isEqualTo(20);
        assertThat(response.label()).isEqualTo("20% off your food");
    }

    @Test
    void unknownInactiveAndUnderspendCodesAreRejectedWith400() {
        assertThatThrownBy(() -> promoService.validate("NOPE", 40.0))
                .isInstanceOf(ApiException.class)
                .hasMessage("That code isn't valid")
                .extracting(ex -> ((ApiException) ex).getStatus())
                .isEqualTo(HttpStatus.BAD_REQUEST);

        assertThatThrownBy(() -> promoService.validate("OFF", 40.0))
                .isInstanceOf(ApiException.class)
                .hasMessage("That code isn't valid");

        assertThatThrownBy(() -> promoService.validate("MIN20", 10.0))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Spend $20.00");
    }

    @Test
    void percentFlatAndShippingDiscountsMatchTheFrontendCartMath() {
        assertThat(promoService.discount("RUSH20", 40.0)).isEqualTo(8.0);
        assertThat(promoService.discount("SAVE5", 40.0)).isEqualTo(5.0);
        // A flat discount can never exceed the subtotal.
        assertThat(promoService.discount("SAVE5", 3.0)).isEqualTo(3.0);
        // Shipping promos discount the delivery fee, not the food.
        assertThat(promoService.discount("FREESHIP", 40.0)).isEqualTo(0.0);
        assertThat(promoService.discount(null, 40.0)).isEqualTo(0.0);
    }

    @Test
    void onlyShippingCodesReportFreeShipping() {
        assertThat(promoService.isFreeShipping("FREESHIP")).isTrue();
        assertThat(promoService.isFreeShipping("RUSH20")).isFalse();
        assertThat(promoService.isFreeShipping(null)).isFalse();
    }
}