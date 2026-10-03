package com.fastfood.dto;

/** Generic paginated envelope: {@code { content, page, totalPages, totalElements }}. */
public record PageResponse<T>(java.util.List<T> content, int page, int totalPages, long totalElements) {
}