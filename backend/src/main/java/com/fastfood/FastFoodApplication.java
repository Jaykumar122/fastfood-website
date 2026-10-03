package com.fastfood;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/**
 * Entry point for the fastfood delivery backend.
 *
 * <p>Exposes the REST + WebSocket contract consumed by the React frontend
 * (see {@code front-end/src/api/endpoints.js}).
 */
@SpringBootApplication
@ConfigurationPropertiesScan
public class FastFoodApplication {

    public static void main(String[] args) {
        SpringApplication.run(FastFoodApplication.class, args);
    }
}