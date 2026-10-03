package com.fastfood;

import com.fastfood.config.SeedData;
import com.fastfood.config.SeedMenus;
import com.fastfood.config.SeedRestaurants;
import com.fastfood.domain.MenuItem;
import com.fastfood.domain.PromoCode;
import com.fastfood.domain.Restaurant;
import com.fastfood.domain.Review;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/** Validates the seed data without touching a database. */
class SeedDataTest {

    @Test
    void seedsSixteenRestaurantsWithTheExpectedFlags() {
        List<Restaurant> restaurants = SeedRestaurants.all();

        assertThat(restaurants).hasSize(16);
        assertThat(restaurants).extracting(Restaurant::getId)
                .containsExactly("r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8",
                        "r9", "r10", "r11", "r12", "r13", "r14", "r15", "r16");

        assertThat(restaurants).allSatisfy(restaurant -> {
            assertThat(restaurant.getName()).isNotBlank();
            assertThat(restaurant.getCuisine()).isNotBlank();
            assertThat(restaurant.getTags()).isNotEmpty();
            assertThat(restaurant.getDeliveryFee()).isGreaterThanOrEqualTo(0);
        });

        // Only Luna Taqueria (r6) is still awaiting admin approval.
        assertThat(restaurants).filteredOn(restaurant -> !restaurant.isApproved())
                .extracting(Restaurant::getId)
                .containsExactly("r6");

        Restaurant stacked = restaurants.stream().filter(r -> r.getId().equals("r1")).findFirst().orElseThrow();
        assertThat(stacked.getRating()).isEqualTo(4.8);
        assertThat(stacked.getMinOrder()).isEqualTo(12.0);
        assertThat(stacked.getEtaMin()).isEqualTo(22);
    }

    @Test
    void seedsFullMenusForEveryRestaurant() {
        Map<String, List<MenuItem>> menus = SeedMenus.all();

        assertThat(menus).hasSize(16);
        assertThat(menus.values().stream().mapToInt(List::size).sum()).isEqualTo(120);
        assertThat(menus.values()).allSatisfy(menu -> assertThat(menu).isNotEmpty());

        Set<String> ids = new HashSet<>();
        menus.values().forEach(menu -> menu.forEach(item -> {
            assertThat(ids.add(item.getId())).as("duplicate dish id %s", item.getId()).isTrue();
            assertThat(item.getRestaurantId()).isNotBlank();
            assertThat(item.getName()).isNotBlank();
            assertThat(item.getPrice()).isGreaterThan(0);
            assertThat(item.getImage()).startsWith("https://images.unsplash.com/photo-");
        }));

        List<MenuItem> stackedMenu = menus.get("r1");
        assertThat(stackedMenu).hasSize(11);
        assertThat(stackedMenu.get(0).getId()).isEqualTo("r1-1");
        assertThat(stackedMenu.get(0).getName()).isEqualTo("The Rush Crispy Double");
        assertThat(stackedMenu.get(0).isBestseller()).isTrue();
        assertThat(stackedMenu.get(0).getCalories()).isEqualTo(780);
        assertThat(stackedMenu.get(0).getOptions()).hasSize(2);
        assertThat(stackedMenu.get(0).getOptions().get(0).getChoices()).hasSize(2);

        // "Salted Caramel Shake" is deliberately out of stock and "Garden Crunch" is veggie.
        assertThat(stackedMenu.get(8).getName()).isEqualTo("Salted Caramel Shake");
        assertThat(stackedMenu.get(8).isAvailable()).isFalse();
        assertThat(stackedMenu.get(4).isVeg()).isTrue();

        assertThat(menus.values().stream().flatMap(List::stream).filter(MenuItem::isBestseller))
                .isNotEmpty();
    }

    @Test
    void seedsPromosAndRotatedReviews() {
        List<PromoCode> promos = SeedData.promos();
        assertThat(promos).extracting(PromoCode::getCode)
                .containsExactlyInAnyOrder("RUSH20", "WELCOME10", "FREESHIP", "SAVE5");
        assertThat(promos).allSatisfy(promo -> assertThat(promo.isActive()).isTrue());
        assertThat(promos.stream().filter(p -> p.getCode().equals("RUSH20")).findFirst().orElseThrow().getType().wireValue())
                .isEqualTo("percent");

        List<String> ids = SeedRestaurants.all().stream().map(Restaurant::getId).toList();
        List<Review> reviews = SeedData.reviews(ids);
        assertThat(reviews).hasSize(ids.size() * 4);
        assertThat(reviews).allSatisfy(review -> {
            assertThat(review.getRating()).isBetween(1, 5);
            assertThat(review.getText()).isNotBlank();
            assertThat(review.getRestaurantId()).isNotBlank();
        });
        assertThat(reviews.stream().map(Review::getId)).doesNotHaveDuplicates();
    }
}