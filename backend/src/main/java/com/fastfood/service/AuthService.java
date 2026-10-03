package com.fastfood.service;

import com.fastfood.domain.Role;
import com.fastfood.domain.User;
import com.fastfood.dto.AuthResponse;
import com.fastfood.dto.LoginRequest;
import com.fastfood.dto.RegisterRequest;
import com.fastfood.dto.UserResponse;
import com.fastfood.exception.ApiException;
import com.fastfood.repository.UserRepository;
import com.fastfood.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.UUID;

/** Registration and login. Passwords are hashed with BCrypt; sessions are stateless JWTs. */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw ApiException.conflict("An account with that email already exists");
        }
        Role role = parseRole(request.role());
        if (role == Role.ADMIN) {
            throw ApiException.forbidden("Admin accounts can't be self-registered");
        }

        User user = new User(UUID.randomUUID().toString(), request.name().trim(), email,
                passwordEncoder.encode(request.password()), role);
        user.setPhone(request.phone());
        userRepository.save(user);

        return new AuthResponse(jwtService.generateToken(user), UserResponse.from(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.password()));
        } catch (BadCredentialsException ex) {
            throw ApiException.unauthorized("Invalid email or password");
        }
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password"));
        if (!user.isActive()) {
            throw ApiException.forbidden("This account is suspended");
        }
        // The response always carries the account's real role; the client decides whether
        // that role matches the portal the user signed in from.
        return new AuthResponse(jwtService.generateToken(user), UserResponse.from(user));
    }

    /** Parses a role string from the client, defaulting to CUSTOMER. */
    public static Role parseRole(String raw) {
        if (raw == null || raw.isBlank()) {
            return Role.CUSTOMER;
        }
        try {
            return Role.valueOf(raw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw ApiException.badRequest("Unknown role: " + raw);
        }
    }
}