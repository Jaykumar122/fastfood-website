import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      restaurant: null,
      items: [],
      promo: null,
      tip: 2,
      // item may carry `baseId`, `unitPrice` and `customization` from the dish customizer
      addItem: (item, restaurant, quantity = 1) => {
        const current = get();
        if (current.restaurant && current.restaurant.id !== restaurant.id) return false;
        const existing = current.items.find((cartItem) => cartItem.id === item.id);
        set({
          restaurant,
          items: existing
            ? current.items.map((cartItem) => cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + quantity } : cartItem)
            : [...current.items, { ...item, baseId: item.baseId || item.id, quantity }],
        });
        return true;
      },
      replaceRestaurant: (itemOrItems, restaurant) => {
        const list = Array.isArray(itemOrItems) ? itemOrItems : [{ ...itemOrItems, quantity: 1 }];
        set({ restaurant, items: list.map((entry) => ({ ...entry, baseId: entry.baseId || entry.id, quantity: entry.quantity || 1 })), promo: null });
      },
      updateQuantity: (id, quantity) => {
        const items = get().items.map((item) => item.id === id ? { ...item, quantity } : item).filter((item) => item.quantity > 0);
        set({ items, restaurant: items.length ? get().restaurant : null, promo: items.length ? get().promo : null });
      },
      removeItem: (id) => get().updateQuantity(id, 0),
      setPromo: (promo) => set({ promo }),
      setTip: (tip) => set({ tip }),
      clear: () => set({ restaurant: null, items: [], promo: null }),
    }),
    { name: "fastfood-cart" },
  ),
);

export const FREE_DELIVERY_THRESHOLD = 35;

export const getCartTotals = (items, deliveryFee = 0, promo = null, tip = 0) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const serviceFee = subtotal ? 1.49 : 0;
  let discount = 0;
  let delivery = subtotal ? deliveryFee : 0;
  if (promo && subtotal) {
    if (promo.type === "percent") discount = +(subtotal * promo.value / 100).toFixed(2);
    if (promo.type === "flat") discount = Math.min(promo.value, subtotal);
    if (promo.type === "shipping") delivery = 0;
  }
  if (subtotal >= FREE_DELIVERY_THRESHOLD) delivery = 0;
  const tipAmount = subtotal ? tip : 0;
  const total = Math.max(0, subtotal - discount + serviceFee + delivery + tipAmount);
  return { subtotal, serviceFee, discount, delivery, tip: tipAmount, total };
};
