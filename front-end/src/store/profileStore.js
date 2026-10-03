import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./authStore";

const seedAddresses = [
  { id: "a1", label: "Home", recipient: "Avery Morgan", street: "18 Market Street", unit: "Apt 4B", city: "San Francisco", state: "CA", zip: "94105", phone: "+1 555 012 4488", note: "Buzz 4B, leave with the front desk if I'm out.", isDefault: true },
  { id: "a2", label: "Work", recipient: "Avery Morgan", street: "500 Howard Street", unit: "Floor 9", city: "San Francisco", state: "CA", zip: "94105", phone: "+1 555 012 7712", note: "Reception on the ground floor.", isDefault: false },
];

export const formatAddress = (a) => {
  if (!a) return "";
  if (typeof a === "string") return a;
  const streetUnit = [a.street, a.unit].filter(Boolean).join(", ");
  const cityStateZip = [a.city, [a.state, a.zip].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  return [streetUnit, cityStateZip].filter(Boolean).join(", ") || a.street || "";
};

const getEffectiveUserKey = (userKey) => {
  if (userKey) return userKey;
  try {
    const authUser = useAuthStore.getState()?.user;
    return authUser?.email || authUser?.id || "default";
  } catch {
    return "default";
  }
};

export const useProfileStore = create(
  persist(
    (set, get) => ({
      userAddresses: {
        "customer@fastfood.app": seedAddresses,
        "default": seedAddresses,
      },
      addresses: seedAddresses,
      cards: [{ id: "c1", brand: "Visa", last4: "4242", expiry: "08/28", isDefault: true }],
      wallet: 25,
      walletTx: [{ id: "w0", label: "Welcome credit", amount: 25, date: "Jan 12" }],
      diets: ["Vegetarian"],
      notifications: { orderUpdates: true, promos: true, sms: false },

      getAddressesForUser: (user) => {
        const state = get();
        const key = user?.email || user?.id || getEffectiveUserKey();
        if (state.userAddresses && key in state.userAddresses) {
          const list = state.userAddresses[key] || [];
          if (user?.name && list.length) {
            return list.map((a) => (a.recipient === "Avery Morgan" ? { ...a, recipient: user.name } : a));
          }
          return list;
        }
        if (key === "customer@fastfood.app" || key === "default") {
          return seedAddresses;
        }
        return [];
      },

      getDefaultAddress: (user) => {
        const list = get().getAddressesForUser(user);
        return list.find((item) => item.isDefault) || list[0] || null;
      },

      saveAddress: (address, userKey) => set((state) => {
        const key = getEffectiveUserKey(userKey);
        const currentList = state.userAddresses?.[key] || (key === "customer@fastfood.app" || key === "default" ? [...seedAddresses] : []);
        const id = address.id || `a${Date.now()}`;
        const exists = currentList.some((item) => item.id === id);

        let list = exists
          ? currentList.map((item) => (item.id === id ? { ...item, ...address } : item))
          : [...currentList, { ...address, id }];

        if (address.isDefault || !list.some((item) => item.isDefault)) {
          list = list.map((item, index) => ({
            ...item,
            isDefault: address.isDefault ? item.id === id : index === 0,
          }));
        }

        return {
          userAddresses: {
            ...state.userAddresses,
            [key]: list,
          },
          addresses: list,
        };
      }),

      removeAddress: (id, userKey) => set((state) => {
        const key = getEffectiveUserKey(userKey);
        const currentList = state.userAddresses?.[key] || (key === "customer@fastfood.app" || key === "default" ? [...seedAddresses] : []);
        let list = currentList.filter((item) => item.id !== id);
        if (list.length && !list.some((item) => item.isDefault)) {
          list = list.map((item, index) => ({ ...item, isDefault: index === 0 }));
        }

        return {
          userAddresses: {
            ...state.userAddresses,
            [key]: list,
          },
          addresses: list,
        };
      }),

      setDefaultAddress: (id, userKey) => set((state) => {
        const key = getEffectiveUserKey(userKey);
        const currentList = state.userAddresses?.[key] || (key === "customer@fastfood.app" || key === "default" ? [...seedAddresses] : []);
        const list = currentList.map((item) => ({ ...item, isDefault: item.id === id }));

        return {
          userAddresses: {
            ...state.userAddresses,
            [key]: list,
          },
          addresses: list,
        };
      }),

      syncUser: (user) => set((state) => {
        if (!user) return state;
        const key = user.email || user.id || "default";
        const current = state.userAddresses?.[key];
        if (current && current.length) {
          const updated = user.name
            ? current.map((a) => (a.recipient === "Avery Morgan" ? { ...a, recipient: user.name } : a))
            : current;
          return {
            userAddresses: { ...state.userAddresses, [key]: updated },
            addresses: updated,
          };
        }
        if (key === "customer@fastfood.app" || key === "default") {
          const initial = seedAddresses.map((a) => ({
            ...a,
            recipient: user.name || a.recipient,
            phone: user.phone || a.phone,
          }));
          return {
            userAddresses: { ...state.userAddresses, [key]: initial },
            addresses: initial,
          };
        }
        return {
          userAddresses: { ...state.userAddresses, [key]: state.userAddresses?.[key] || [] },
          addresses: state.userAddresses?.[key] || [],
        };
      }),

      addCard: (card) => set((state) => ({ cards: [...state.cards, { ...card, id: `c${Date.now()}`, isDefault: !state.cards.length }] })),
      removeCard: (id) => set((state) => {
        const list = state.cards.filter((item) => item.id !== id);
        if (list.length && !list.some((item) => item.isDefault)) list[0] = { ...list[0], isDefault: true };
        return { cards: list };
      }),
      topUp: (amount) => set((state) => ({ wallet: +(state.wallet + amount).toFixed(2), walletTx: [{ id: `w${Date.now()}`, label: "Wallet top-up", amount, date: "Today" }, ...state.walletTx] })),
      spendWallet: (amount, label) => set((state) => ({ wallet: +Math.max(0, state.wallet - amount).toFixed(2), walletTx: [{ id: `w${Date.now()}`, label, amount: -amount, date: "Today" }, ...state.walletTx] })),
      toggleDiet: (diet) => set((state) => ({ diets: state.diets.includes(diet) ? state.diets.filter((item) => item !== diet) : [...state.diets, diet] })),
      toggleNotification: (key) => set((state) => ({ notifications: { ...state.notifications, [key]: !state.notifications[key] } })),
    }),
    { name: "fastfood-profile" },
  ),
);
