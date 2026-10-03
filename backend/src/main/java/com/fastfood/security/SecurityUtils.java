package com.fastfood.security;

import com.fastfood.exception.ApiException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/** Convenience accessors for the authenticated principal. */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static SecurityUser currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof SecurityUser securityUser)) {
            throw ApiException.unauthorized("Authentication required");
        }
        return securityUser;
    }

    public static String currentUserId() {
        return currentUser().getId();
    }
}