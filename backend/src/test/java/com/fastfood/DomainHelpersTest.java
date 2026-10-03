package com.fastfood;

import com.fastfood.domain.OrderStatus;
import com.fastfood.exception.ApiException;
import com.fastfood.service.AuthService;
import com.fastfood.service.OrderService;
import com.fastfood.util.Dates;
import com.fastfood.domain.Role;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Small helper/parsing units used across the API. */
class DomainHelpersTest {

    @Test
    void datesAreFormattedTheWayTheFrontendDisplaysThem() {
        Instant now = Instant.now();
        assertThat(Dates.friendly(now)).startsWith("Today, ");
        assertThat(Dates.friendly(now.minus(Duration.ofDays(1)))).startsWith("Yesterday, ");
        assertThat(Dates.friendly(now.minus(Duration.ofDays(30))))
                .matches("^[A-Z][a-z]{2} \\d{1,2}, \\d{1,2}:\\d{2} [AP]M$");
        assertThat(Dates.friendly(null)).isEmpty();
    }

    @Test
    void orderStatusesParseCaseInsensitivelyAndRejectUnknownValues() {
        assertThat(OrderService.parseStatus("preparing")).isEqualTo(OrderStatus.PREPARING);
        assertThat(OrderService.parseStatus(" OUT_FOR_DELIVERY ")).isEqualTo(OrderStatus.OUT_FOR_DELIVERY);
        assertThat(OrderService.parseStatus("READY_FOR_PICKUP")).isEqualTo(OrderStatus.READY_FOR_PICKUP);
        assertThat(OrderService.parseStatus("TO_RESTAURANT")).isEqualTo(OrderStatus.TO_RESTAURANT);

        assertThatThrownBy(() -> OrderService.parseStatus("FLYING"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Unknown order status");
        assertThatThrownBy(() -> OrderService.parseStatus(" "))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("A status is required");
    }

    @Test
    void terminalStatusesAreRecognised() {
        assertThat(OrderStatus.DELIVERED.isTerminal()).isTrue();
        assertThat(OrderStatus.CANCELLED.isTerminal()).isTrue();
        assertThat(OrderStatus.CONFIRMED.isTerminal()).isFalse();
    }

    @Test
    void rolesParseFromClientStringsAndAdminSelfSignupIsBlockedByRole() {
        assertThat(AuthService.parseRole(null)).isEqualTo(Role.CUSTOMER);
        assertThat(AuthService.parseRole("")).isEqualTo(Role.CUSTOMER);
        assertThat(AuthService.parseRole("customer")).isEqualTo(Role.CUSTOMER);
        assertThat(AuthService.parseRole("restaurant_owner")).isEqualTo(Role.RESTAURANT_OWNER);
        assertThat(AuthService.parseRole("DELIVERY_PARTNER")).isEqualTo(Role.DELIVERY_PARTNER);
        assertThatThrownBy(() -> AuthService.parseRole("SUPERUSER"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Unknown role");
    }
}