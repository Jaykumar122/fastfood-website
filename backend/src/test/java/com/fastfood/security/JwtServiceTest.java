package com.fastfood.security;

import com.fastfood.config.AppProperties;
import com.fastfood.domain.Role;
import com.fastfood.domain.User;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/** Verifies JWT signing/verification and the UserDetails adapter. */
class JwtServiceTest {

    private static final String SECRET = "unit-test-secret-key-with-at-least-32-characters";

    private final JwtService jwtService = new JwtService(new AppProperties(
            new AppProperties.Jwt(SECRET, 3_600_000L),
            new AppProperties.Cors(List.of("http://localhost:8443")),
            new AppProperties.Seed(false)));

    private final User user = new User("u-1", "Ava Morgan", "ava@example.com", "bcrypt-hash", Role.RESTAURANT_OWNER);

    @Test
    void generatedTokenCarriesTheSubject() {
        String token = jwtService.generateToken(user);
        assertThat(token).isNotBlank();
        assertThat(jwtService.extractSubject(token)).contains("ava@example.com");
    }

    @Test
    void tamperedOrForeignTokensAreRejected() {
        assertThat(jwtService.extractSubject("not-a-jwt")).isEmpty();
        assertThat(jwtService.extractSubject("")).isEmpty();

        JwtService other = new JwtService(new AppProperties(
                new AppProperties.Jwt("a-completely-different-secret-key-32chars!!", 3_600_000L),
                new AppProperties.Cors(List.of()),
                new AppProperties.Seed(false)));
        String foreignToken = other.generateToken(user);
        assertThat(jwtService.extractSubject(foreignToken)).isEmpty();
    }

    @Test
    void securityUserExposesTheRoleAuthority() {
        SecurityUser securityUser = new SecurityUser(user);
        assertThat(securityUser.getUsername()).isEqualTo("ava@example.com");
        assertThat(securityUser.getPassword()).isEqualTo("bcrypt-hash");
        assertThat(securityUser.getAuthorities())
                .singleElement()
                .satisfies(authority -> assertThat(authority.getAuthority()).isEqualTo("ROLE_RESTAURANT_OWNER"));
        assertThat(securityUser.isEnabled()).isTrue();
    }

    @Test
    void disabledAccountsAreNotEnabled() {
        User suspended = new User("u-2", "Noah", "noah@example.com", "hash", Role.CUSTOMER);
        suspended.setActive(false);
        assertThat(new SecurityUser(suspended).isEnabled()).isFalse();
    }
}