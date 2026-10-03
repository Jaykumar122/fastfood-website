import { api } from "./client";
import { endpoints } from "./endpoints";
import { menu, mockOrders, promoCodes, restaurants, reviewPool, users } from "../mocks/data";

export const USE_MOCKS = (import.meta.env.VITE_USE_MOCKS ?? "false") === "true";
const wait = (value, ms = 280) => new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms));

export async function loginUser(values) {
  if (!USE_MOCKS) return (await api.post(endpoints.auth.login, values)).data;
  const role = values.role ? values.role : values.email.includes("owner")
    ? "RESTAURANT_OWNER"
    : values.email.includes("rider")
      ? "DELIVERY_PARTNER"
      : values.email.includes("admin")
        ? "ADMIN"
        : "CUSTOMER";
  return wait({ token: `mock-jwt-${role}`, user: { id: "user-1", name: values.name || "Avery Morgan", email: values.email, role } });
}

export async function registerUser(values) {
  if (!USE_MOCKS) return (await api.post(endpoints.auth.register, values)).data;
  return wait({ token: "mock-jwt-customer", user: { id: "user-new", name: values.name, email: values.email, role: values.role || "CUSTOMER" } });
}

export async function getRestaurants(filters = {}) {
  if (!USE_MOCKS) return (await api.get(endpoints.restaurants.list, { params: filters })).data;
  let result = [...restaurants].filter((item) => item.approved);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((item) => `${item.name} ${item.cuisine} ${item.tags.join(" ")}`.toLowerCase().includes(q) || (menu[item.id] || []).some((dish) => `${dish.name} ${dish.description}`.toLowerCase().includes(q)));
  }
  if (filters.cuisine && filters.cuisine !== "All") result = result.filter((item) => item.cuisine === filters.cuisine);
  if (filters.veg) result = result.filter((item) => item.veg);
  if (filters.freeDelivery) result = result.filter((item) => item.deliveryFee === 0 || item.deliveryFee < 1);
  if (filters.topRated) result = result.filter((item) => item.rating >= 4.7);
  if (filters.price) result = result.filter((item) => item.priceLevel <= Number(filters.price));
  const sorters = {
    rating: (a, b) => b.rating - a.rating,
    delivery: (a, b) => a.deliveryFee - b.deliveryFee,
    time: (a, b) => a.etaMin - b.etaMin,
    popular: (a, b) => b.popularity - a.popularity,
  };
  if (sorters[filters.sort]) result.sort(sorters[filters.sort]);
  return wait({ content: result, page: Number(filters.page || 0), totalPages: 1, totalElements: result.length });
}

export async function getPopularDishes() {
  if (!USE_MOCKS) return (await api.get(endpoints.restaurants.popular)).data;
  const dishes = restaurants.filter((r) => r.approved).flatMap((r) => (menu[r.id] || []).filter((d) => d.bestseller && d.available).map((d) => ({ ...d, restaurant: { id: r.id, name: r.name, deliveryFee: r.deliveryFee, eta: r.eta } })));
  return wait(dishes.slice(0, 24));
}

export async function getReviews(id) {
  if (!USE_MOCKS) return (await api.get(endpoints.restaurants.reviews(id))).data;
  const start = Number(id.replace(/\D/g, "")) % reviewPool.length;
  return wait([0, 1, 2, 3].map((i) => reviewPool[(start + i) % reviewPool.length]));
}

export async function validatePromo(code, subtotal) {
  if (!USE_MOCKS) return (await api.post(endpoints.promos.validate, { code, subtotal })).data;
  const promo = promoCodes[code.trim().toUpperCase()];
  if (!promo) throw new Error("That code isn't valid");
  return wait({ code: code.trim().toUpperCase(), ...promo });
}

export async function getRestaurant(id) {
  if (!USE_MOCKS) return (await api.get(endpoints.restaurants.detail(id))).data;
  return wait(restaurants.find((item) => item.id === id));
}

export async function getMenu(id) {
  if (!USE_MOCKS) return (await api.get(endpoints.restaurants.menu(id))).data;
  return wait(menu[id] || []);
}

export async function getOrders() {
  if (!USE_MOCKS) return (await api.get(endpoints.orders.mine)).data;
  return wait(mockOrders);
}

export async function getRestaurantOrders() {
  if (!USE_MOCKS) return (await api.get(endpoints.orders.restaurant)).data;
  return wait(mockOrders);
}

export async function getOrder(id) {
  if (!USE_MOCKS) return (await api.get(endpoints.orders.detail(id))).data;
  return wait(mockOrders.find((order) => order.id === id) || mockOrders[0]);
}

export async function createOrder(payload) {
  if (!USE_MOCKS) return (await api.post(endpoints.orders.create, payload)).data;
  return wait({ ...mockOrders[0], id: `FR-${Math.floor(3000 + Math.random() * 6000)}`, status: "CONFIRMED", ...payload });
}

export async function processPayment(payload) {
  if (USE_MOCKS) return wait({ verified: true, paymentId: `pay-${Date.now()}` });
  const payment = (await api.post(endpoints.payments.create, payload)).data;
  return (await api.post(endpoints.payments.verify, payment)).data;
}

export async function updateOrderStatus(id, status) {
  if (!USE_MOCKS) return (await api.put(endpoints.orders.status(id), { status })).data;
  return wait({ id, status });
}

export async function updateDeliveryStatus(id, status) {
  if (!USE_MOCKS) return (await api.put(endpoints.delivery.status(id), { status })).data;
  return wait({ id, status });
}

export async function getAssignedOrders() {
  if (!USE_MOCKS) return (await api.get(endpoints.delivery.assigned)).data;
  return wait(mockOrders.filter((order) => order.status !== "DELIVERED"));
}

export async function getAvailableDeliveries() {
  if (!USE_MOCKS) return (await api.get(endpoints.delivery.available)).data;
  return wait([]);
}

export async function getDeliveryHistory() {
  if (!USE_MOCKS) return (await api.get(endpoints.delivery.history)).data;
  return wait([]);
}

export async function getAdminUsers() {
  if (!USE_MOCKS) return (await api.get(endpoints.admin.users)).data;
  return wait(users);
}

export async function approveRestaurant(id) {
  if (!USE_MOCKS) return (await api.put(endpoints.admin.approveRestaurant(id))).data;
  return wait({ id, approved: true });
}

export async function saveMenuItem(item) {
  if (!USE_MOCKS) {
    const method = item.id ? "put" : "post";
    return (await api[method](endpoints.restaurants.menuItems, item)).data;
  }
  return wait({ ...item, id: item.id || `m-${Date.now()}` });
}

export async function deleteMenuItem(id) {
  if (!USE_MOCKS) return (await api.delete(`${endpoints.restaurants.menuItems}/${id}`)).data;
  return wait({ id });
}
