package com.fastfood.exception;

import java.time.Instant;

/** Standard error body returned for every failed request. */
public record ErrorResponse(Instant timestamp, int status, String error, String message, String path) {
}