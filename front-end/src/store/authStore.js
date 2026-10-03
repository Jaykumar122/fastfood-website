import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: ({ token, user }) => set({ token, user }),
      updateUser: (values) => set((state) => ({ user: { ...state.user, ...values } })),
      logout: () => set({ token: null, user: null }),
    }),
    { name: "fastfood-auth" },
  ),
);
