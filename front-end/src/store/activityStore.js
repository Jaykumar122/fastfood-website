import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useActivityStore = create(
  persist(
    (set) => ({
      recent: [],
      ratings: {},
      cancelled: {},
      viewRestaurant: (id) => set((state) => ({ recent: [id, ...state.recent.filter((item) => item !== id)].slice(0, 8) })),
      cancelOrder: (id) => set((state) => ({ cancelled: { ...state.cancelled, [id]: true } })),
      clearRecent: () => set({ recent: [] }),
      rateOrder: (orderId, rating) => set((state) => ({ ratings: { ...state.ratings, [orderId]: rating } })),
    }),
    { name: "fastfood-activity" },
  ),
);
