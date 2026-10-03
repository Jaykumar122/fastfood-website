export const endpoints = {
  auth: {
    register: "/api/auth/register",
    login: "/api/auth/login",
  },
  restaurants: {
    list: "/api/restaurants",
    detail: (id) => `/api/restaurants/${id}`,
    menu: (id) => `/api/restaurants/${id}/menu`,
    menuItems: "/api/restaurants/menu-items",
    popular: "/api/restaurants/popular-dishes",
    reviews: (id) => `/api/restaurants/${id}/reviews`,
  },
  orders: {
    create: "/api/orders",
    mine: "/api/orders/my",
    restaurant: "/api/orders/restaurant",
    detail: (id) => `/api/orders/${id}`,
    status: (id) => `/api/orders/${id}/status`,
  },
  promos: {
    validate: "/api/promos/validate",
  },
  payments: {
    create: "/api/payments/create",
    verify: "/api/payments/verify",
  },
  delivery: {
    assigned: "/api/delivery/assigned",
    available: "/api/delivery/available",
    history: "/api/delivery/history",
    status: (orderId) => `/api/delivery/${orderId}/status`,
  },
  admin: {
    users: "/api/admin/users",
    approveRestaurant: (id) => `/api/admin/restaurants/${id}/approve`,
  },
  websocket: "/ws",
};
