package com.fastfood.dto;

/** One cart line sent when creating an order. */
public record OrderItemRequest(
        String id,
        String baseId,
        String menuItemId,
        String name,
        Double price,
        Integer quantity,
        String image,
        String customization
) {
    /** The stable menu item id, preferring {@code baseId} when present. */
    public String resolvedMenuItemId() {
        if (baseId != null && !baseId.isBlank()) {
            return baseId;
        }
        if (menuItemId != null && !menuItemId.isBlank()) {
            return menuItemId;
        }
        return id;
    }
}