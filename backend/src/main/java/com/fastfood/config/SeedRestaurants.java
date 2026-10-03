package com.fastfood.config;

import com.fastfood.domain.Restaurant;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static com.fastfood.config.SeedPhotos.BREAKFAST;
import static com.fastfood.config.SeedPhotos.BURGER;
import static com.fastfood.config.SeedPhotos.CHICKEN;
import static com.fastfood.config.SeedPhotos.DESSERT;
import static com.fastfood.config.SeedPhotos.DUMPLING;
import static com.fastfood.config.SeedPhotos.INDIAN;
import static com.fastfood.config.SeedPhotos.PIZZA;
import static com.fastfood.config.SeedPhotos.RAMEN;
import static com.fastfood.config.SeedPhotos.SALAD;
import static com.fastfood.config.SeedPhotos.SUSHI;
import static com.fastfood.config.SeedPhotos.TACO;
import static com.fastfood.config.SeedPhotos.photo;

/** The 16 seeded restaurants (mirrors {@code restaurants} in the frontend mocks). */
public final class SeedRestaurants {

    private SeedRestaurants() {
    }

    /** id, name, cuisine, rating, reviews, eta, etaMin, fee, image, priceLevel, minOrder, distance, promo, badge, tags(|), address, hours, popularity, veg, approved, description. */
    private static final Object[][] FIRST_HALF = {
            {"r1", "Stacked & Smashed", "Burgers", 4.8, 312, "20\u201325 min", 22, 1.99, photo(BURGER[1]), 2, 12, 1.2,
                    "20% off with RUSH20", "Top rated", "Chicken burgers|Fries|Shakes", "214 Mission Street, San Francisco",
                    "10:30 AM \u2013 11:30 PM", 98, false, true, "Crispy chicken burgers, loaded fries, and house-made sauces."},
            {"r2", "Nonna's Corner", "Italian", 4.7, 228, "25\u201335 min", 30, 0.0, photo(PIZZA[0]), 2, 15, 2.1,
                    "Free delivery", "Chef's pick", "Wood-fired pizza|Handmade pasta|Tiramisu", "88 Columbus Avenue, San Francisco",
                    "11:00 AM \u2013 10:30 PM", 91, true, true, "Stone-fired pizza made with a slow-fermented dough, plus pasta rolled by hand every morning."},
            {"r3", "Greenhouse", "Healthy", 4.9, 187, "15\u201320 min", 18, 1.49, photo(SALAD[3]), 2, 10, 0.8,
                    "Buy 2 bowls, get a juice", "Fastest", "Bowls|Vegan|Gluten-free options", "42 Hayes Street, San Francisco",
                    "8:00 AM \u2013 9:00 PM", 86, true, true, "Bright bowls, crunchy greens, and feel-good fuel."},
            {"r4", "Spice Route", "Indian", 4.6, 406, "30\u201340 min", 35, 2.49, photo(INDIAN[0]), 2, 18, 3.0,
                    "15% off first order", "Most loved", "Curries|Tandoor|Biryani", "17 Valencia Street, San Francisco",
                    "11:30 AM \u2013 11:00 PM", 94, true, true, "Slow-cooked curries and tandoor favorites with bold spice."},
            {"r5", "Maki Social", "Japanese", 4.8, 152, "25\u201330 min", 28, 2.99, photo(SUSHI[0]), 3, 20, 1.9,
                    "Free miso soup over $30", "Fresh daily", "Sushi|Veg rolls|Gyoza", "301 Geary Street, San Francisco",
                    "12:00 PM \u2013 10:00 PM", 82, false, true, "Hand-rolled sushi and Japanese comfort food."},
            {"r6", "Luna Taqueria", "Mexican", 4.5, 275, "20\u201330 min", 25, 1.99, photo(TACO[1]), 1, 10, 1.5,
                    "", "", "Tacos|Burritos|Churros", "9 Folsom Street, San Francisco",
                    "11:00 AM \u2013 12:00 AM", 80, false, false, "Street-style tacos with bright salsas and smoky fillings."},
            {"r7", "Crown & Coop", "Chicken", 4.7, 341, "20\u201330 min", 25, 0.99, photo(CHICKEN[1]), 1, 12, 1.7,
                    "Family bucket $5 off", "Crowd favorite", "Fried chicken|Wings|Biscuits", "560 Divisadero Street, San Francisco",
                    "11:00 AM \u2013 11:00 PM", 96, false, true, "Buttermilk-brined fried chicken, Nashville hot wings and fluffy honey biscuits."},
            {"r8", "Ember & Oak", "Grill", 4.8, 119, "35\u201345 min", 40, 3.49, photo(CHICKEN[1]), 3, 20, 3.6,
                    "Complimentary dessert over $40", "Premium", "Oak grill|Free-range chicken|Veg options", "1 Embarcadero Center, San Francisco",
                    "4:00 PM \u2013 11:00 PM", 70, false, true, "Free-range chicken and seasonal vegetables, brined in house and finished over oak embers."}
    };

    private static final Object[][] SECOND_HALF = {
            {"r9", "Golden Dragon", "Chinese", 4.6, 263, "25\u201335 min", 30, 1.49, photo(DUMPLING[0]), 2, 15, 2.4,
                    "Free dumplings over $35", "", "Dim sum|Noodles|Wok classics", "720 Grant Avenue, San Francisco",
                    "11:00 AM \u2013 10:30 PM", 88, true, true, "Hand-folded dumplings, hand-pulled noodles and blazing wok classics."},
            {"r10", "Sunny Side Caf\u00e9", "Breakfast", 4.7, 204, "15\u201325 min", 20, 0.99, photo(BREAKFAST[3]), 2, 10, 1.1,
                    "Breakfast all day", "All-day brunch", "Pancakes|Eggs|Coffee", "35 Fillmore Street, San Francisco",
                    "7:00 AM \u2013 3:00 PM", 84, true, true, "Fluffy pancakes, farm eggs and slow-poured coffee, served until close."},
            {"r11", "Sugar Rush Bakery", "Desserts", 4.9, 298, "15\u201325 min", 20, 1.49, photo(DESSERT[3]), 2, 8, 0.9,
                    "Buy 3 slices, get 1 free", "Sweet pick", "Cakes|Shakes|Pastries", "128 Polk Street, San Francisco",
                    "9:00 AM \u2013 11:00 PM", 90, true, true, "Slice-of-heaven cakes, thick shakes and warm pastries, baked this morning."},
            {"r12", "Noodle Lab", "Japanese", 4.7, 177, "20\u201330 min", 25, 1.99, photo(RAMEN[0]), 2, 14, 1.6,
                    "Extra egg on us", "Cozy bowls", "Ramen|Gyoza|Rice bowls", "66 Post Street, San Francisco",
                    "11:30 AM \u2013 10:00 PM", 87, false, true, "Eighteen-hour tonkotsu broth, springy house noodles and crisp gyoza."},
            {"r13", "Tandoori Nights", "Indian", 4.7, 268, "25\u201335 min", 30, 1.99, photo(INDIAN[2]), 2, 13, 1.8,
                    "Free naan over $25", "Tandoor classics", "Tandoori|Kebabs|Naan", "482 Valencia Street, San Francisco",
                    "11:00 AM \u2013 11:30 PM", 91, false, true, "Clay-oven tandoori chicken, kebabs and fresh-baked breads, charred the traditional way."},
            {"r14", "Masala Dosa House", "Indian", 4.8, 341, "20\u201330 min", 25, 1.49, photo(INDIAN[1]), 2, 9, 1.3,
                    "Free chutney trio", "South Indian", "Dosa|Idli|Filter coffee", "90 Irving Street, San Francisco",
                    "8:00 AM \u2013 10:30 PM", 93, true, true, "Crisp rice-lentil dosas, fluffy idlis and sambar made fresh every morning. Fully vegetarian."},
            {"r15", "Biryani Bazaar", "Indian", 4.6, 223, "30\u201340 min", 35, 2.29, photo(INDIAN[3]), 1, 15, 2.2,
                    "Raita on the house", "Biryani specialists", "Biryani|Kebabs|Raita", "15 Clement Street, San Francisco",
                    "12:00 PM \u2013 11:00 PM", 88, false, true, "Slow-cooked dum biryanis sealed and steamed with saffron, whole spices and fried onion."},
            {"r16", "Chaat & Chai", "Indian", 4.7, 189, "15\u201325 min", 20, 0.99, photo(INDIAN[4]), 1, 8, 0.8,
                    "Chai + samosa $5.99", "Street food", "Chaat|Samosa|Chai", "312 Hayes Street, San Francisco",
                    "10:00 AM \u2013 10:00 PM", 86, true, true, "Mumbai-style street snacks, tangy chaats and masala chai. Pure vegetarian."}
    };

    public static List<Restaurant> all() {
        List<Restaurant> restaurants = new ArrayList<>();
        Arrays.stream(FIRST_HALF).forEach(row -> restaurants.add(build(row)));
        Arrays.stream(SECOND_HALF).forEach(row -> restaurants.add(build(row)));
        return restaurants;
    }

    private static Restaurant build(Object[] row) {
        Restaurant r = new Restaurant();
        r.setId((String) row[0]);
        r.setName((String) row[1]);
        r.setCuisine((String) row[2]);
        r.setRating(dbl(row[3]));
        r.setReviews((int) dbl(row[4]));
        r.setEta((String) row[5]);
        r.setEtaMin((int) dbl(row[6]));
        r.setDeliveryFee(dbl(row[7]));
        r.setImage((String) row[8]);
        r.setPriceLevel((int) dbl(row[9]));
        r.setMinOrder(dbl(row[10]));
        r.setDistance(dbl(row[11]));
        r.setPromo((String) row[12]);
        r.setBadge((String) row[13]);
        r.setTags(Arrays.stream(((String) row[14]).split("\\|")).map(String::trim)
                .filter(tag -> !tag.isEmpty()).toList());
        r.setAddress((String) row[15]);
        r.setHours((String) row[16]);
        r.setPopularity((int) dbl(row[17]));
        r.setVeg((Boolean) row[18]);
        r.setApproved((Boolean) row[19]);
        r.setDescription((String) row[20]);
        return r;
    }

    private static double dbl(Object value) {
        return ((Number) value).doubleValue();
    }
}