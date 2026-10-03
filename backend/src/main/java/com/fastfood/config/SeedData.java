package com.fastfood.config;

import com.fastfood.domain.PromoCode;
import com.fastfood.domain.PromoType;
import com.fastfood.domain.Review;

import java.util.ArrayList;
import java.util.List;

/** Promo codes and review copy (mirrors promoCodes and reviewPool in the frontend mocks). */
public final class SeedData {

    private static final Object[][] REVIEW_POOL = {
            {"Priya S.", 5, "Arrived piping hot and exactly what I ordered. The packaging was great too.", "2 days ago"},
            {"Jordan M.", 5, "Best in the neighborhood. Portion sizes are generous and the flavors are spot on.", "4 days ago"},
            {"Elena R.", 4, "Really tasty, slightly late during the dinner rush but the rider was lovely.", "1 week ago"},
            {"Tom W.", 5, "Ordered for the whole office and everyone was happy. Will reorder.", "1 week ago"},
            {"Aisha K.", 4, "Fresh and well seasoned. I would add the extras next time, they are worth it.", "2 weeks ago"},
            {"Diego L.", 5, "Five stars for the speed alone. Food was incredible.", "3 weeks ago"}
    };

    private SeedData() {
    }

    public static List<PromoCode> promos() {
        return List.of(
                new PromoCode("RUSH20", PromoType.PERCENT, 20, "20% off your food", 0),
                new PromoCode("WELCOME10", PromoType.PERCENT, 10, "10% off your order", 0),
                new PromoCode("FREESHIP", PromoType.SHIPPING, 100, "Free delivery", 0),
                new PromoCode("SAVE5", PromoType.FLAT, 5, "$5 off", 0));
    }

    /** Four reviews per restaurant, rotated through the pool like the frontend mock does. */
    public static List<Review> reviews(List<String> restaurantIds) {
        List<Review> reviews = new ArrayList<>();
        for (String restaurantId : restaurantIds) {
            int start = numericId(restaurantId) % REVIEW_POOL.length;
            for (int offset = 0; offset < 4; offset++) {
                Object[] entry = REVIEW_POOL[(start + offset) % REVIEW_POOL.length];
                reviews.add(new Review(
                        "rev-" + restaurantId + "-" + (offset + 1),
                        restaurantId,
                        (String) entry[0],
                        ((Number) entry[1]).intValue(),
                        (String) entry[2],
                        (String) entry[3],
                        offset));
            }
        }
        return reviews;
    }

    private static int numericId(String restaurantId) {
        StringBuilder digits = new StringBuilder();
        for (char character : restaurantId.toCharArray()) {
            if (Character.isDigit(character)) {
                digits.append(character);
            }
        }
        return digits.isEmpty() ? 0 : Integer.parseInt(digits.toString());
    }
}