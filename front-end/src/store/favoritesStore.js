import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      restaurants: ["r2", "r11"],
      dishes: [],
      toggleRestaurant: (id) => set({ restaurants: get().restaurants.includes(id) ? get().restaurants.filter((entry) => entry !== id) : [...get().restaurants, id] }),
      toggleDish: (dish) => set({ dishes: get().dishes.some((entry) => entry.id === dish.id) ? get().dishes.filter((entry) => entry.id !== dish.id) : [...get().dishes, dish] }),
    }),
    { name: "fastfood-favorites" },
  ),
);
