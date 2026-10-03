package com.fastfood.config;

import com.fastfood.domain.OptionChoice;
import com.fastfood.domain.OptionGroup;

import java.util.List;
import java.util.Map;

/** Dish customization templates (mirrors optionTemplates in the frontend mocks). */
public final class SeedOptions {

    private SeedOptions() {
    }

    public static Map<String, List<OptionGroup>> templates() {
        return Map.of(
                "burger", List.of(
                        group("patty", "Patty", true, false,
                                choice("Single", 0), choice("Double", 3)),
                        group("extras", "Add extras", false, true,
                                choice("Extra cheese", 1), choice("Avocado", 1.75), choice("Fried egg", 1.25))),
                "pizza", List.of(
                        group("size", "Size", true, false,
                                choice("10\" Personal", 0), choice("12\" Medium", 3), choice("14\" Large", 6)),
                        group("extras", "Extra toppings", false, true,
                                choice("Burrata", 2.5), choice("Grilled chicken", 2.5),
                                choice("Wild mushrooms", 1.5), choice("Chili oil", 0.75))),
                "spice", List.of(
                        group("spice", "Spice level", true, false,
                                choice("Mild", 0), choice("Medium", 0), choice("Hot", 0)),
                        group("extras", "Add on", false, true,
                                choice("Garlic naan", 2.5), choice("Steamed rice", 2.25), choice("Raita", 1.75))),
                "drink", List.of(
                        group("size", "Size", true, false,
                                choice("Regular", 0), choice("Large", 1.5))),
                "side", List.of(
                        group("dip", "Dips", false, true,
                                choice("Rush sauce", 0.75), choice("Garlic aioli", 0.75), choice("Smoky BBQ", 0.75))),
                "bowl", List.of(
                        group("protein", "Protein", true, false,
                                choice("Grilled chicken", 0), choice("Crispy tofu", 0), choice("Falafel", 1.5)),
                        group("extras", "Extras", false, true,
                                choice("Avocado", 1.75), choice("Soft egg", 1), choice("Extra dressing", 0.5))),
                "grill", List.of(
                        group("temp", "Style", true, false,
                                choice("Lemon herb", 0), choice("Smoky BBQ", 0), choice("Peri-peri", 0)),
                        group("extras", "Sides", false, true,
                                choice("Truffle mash", 4), choice("Grilled asparagus", 3.5), choice("Chimichurri", 1.5))),
                "wings", List.of(
                        group("sauce", "Sauce", true, false,
                                choice("Classic buffalo", 0), choice("Honey garlic", 0),
                                choice("Nashville hot", 0), choice("Lemon pepper", 0))));
    }

    private static OptionGroup group(String id, String name, boolean required, boolean multi, OptionChoice... choices) {
        return new OptionGroup(id, name, required, multi, List.of(choices));
    }

    private static OptionChoice choice(String name, double price) {
        return new OptionChoice(name, price);
    }
}