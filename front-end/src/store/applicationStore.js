import { create } from "zustand";
import { persist } from "zustand/middleware";

const seed = (id, name, email, city, vehicle, submitted, docs, status = "PENDING") => ({
  id, name, email, city, vehicle, phone: "(415) 555-01" + id.slice(-2), plate: vehicle === "BICYCLE" ? "" : "7XYZ" + id.slice(-3), licenceNo: vehicle === "BICYCLE" ? "" : "D88" + id.slice(-4), submitted, status, note: "", bg: "Pending",
  docs: Object.fromEntries(docs.map((k) => [k, { file: `${k}.jpg`, ok: null }])),
});

export const useApplicationStore = create(
  persist(
    (set) => ({
      applications: [
        seed("DP-481203", "Priya Nair", "priya.n@example.com", "San Francisco", "SCOOTER", "Today, 9:12 AM", ["idFront", "licence", "vehicleDoc", "selfie"]),
        seed("DP-481177", "Diego Alvarez", "diego.a@example.com", "Oakland", "CAR", "Yesterday", ["idFront", "licence", "vehicleDoc", "selfie"]),
        seed("DP-481142", "Hannah Cole", "hannah.c@example.com", "Berkeley", "BICYCLE", "2 days ago", ["idFront", "selfie"]),
      ],
      restaurantApps: [
        { id: "RS-310482", name: "Taco Lane", owner: "Luis Ortega", email: "luis@tacolane.com", cuisine: "Mexican", city: "San Francisco", address: "55 Mission St", licence: "FS-88213", submitted: "Today, 8:40 AM", status: "PENDING", note: "", docs: { licence: { file: "licence.pdf", ok: null }, foodSafety: { file: "food-safety.pdf", ok: null }, idFront: { file: "id.jpg", ok: null }, bankProof: { file: "bank.pdf", ok: null } } },
        { id: "RS-310455", name: "Green Bowl Kitchen", owner: "Aisha Khan", email: "aisha@greenbowl.com", cuisine: "Healthy", city: "Oakland", address: "9 Lakeshore Ave", licence: "FS-77120", submitted: "Yesterday", status: "PENDING", note: "", docs: { licence: { file: "licence.pdf", ok: null }, foodSafety: { file: "food-safety.pdf", ok: null }, idFront: { file: "id.jpg", ok: null }, bankProof: { file: "bank.pdf", ok: null } } },
      ],
      submitRestaurantApp: (app) => set((state) => ({ restaurantApps: [{ ...app, status: "PENDING", note: "" }, ...state.restaurantApps.filter((a) => a.id !== app.id)] })),
      setRestaurantDoc: (id, key, ok) => set((state) => ({ restaurantApps: state.restaurantApps.map((a) => (a.id === id ? { ...a, docs: { ...a.docs, [key]: { ...a.docs[key], ok } } } : a)) })),
      decideRestaurant: (id, status, note = "") => set((state) => ({ restaurantApps: state.restaurantApps.map((a) => (a.id === id ? { ...a, status, note } : a)) })),
      submitApplication: (app) => set((state) => ({ applications: [{ ...app, status: "PENDING", note: "", bg: "Pending" }, ...state.applications.filter((a) => a.id !== app.id)] })),
      setDoc: (id, key, ok) => set((state) => ({ applications: state.applications.map((a) => (a.id === id ? { ...a, docs: { ...a.docs, [key]: { ...a.docs[key], ok } } } : a)) })),
      setBg: (id, bg) => set((state) => ({ applications: state.applications.map((a) => (a.id === id ? { ...a, bg } : a)) })),
      decide: (id, status, note = "") => set((state) => ({ applications: state.applications.map((a) => (a.id === id ? { ...a, status, note } : a)) })),
    }),
    { name: "fastfood-applications" },
  ),
);
