package com.fastfood.config;

import com.fastfood.domain.MenuItem;
import com.fastfood.domain.OptionGroup;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static com.fastfood.config.SeedPhotos.BREAKFAST;
import static com.fastfood.config.SeedPhotos.BURGER;
import static com.fastfood.config.SeedPhotos.CHICKEN;
import static com.fastfood.config.SeedPhotos.COFFEE;
import static com.fastfood.config.SeedPhotos.DESSERT;
import static com.fastfood.config.SeedPhotos.DUMPLING;
import static com.fastfood.config.SeedPhotos.FRIES;
import static com.fastfood.config.SeedPhotos.INDIAN;
import static com.fastfood.config.SeedPhotos.PASTA;
import static com.fastfood.config.SeedPhotos.PIZZA;
import static com.fastfood.config.SeedPhotos.RAMEN;
import static com.fastfood.config.SeedPhotos.SALAD;
import static com.fastfood.config.SeedPhotos.SHAKE;
import static com.fastfood.config.SeedPhotos.SUSHI;
import static com.fastfood.config.SeedPhotos.TACO;
import static com.fastfood.config.SeedPhotos.photo;

/** Full dish menus for the 16 seeded restaurants (mirrors {@code menu} in the frontend mocks). */
public final class SeedMenus {

    private static final Map<String, List<OptionGroup>> TEMPLATES = SeedOptions.templates();

    private SeedMenus() {
    }

    /** rid, index, name, description, price, image, category, flags. */
    private static final Object[][] ROWS = {
            {"r1", 0, "The Rush Crispy Double", "Double crispy chicken, American cheddar, pickles, caramelized onion, rush sauce", 12.5, photo(BURGER[1]), "Popular", "bestseller,o=burger,cal=780"},
            {"r1", 1, "Hot Honey Chicken", "Crispy chicken thigh, slaw, pickled jalape\u00f1o, hot honey glaze", 11.5, photo(BURGER[2]), "Popular", "bestseller,spicy=2,o=burger"},
            {"r1", 2, "Classic Chicken Cheeseburger", "Crispy chicken, melted cheese, lettuce, tomato, house pickles", 10.5, photo(BURGER[0]), "Burgers", "o=burger"},
            {"r1", 3, "Smokehouse BBQ Chicken", "Grilled chicken, onion ring, smoky BBQ, sharp cheddar", 13.5, photo(BURGER[3]), "Burgers", "o=burger"},
            {"r1", 4, "Garden Crunch", "Crispy halloumi patty, avocado, sprouts, chipotle mayo", 11.0, photo(BURGER[4]), "Burgers", "veg,o=burger"},
            {"r1", 5, "Loaded Rush Fries", "Cheese sauce, crispy onions, scallions, rush sauce", 6.5, photo(FRIES[0]), "Sides", "veg,bestseller,o=side"},
            {"r1", 6, "Sea Salt Fries", "Skin-on, double-fried and finished with flaky salt", 4.5, photo(FRIES[1]), "Sides", "veg,o=side"},
            {"r1", 7, "Truffle Parmesan Fries", "Shoestring fries, truffle oil, shaved parmesan", 7.25, photo(FRIES[2]), "Sides", "veg,o=side"},
            {"r1", 8, "Salted Caramel Shake", "Vanilla custard, caramel, sea salt", 5.75, photo(SHAKE[0]), "Drinks", "veg,unavailable,o=drink"},
            {"r1", 9, "Strawberry Cream Shake", "Real strawberries blended into thick vanilla custard", 5.75, photo(SHAKE[2]), "Drinks", "veg,o=drink"},
            {"r1", 10, "Iced Vanilla Latte", "Double espresso over ice with vanilla and oat milk", 4.5, photo(COFFEE[0]), "Drinks", "veg,o=drink"},
            {"r2", 0, "Margherita Napoletana", "San Marzano tomato, fior di latte, basil, olive oil", 13.0, photo(PIZZA[0]), "Pizza", "veg,bestseller,o=pizza"},
            {"r2", 1, "Funghi e Tartufo", "Wild mushrooms, truffle cream, mozzarella, thyme", 15.0, photo(PIZZA[1]), "Pizza", "veg,o=pizza"},
            {"r2", 2, "Quattro Formaggi", "Mozzarella, gorgonzola, parmesan, fontina, black pepper", 15.5, photo(PIZZA[2]), "Pizza", "veg,o=pizza"},
            {"r2", 3, "Pollo Pesto Pizza", "Roast chicken, basil pesto, arugula, shaved grana", 16.5, photo(PIZZA[3]), "Pizza", "o=pizza"},
            {"r2", 4, "Spaghetti Pomodoro", "Slow-cooked tomato, basil, extra-virgin olive oil", 12.5, photo(PASTA[1]), "Pasta", "veg,bestseller"},
            {"r2", 5, "Pesto Trofie", "Basil pesto, green beans, potato, pine nuts", 14.0, photo(PASTA[3]), "Pasta", "veg"},
            {"r2", 6, "Tagliatelle al Pollo", "Slow-cooked chicken rag\u00f9, white wine, parmigiano", 16.0, photo(PASTA[0]), "Pasta", "bestseller"},
            {"r2", 7, "Cacio e Pepe", "Tonnarelli, pecorino romano, cracked pepper", 14.5, photo(PASTA[2]), "Pasta", "veg"},
            {"r2", 8, "Classic Tiramisu", "Espresso-soaked savoiardi, mascarpone, cocoa", 7.5, photo(DESSERT[2]), "Dessert", "veg"},
            {"r2", 9, "Italian Soda", "Blood orange, sparkling water, mint", 3.75, photo(COFFEE[2]), "Drinks", "veg,o=drink"},
            {"r3", 0, "Harvest Power Bowl", "Quinoa, roasted sweet potato, kale, chickpeas, tahini", 13.5, photo(SALAD[3]), "Popular", "veg,bestseller,o=bowl"},
            {"r3", 1, "Green Goddess Salad", "Little gem, cucumber, avocado, herbs, green goddess dressing", 12.0, photo(SALAD[1]), "Salads", "veg,o=bowl"},
            {"r3", 2, "Rainbow Crunch Bowl", "Red cabbage, carrot, edamame, mango, peanut-lime dressing", 12.5, photo(SALAD[0]), "Bowls", "veg,o=bowl"},
            {"r3", 3, "Mediterranean Bowl", "Falafel, hummus, tabbouleh, pickled onion, tzatziki", 13.0, photo(SALAD[2]), "Bowls", "veg,bestseller,o=bowl"},
            {"r3", 4, "Teriyaki Chicken Bowl", "Glazed chicken, brown rice, cucumber, sesame, pickled ginger", 15.5, photo(SUSHI[2]), "Bowls", "o=bowl"},
            {"r3", 5, "Berry Acai Smoothie", "Acai, blueberry, banana, almond milk", 7.5, photo(SHAKE[1]), "Drinks", "veg,o=drink"},
            {"r3", 6, "Cold-Pressed Green Juice", "Apple, cucumber, spinach, ginger, lemon", 6.5, photo(COFFEE[1]), "Drinks", "veg,o=drink"},
            {"r4", 0, "Butter Chicken", "Tandoor-roasted chicken in tomato-cream gravy with fenugreek", 15.5, photo(INDIAN[0]), "Popular", "bestseller,o=spice"},
            {"r4", 1, "Chicken Tikka Masala", "Charred tikka simmered in spiced onion-tomato masala", 15.0, photo(INDIAN[2]), "Popular", "spicy=2,o=spice"},
            {"r4", 2, "Paneer Tikka Plate", "Smoky marinated paneer, peppers, mint chutney", 13.5, photo(INDIAN[1]), "Tandoor", "veg,bestseller,o=spice"},
            {"r4", 3, "Egg Curry", "Boiled eggs in a rich Kashmiri onion-tomato gravy", 13.5, photo(INDIAN[4]), "Curries", "spicy=2,o=spice"},
            {"r4", 4, "Dal Makhani", "Black lentils simmered overnight with butter and cream", 12.5, photo(INDIAN[3]), "Curries", "veg,o=spice"},
            {"r4", 5, "Chicken Dum Biryani", "Saffron basmati layered with spiced chicken and fried onion", 16.0, photo(INDIAN[2]), "Rice", "spicy=1,bestseller,o=spice"},
            {"r4", 6, "Garlic Butter Naan", "Tandoor-baked, brushed with garlic butter", 3.5, photo(INDIAN[1]), "Breads", "veg"},
            {"r4", 7, "Mango Lassi", "Alphonso mango, yoghurt, cardamom", 4.75, photo(SHAKE[1]), "Drinks", "veg,o=drink"},
            {"r5", 0, "Rainbow Veggie Roll", "Avocado, mango, cucumber and carrot over crunchy roll", 14.0, photo(SUSHI[0]), "Rolls", "veg,bestseller"},
            {"r5", 1, "Sweet Potato Tempura Roll", "Tempura sweet potato, cucumber, avocado, teriyaki glaze", 13.0, photo(SUSHI[1]), "Rolls", "veg"},
            {"r5", 2, "Spicy Chicken Crunch", "Chicken katsu, spicy mayo, tempura flakes, sriracha", 13.5, photo(SUSHI[2]), "Rolls", "spicy=2,bestseller"},
            {"r5", 3, "Tamago & Inari Set (8 pc)", "Sweet egg omelette and tofu-pocket nigiri, shaved wasabi", 18.0, photo(SUSHI[0]), "Platters", "veg"},
            {"r5", 4, "Veggie Maki Trio", "Cucumber, avocado and pickled radish rolls", 11.0, photo(SUSHI[2]), "Rolls", "veg"},
            {"r5", 5, "Chicken Gyoza (6 pc)", "Pan-seared chicken dumplings, ponzu dip", 8.0, photo(DUMPLING[1]), "Starters", ""},
            {"r5", 6, "Edamame", "Warm, sea salt", 5.0, photo(SALAD[2]), "Starters", "veg"},
            {"r6", 0, "Pollo Asado Tacos", "Three tacos, grilled chicken thigh, onion, cilantro, salsa verde", 12.0, photo(TACO[0]), "Tacos", "bestseller,spicy=1"},
            {"r6", 1, "Chicken Al Pastor Tacos", "Three tacos, spit-roasted chicken, pineapple", 11.5, photo(TACO[1]), "Tacos", ""},
            {"r6", 2, "Loaded Nachos", "Queso, black beans, pico, jalape\u00f1o, crema", 10.0, photo(TACO[2]), "Sharing", "veg"},
            {"r7", 0, "Nashville Hot Wings (8 pc)", "Crisp wings tossed in cayenne oil, pickles, ranch", 12.5, photo(CHICKEN[3]), "Popular", "bestseller,spicy=3,o=wings"},
            {"r7", 1, "Buttermilk Fried Chicken (3 pc)", "24-hour brine, double-dredged, with honey biscuit", 13.0, photo(CHICKEN[1]), "Popular", "bestseller"},
            {"r7", 2, "Crown Sandwich", "Fried thigh, pickles, slaw, brioche, hot honey mayo", 11.5, photo(CHICKEN[2]), "Sandwiches", "spicy=1"},
            {"r7", 3, "Family Bucket (8 pc)", "Eight pieces, 2 large sides, 4 biscuits", 34.0, photo(CHICKEN[0]), "Buckets", "bestseller"},
            {"r7", 4, "Tender Box", "Four hand-breaded tenders, fries, dipping sauce", 11.0, photo(CHICKEN[0]), "Sandwiches", ""},
            {"r7", 5, "Crispy Fries", "Seasoned, golden", 4.0, photo(FRIES[0]), "Sides", "veg,o=side"},
            {"r7", 6, "Honey Biscuit", "Flaky, buttery, honey-brushed", 3.0, photo(BREAKFAST[3]), "Sides", "veg"},
            {"r7", 7, "Chocolate Cookie Shake", "Cookies, chocolate, thick vanilla ice cream", 6.0, photo(SHAKE[0]), "Drinks", "veg,o=drink"},
            {"r8", 0, "Oak-Grilled Half Chicken", "Brined overnight, grilled over oak, herb butter", 26.0, photo(CHICKEN[1]), "Grill", "bestseller,o=grill"},
            {"r8", 1, "Rosemary Chicken Breast", "Free-range breast, rosemary jus, charred lemon", 24.0, photo(CHICKEN[2]), "Grill", "o=grill"},
            {"r8", 2, "Cauliflower Steak", "Thick-cut roasted cauliflower, chimichurri, almonds", 19.0, photo(SALAD[2]), "Grill", "veg,o=grill"},
            {"r8", 3, "Oak-Smoked Chicken Thighs", "Rosemary, mint salsa verde, charred lemon", 22.0, photo(CHICKEN[0]), "Grill", ""},
            {"r8", 4, "Truffle Mashed Potatoes", "Yukon gold, black truffle butter", 9.0, photo(FRIES[1]), "Sides", "veg"},
            {"r8", 5, "Burrata & Heirloom Tomato", "Basil oil, aged balsamic, grilled sourdough", 16.0, photo(SALAD[2]), "Starters", "veg"},
            {"r8", 6, "Molten Chocolate Cake", "Warm dark chocolate center, vanilla cream", 12.0, photo(DESSERT[2]), "Dessert", "veg,bestseller"},
            {"r9", 0, "Chicken & Ginger Soup Dumplings (6 pc)", "Soup dumplings with chicken and ginger", 10.0, photo(DUMPLING[0]), "Dim Sum", "bestseller"},
            {"r9", 1, "Pan-Fried Chicken Dumplings", "Crisp-bottomed, black vinegar dip", 9.5, photo(DUMPLING[1]), "Dim Sum", ""},
            {"r9", 2, "Veggie Steamed Dumplings", "Shiitake, cabbage, tofu", 8.5, photo(DUMPLING[2]), "Dim Sum", "veg"},
            {"r9", 3, "Dan Dan Noodles", "Sichuan peppercorn, minced chicken, chili oil, peanuts", 13.0, photo(RAMEN[2]), "Noodles", "spicy=3,bestseller"},
            {"r9", 4, "Egg Chow Fun", "Wok-seared flat rice noodles, scrambled egg, scallion, bean sprouts", 13.5, photo(RAMEN[1]), "Noodles", ""},
            {"r9", 5, "Kung Pao Chicken", "Dried chili, roasted peanuts, scallion", 14.0, photo(CHICKEN[2]), "Wok", "spicy=2"},
            {"r9", 6, "Garlic Bok Choy", "Flash-fried with garlic", 8.0, photo(SALAD[2]), "Wok", "veg"},
            {"r10", 0, "Buttermilk Pancake Stack", "Three fluffy pancakes, maple butter, berries", 11.0, photo(BREAKFAST[1]), "Popular", "veg,bestseller"},
            {"r10", 1, "Blueberry Banana Pancakes", "Whole-wheat batter, warm blueberry compote", 11.5, photo(BREAKFAST[0]), "Pancakes", "veg"},
            {"r10", 2, "Berry Cream Stack", "Pancakes layered with vanilla cream and strawberries", 12.0, photo(BREAKFAST[2]), "Pancakes", "veg,bestseller"},
            {"r10", 3, "Maple Pancakes & Fried Egg", "Classic stack with two sunny-side eggs", 12.5, photo(BREAKFAST[3]), "Pancakes", ""},
            {"r10", 4, "Avocado Toast", "Sourdough, smashed avocado, chili flakes, poached egg", 10.5, photo(SALAD[0]), "Savory", "veg"},
            {"r10", 5, "Iced Oat Latte", "Double espresso, oat milk, brown sugar", 4.75, photo(COFFEE[0]), "Coffee", "veg,o=drink"},
            {"r10", 6, "Cold Brew", "18-hour steeped, served over ice", 4.25, photo(COFFEE[1]), "Coffee", "veg,o=drink"},
            {"r11", 0, "Strawberry Shortcake Slice", "Vanilla sponge, whipped cream, fresh strawberries", 7.5, photo(DESSERT[1]), "Cakes", "veg,bestseller"},
            {"r11", 1, "Chocolate Truffle Cake", "Dark chocolate ganache, cocoa sponge", 7.75, photo(DESSERT[2]), "Cakes", "veg,bestseller"},
            {"r11", 2, "Vanilla Cloud Cake", "Light vanilla sponge, chocolate drizzle", 7.0, photo(DESSERT[0]), "Cakes", "veg"},
            {"r11", 3, "Fruit Tart Trio", "Custard tarts with seasonal berries", 9.5, photo(DESSERT[3]), "Pastries", "veg"},
            {"r11", 4, "Cookies & Cream Shake", "Hand-spun, loaded with chocolate cookie", 6.5, photo(SHAKE[0]), "Shakes", "veg,o=drink"},
            {"r11", 5, "Vanilla Bean Shake", "Madagascan vanilla, whipped cream", 6.25, photo(SHAKE[1]), "Shakes", "veg,o=drink"},
            {"r11", 6, "Strawberry Milkshake", "Fresh berries, cream, a cherry on top", 6.5, photo(SHAKE[2]), "Shakes", "veg,o=drink"},
            {"r12", 0, "Tori Paitan Ramen", "Creamy chicken broth, roast chicken, ajitama egg, nori, scallion", 15.0, photo(RAMEN[0]), "Ramen", "bestseller"},
            {"r12", 1, "Spicy Miso Ramen", "Chili miso broth, ground chicken, corn, bean sprouts", 15.5, photo(RAMEN[1]), "Ramen", "spicy=2,bestseller"},
            {"r12", 2, "Shoyu Chicken Ramen", "Clear soy broth, roast chicken, bamboo shoot", 14.0, photo(RAMEN[2]), "Ramen", ""},
            {"r12", 3, "Veggie Shiitake Ramen", "Kombu & shiitake broth, tofu, bok choy", 13.5, photo(RAMEN[2]), "Ramen", "veg"},
            {"r12", 4, "Chicken Gyoza (6 pc)", "Crisp-seared, ponzu", 7.5, photo(DUMPLING[1]), "Sides", ""},
            {"r12", 5, "Karaage Chicken", "Japanese fried chicken, yuzu mayo", 8.5, photo(CHICKEN[2]), "Sides", ""},
            {"r12", 6, "Matcha Cheesecake", "Silky matcha cheesecake, black sesame", 7.0, photo(DESSERT[3]), "Dessert", "veg"},
            {"r13", 0, "Tandoori Chicken (Half)", "Yoghurt-marinated, clay-oven roasted, mint chutney", 14.5, photo(INDIAN[0]), "Tandoor", "bestseller,spicy=1,o=spice"},
            {"r13", 1, "Chicken Seekh Kebab", "Minced chicken, herbs and green chili off the skewer", 12.5, photo(INDIAN[2]), "Tandoor", "spicy=2,o=spice"},
            {"r13", 2, "Achari Paneer Tikka", "Pickled-spice paneer, charred peppers", 13.0, photo(INDIAN[1]), "Tandoor", "veg,bestseller,o=spice"},
            {"r13", 3, "Tandoori Gobi", "Spiced cauliflower roasted in the tandoor", 10.5, photo(INDIAN[4]), "Tandoor", "veg,vegan"},
            {"r13", 4, "Malai Chicken Tikka", "Creamy cashew-cheese marinade, mild and juicy", 14.0, photo(INDIAN[2]), "Tandoor", ""},
            {"r13", 5, "Butter Naan", "Soft tandoor-baked bread with butter", 3.0, photo(INDIAN[1]), "Breads", "veg"},
            {"r13", 6, "Laccha Paratha", "Flaky layered whole-wheat bread", 3.5, photo(INDIAN[3]), "Breads", "veg"},
            {"r13", 7, "Boondi Raita", "Cooling yoghurt with crisp gram-flour pearls", 4.0, photo(INDIAN[4]), "Sides", "veg"},
            {"r14", 0, "Masala Dosa", "Crisp rice crepe, spiced potato, coconut chutney, sambar", 10.5, photo(INDIAN[3]), "Dosa", "veg,bestseller"},
            {"r14", 1, "Mysore Masala Dosa", "Fiery red chutney spread inside the crepe", 11.5, photo(INDIAN[3]), "Dosa", "veg,spicy=2"},
            {"r14", 2, "Paneer Dosa", "Dosa stuffed with spiced paneer bhurji", 12.0, photo(INDIAN[1]), "Dosa", "veg"},
            {"r14", 3, "Idli Sambar (3 pc)", "Steamed rice cakes, sambar, two chutneys", 8.0, photo(INDIAN[4]), "Breakfast", "veg,vegan,bestseller"},
            {"r14", 4, "Medu Vada (2 pc)", "Crisp lentil doughnuts with sambar", 7.5, photo(INDIAN[4]), "Breakfast", "veg,vegan"},
            {"r14", 5, "Uttapam", "Thick rice pancake with onion, tomato and chili", 9.5, photo(INDIAN[3]), "Breakfast", "veg"},
            {"r14", 6, "Egg Podi Dosa", "Dosa with spiced egg and gunpowder spice", 11.0, photo(INDIAN[3]), "Dosa", "spicy=1"},
            {"r14", 7, "Filter Coffee", "Frothy South Indian coffee with chicory", 3.75, photo(COFFEE[1]), "Drinks", "veg,o=drink"},
            {"r15", 0, "Chicken Dum Biryani", "Saffron basmati, tender chicken, sealed and slow steamed", 16.5, photo(INDIAN[2]), "Biryani", "bestseller,spicy=1,o=spice"},
            {"r15", 1, "Hyderabadi Egg Biryani", "Boiled eggs, mint, fried onion, aromatic rice", 13.5, photo(INDIAN[2]), "Biryani", "spicy=1,o=spice"},
            {"r15", 2, "Vegetable Biryani", "Seasonal vegetables, saffron, whole spices", 13.0, photo(INDIAN[2]), "Biryani", "veg,bestseller,o=spice"},
            {"r15", 3, "Paneer Biryani", "Marinated paneer layered with basmati", 14.0, photo(INDIAN[1]), "Biryani", "veg,o=spice"},
            {"r15", 4, "Chicken 65", "Crisp curry-leaf fried chicken, chili and garlic", 11.5, photo(INDIAN[2]), "Starters", "spicy=2"},
            {"r15", 5, "Mirchi Ka Salan", "Peanut-sesame chili gravy", 5.5, photo(INDIAN[4]), "Sides", "veg,vegan,spicy=1"},
            {"r15", 6, "Double Ka Meetha", "Fried-bread pudding, saffron milk, nuts", 6.5, photo(DESSERT[1]), "Dessert", "veg"},
            {"r16", 0, "Samosa Chaat", "Crushed samosa, chickpeas, yoghurt, tamarind, mint", 8.5, photo(INDIAN[4]), "Chaat", "veg,bestseller"},
            {"r16", 1, "Pani Puri (6 pc)", "Crisp shells, spiced water, potato, chickpea", 7.0, photo(INDIAN[4]), "Chaat", "veg,vegan,bestseller"},
            {"r16", 2, "Pav Bhaji", "Buttery mashed vegetable curry, toasted pav", 10.0, photo(INDIAN[3]), "Street food", "veg"},
            {"r16", 3, "Vada Pav", "Spiced potato fritter in a soft bun with garlic chutney", 6.0, photo(INDIAN[3]), "Street food", "veg,bestseller"},
            {"r16", 4, "Aloo Tikki Burger", "Potato patty, tamarind and mint chutneys", 8.5, photo(INDIAN[1]), "Street food", "veg"},
            {"r16", 5, "Egg Roll", "Paratha wrapped around spiced omelette and onions", 8.0, photo(INDIAN[1]), "Street food", ""},
            {"r16", 6, "Masala Chai", "Ginger, cardamom and tea simmered with milk", 3.5, photo(COFFEE[1]), "Drinks", "veg,o=drink"},
            {"r16", 7, "Gulab Jamun (3 pc)", "Warm milk dumplings in rose syrup", 6.0, photo(DESSERT[1]), "Dessert", "veg"}
    };

    public static Map<String, List<MenuItem>> all() {
        Map<String, List<MenuItem>> menus = new LinkedHashMap<>();
        for (Object[] row : ROWS) {
            MenuItem item = build(row);
            menus.computeIfAbsent(item.getRestaurantId(), key -> new ArrayList<>()).add(item);
        }
        return menus;
    }

    private static MenuItem build(Object[] row) {
        MenuItem item = new MenuItem();
        String restaurantId = (String) row[0];
        int index = ((Number) row[1]).intValue();
        item.setId(restaurantId + "-" + (index + 1));
        item.setRestaurantId(restaurantId);
        item.setName((String) row[2]);
        item.setDescription((String) row[3]);
        item.setPrice(((Number) row[4]).doubleValue());
        item.setImage((String) row[5]);
        item.setCategory((String) row[6]);
        item.setRating(Math.round((4.4 + ((index * 7) % 6) / 10.0) * 10.0) / 10.0);
        item.setCalories(320 + ((index * 83) % 520));
        item.setSortOrder(index);
        item.setVeg(false);
        item.setVegan(false);
        item.setAvailable(true);
        item.setBestseller(false);
        item.setSpicy(0);
        item.setOptions(new ArrayList<>());
        applyFlags(item, (String) row[7]);
        return item;
    }

    private static void applyFlags(MenuItem item, String flags) {
        if (flags == null || flags.isBlank()) {
            return;
        }
        for (String raw : flags.split(",")) {
            String flag = raw.trim();
            switch (flag) {
                case "veg" -> item.setVeg(true);
                case "vegan" -> item.setVegan(true);
                case "bestseller" -> item.setBestseller(true);
                case "unavailable" -> item.setAvailable(false);
                default -> {
                    if (flag.startsWith("spicy=")) {
                        item.setSpicy(Integer.parseInt(flag.substring(6)));
                    } else if (flag.startsWith("cal=")) {
                        item.setCalories(Integer.parseInt(flag.substring(4)));
                    } else if (flag.startsWith("o=")) {
                        item.setOptions(TEMPLATES.getOrDefault(flag.substring(2), List.of()));
                    }
                }
            }
        }
    }
}