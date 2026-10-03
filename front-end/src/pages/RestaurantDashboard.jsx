import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Bell, ChefHat, CheckCircle2, Clock3, DollarSign, Edit3, Home, Megaphone, MessageSquare, Package, Plus, RefreshCw, Search, Settings, Star, Store, Tag, Trash2, TrendingUp, UtensilsCrossed, X } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Button, Input, Modal } from "../components/ui";
import { useApplicationStore } from "../store/applicationStore";
import { useAuthStore } from "../store/authStore";
import { deleteMenuItem, getMenu, getRestaurant, getRestaurantOrders, getReviews, saveMenuItem, updateOrderStatus } from "../api/services";

const tabs = [
  ["overview", "Overview", Home],
  ["orders", "Orders", Package],
  ["menu", "Menu", UtensilsCrossed],
  ["reviews", "Reviews", MessageSquare],
  ["offers", "Offers", Megaphone],
  ["settings", "Settings", Settings],
];
const money = (n) => `$${Number(n || 0).toFixed(2)}`;

const statusLabels = {
  CONFIRMED: "New Order",
  PREPARING: "Preparing",
  TO_RESTAURANT: "Ready for Pickup",
  PICKED_UP: "Out for Delivery",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Completed",
  CANCELLED: "Cancelled",
};

const statusTone = {
  CONFIRMED: "bg-tangerine text-white",
  PREPARING: "bg-sun/40 text-ink",
  TO_RESTAURANT: "bg-mint text-leaf",
  PICKED_UP: "bg-leaf text-white",
  OUT_FOR_DELIVERY: "bg-leaf text-white",
  DELIVERED: "bg-neutral-100 text-neutral-600",
  CANCELLED: "bg-red-100 text-red-600",
};

function Card({ title, action, children, className = "" }) {
  return <section className={`rounded-3xl border border-ink/8 bg-white p-5 sm:p-6 ${className}`}><div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-display text-xl font-bold">{title}</h2>{action}</div>{children}</section>;
}

function Stat({ icon: Icon, label, value, note, tone = "bg-orange-50 text-tangerine" }) {
  return <div className="rounded-2xl border border-ink/8 bg-white p-5"><span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon size={19} /></span><p className="mt-4 font-display text-3xl font-extrabold tabular-nums">{value}</p><p className="text-sm text-ink/55">{label}</p>{note && <p className="mt-1 text-xs font-bold text-leaf">{note}</p>}</div>;
}

function Toggle({ on, onChange, label }) {
  return <button onClick={() => onChange(!on)} aria-label={label} className={`h-6 w-11 shrink-0 rounded-full p-0.5 transition ${on ? "bg-leaf" : "bg-ink/20"}`}><span className={`block h-5 w-5 rounded-full bg-white transition ${on ? "translate-x-5" : ""}`} /></button>;
}

export default function RestaurantDashboard() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const app = useApplicationStore((s) => s.restaurantApps.find((a) => a.email === user?.email));
  const restaurantId = user?.restaurantId || "r1";

  const [tab, setTab] = useState("overview");
  const [open, setOpen] = useState(true);
  const [offers, setOffers] = useState([]);
  const [settings, setSettings] = useState({
    autoAccept: false,
    prep: 20,
    sound: true,
    pause: false,
    hours: {
      Mon: ["10:30", "23:30"],
      Tue: ["10:30", "23:30"],
      Wed: ["10:30", "23:30"],
      Thu: ["10:30", "23:30"],
      Fri: ["10:30", "01:00"],
      Sat: ["10:30", "01:00"],
      Sun: ["11:00", "22:00"],
    },
  });

  // Real backend queries
  const { data: liveOrders = [], refetch: refetchOrders } = useQuery({
    queryKey: ["restaurant-orders", restaurantId],
    queryFn: getRestaurantOrders,
    refetchInterval: 5000,
  });

  const { data: restaurantDetail } = useQuery({
    queryKey: ["restaurant-detail", restaurantId],
    queryFn: () => getRestaurant(restaurantId),
  });

  const { data: liveMenu = [], refetch: refetchMenu } = useQuery({
    queryKey: ["restaurant-menu", restaurantId],
    queryFn: () => getMenu(restaurantId),
  });

  const { data: liveReviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ["restaurant-reviews", restaurantId],
    queryFn: () => getReviews(restaurantId),
  });

  const activeOrders = useMemo(() => {
    return liveOrders.filter((o) => ["CONFIRMED", "PREPARING", "TO_RESTAURANT"].includes(o.status));
  }, [liveOrders]);

  const completedOrders = useMemo(() => {
    return liveOrders.filter((o) => o.status === "DELIVERED");
  }, [liveOrders]);

  const revenueToday = useMemo(() => {
    return liveOrders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + Number(o.total || 0), 0);
  }, [liveOrders]);

  const newOrdersCount = useMemo(() => {
    return liveOrders.filter((o) => o.status === "CONFIRMED").length;
  }, [liveOrders]);

  const restaurantName = restaurantDetail?.name || app?.name || "Stacked & Smashed";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {app && app.status !== "APPROVED" && (
        <div className={`mb-6 rounded-2xl px-5 py-4 text-sm font-semibold ${app.status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-sun/40"}`}>
          {app.status === "REJECTED"
            ? `Your application was rejected${app.note ? `: ${app.note}` : "."}`
            : "Your restaurant is under review. You'll go live to customers once an admin approves your documents."}
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-tangerine">Restaurant HQ · MySQL Connected</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold">{restaurantName}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              refetchOrders();
              refetchMenu();
              refetchReviews();
              toast.success("Database synced!");
            }}
            className="flex items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3.5 py-2 text-xs font-bold text-ink/65 hover:bg-cream"
            title="Refresh database"
          >
            <RefreshCw size={13} /> Sync
          </button>
          {newOrdersCount > 0 && (
            <button onClick={() => setTab("orders")} className="flex items-center gap-2 rounded-full bg-tangerine px-4 py-2.5 text-sm font-bold text-white shadow-sm">
              <Bell size={16} />{newOrdersCount} new order{newOrdersCount > 1 ? "s" : ""}
            </button>
          )}
          <label className={`flex cursor-pointer items-center gap-3 rounded-full px-5 py-2.5 text-sm font-bold ${open && !settings.pause ? "bg-mint text-leaf" : "bg-ink/8 text-ink/55"}`}>
            <input type="checkbox" className="accent-leaf" checked={open} onChange={(e) => { setOpen(e.target.checked); toast(e.target.checked ? "Kitchen is open for orders" : "Kitchen paused"); }} />
            {open ? "Kitchen open" : "Kitchen closed"}
          </label>
        </div>
      </div>

      <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition ${tab === id ? "bg-ink text-white" : "bg-white text-ink/65"}`}
          >
            <Icon size={16} />
            {label}
            {id === "orders" && newOrdersCount > 0 && (
              <span className="rounded-full bg-tangerine px-2 text-xs text-white">{newOrdersCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "overview" && (
          <Overview
            revenueToday={revenueToday}
            activeOrders={activeOrders}
            completedOrders={completedOrders}
            menuItems={liveMenu}
            reviews={liveReviews}
            setTab={setTab}
          />
        )}
        {tab === "orders" && (
          <Orders
            orders={liveOrders}
            settings={settings}
            queryClient={queryClient}
            restaurantId={restaurantId}
          />
        )}
        {tab === "menu" && (
          <MenuTab
            items={liveMenu}
            restaurantId={restaurantId}
            queryClient={queryClient}
          />
        )}
        {tab === "reviews" && (
          <Reviews reviews={liveReviews} />
        )}
        {tab === "offers" && (
          <Offers offers={offers} setOffers={setOffers} />
        )}
        {tab === "settings" && (
          <SettingsTab settings={settings} setSettings={setSettings} app={app} detail={restaurantDetail} />
        )}
      </div>
    </div>
  );
}

function Overview({ revenueToday, activeOrders, completedOrders, menuItems, reviews, setTab }) {
  const avgRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return "4.8";
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const topDishes = useMemo(() => {
    return [...menuItems].sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5)).slice(0, 5);
  }, [menuItems]);

  const unavailableItems = useMemo(() => {
    return menuItems.filter((i) => i.available === false);
  }, [menuItems]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={DollarSign} label="Revenue today" value={money(revenueToday)} note="Live from MySQL orders" />
        <Stat icon={Package} label="Orders total" value={activeOrders.length + completedOrders.length} note={`${activeOrders.length} active in kitchen`} tone="bg-mint text-leaf" />
        <Stat icon={Clock3} label="Avg. prep time" value="18 min" note="Standard pace" tone="bg-sun/40 text-ink" />
        <Stat icon={Star} label="Rating" value={avgRating} note={`${reviews.length} customer reviews`} tone="bg-ink text-white" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Live kitchen orders" action={<button onClick={() => setTab("orders")} className="text-sm font-bold text-tangerine hover:underline">View all</button>}>
          {activeOrders.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink/50">No active orders right now. New customer orders will show here instantly.</p>
          ) : (
            <ul className="space-y-3">
              {activeOrders.slice(0, 5).map((o) => (
                <li key={o.id} className="flex items-center justify-between rounded-xl bg-cream px-4 py-3 text-sm">
                  <span>
                    <b>#{o.id}</b>
                    <span className="ml-2 text-ink/65">{o.customerName || "Customer"}</span>
                    <span className="ml-2 text-xs text-ink/40">({(o.items || []).reduce((s, i) => s + (i.quantity || 1), 0)} items)</span>
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone[o.status] || "bg-white"}`}>
                    {statusLabels[o.status] || o.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Popular Dishes in Menu">
          <ol className="space-y-3">
            {topDishes.map((d, i) => (
              <li key={d.id || i} className="flex items-center gap-3 text-sm">
                <span className="w-4 font-display font-bold text-tangerine">{i + 1}</span>
                {d.image && <img src={d.image} alt="" className="h-9 w-9 rounded-lg bg-ink/5 object-cover" />}
                <span className="min-w-0 flex-1 truncate font-semibold">{d.name}</span>
                <span className="text-ink/60 font-bold">${Number(d.price || 0).toFixed(2)}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {unavailableItems.length > 0 && (
        <Card title="Needs attention (Unavailable Dishes)">
          <p className="text-sm text-ink/60">
            {unavailableItems.length} item{unavailableItems.length > 1 ? "s are" : " is"} currently marked unavailable in your menu:{" "}
            <b>{unavailableItems.map((i) => i.name).join(", ")}</b>.
          </p>
        </Card>
      )}
    </div>
  );
}

function Orders({ orders, settings, queryClient, restaurantId }) {
  const [filter, setFilter] = useState("LIVE");
  const [updatingId, setUpdatingId] = useState(null);

  const getNextAction = (status) => {
    switch (status) {
      case "CONFIRMED":
        return { next: "PREPARING", label: `Accept · ${settings.prep}m` };
      case "PREPARING":
        return { next: "TO_RESTAURANT", label: "Mark Ready for Pickup" };
      case "TO_RESTAURANT":
        return { next: "PICKED_UP", label: "Hand to Rider" };
      default:
        return null;
    }
  };

  const advanceOrder = async (orderId, currentStatus) => {
    const action = getNextAction(currentStatus);
    if (!action) return;
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, action.next);
      toast.success(`Order ${orderId}: ${statusLabels[action.next] || action.next}`);
      await queryClient.invalidateQueries({ queryKey: ["restaurant-orders", restaurantId] });
    } catch {
      toast.error("Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const rejectOrder = async (orderId) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, "CANCELLED");
      toast("Order cancelled and marked in database");
      await queryClient.invalidateQueries({ queryKey: ["restaurant-orders", restaurantId] });
    } catch {
      toast.error("Failed to reject order");
    } finally {
      setUpdatingId(null);
    }
  };

  const list = orders.filter((o) => {
    if (filter === "LIVE") return ["CONFIRMED", "PREPARING", "TO_RESTAURANT"].includes(o.status);
    if (filter === "ALL") return true;
    if (filter === "COMPLETED") return ["PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"].includes(o.status);
    if (filter === "CANCELLED") return o.status === "CANCELLED";
    return o.status === filter;
  });

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          ["LIVE", "Live in kitchen"],
          ["CONFIRMED", "New"],
          ["PREPARING", "Preparing"],
          ["COMPLETED", "Completed"],
          ["CANCELLED", "Cancelled"],
          ["ALL", "All orders"],
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${filter === k ? "bg-ink text-white" : "bg-white text-ink/70 hover:bg-cream"}`}
          >
            {l}
          </button>
        ))}
      </div>

      {list.length === 0 && (
        <Card title="No orders in this view">
          <p className="text-sm text-ink/55 py-4">No matching orders found in the database.</p>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {list.map((o) => {
          const action = getNextAction(o.status);
          const totalItems = (o.items || []).reduce((s, i) => s + (i.quantity || 1), 0);
          return (
            <article key={o.id} className="rounded-3xl border border-ink/8 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-xl font-extrabold">#{o.id}</p>
                  <p className="text-sm text-ink/55 mt-0.5">{o.customerName || "Customer"} · {o.date || "Recent"}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone[o.status] || "bg-neutral-100"}`}>
                  {statusLabels[o.status] || o.status}
                </span>
              </div>

              <div className="mt-4 space-y-1.5 text-sm border-t border-ink/6 pt-3">
                {(o.items || []).map((i, idx) => (
                  <div key={idx} className="flex justify-between text-ink/80">
                    <span>{i.quantity || 1}× {i.name}</span>
                    <span className="font-semibold">${Number((i.price || 0) * (i.quantity || 1)).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {o.instructions && (
                <p className="mt-3 rounded-xl bg-cream px-3 py-2 text-xs font-semibold text-ink/75">
                  Note: {o.instructions}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-ink/8 pt-4">
                <span className="font-display text-lg font-extrabold">{money(o.total)}</span>
                <div className="flex gap-2">
                  {o.status === "CONFIRMED" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="!text-red-600 hover:!bg-red-50"
                      disabled={updatingId === o.id}
                      onClick={() => rejectOrder(o.id)}
                    >
                      <X size={14} /> Reject
                    </Button>
                  )}
                  {action && (
                    <Button
                      size="sm"
                      loading={updatingId === o.id}
                      onClick={() => advanceOrder(o.id, o.status)}
                    >
                      {action.label}
                    </Button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

function MenuTab({ items, restaurantId, queryClient }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const cats = ["All", ...new Set(items.map((i) => i.category || "Mains"))];
  const list = items.filter(
    (i) => (cat === "All" || i.category === cat) && i.name.toLowerCase().includes(q.toLowerCase())
  );

  const startEdit = (item) => {
    setEditing(item || {});
    setForm(
      item || {
        name: "",
        description: "",
        price: "",
        category: cats[1] || "Popular",
        veg: false,
        available: true,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
      }
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name?.trim() || !(Number(form.price) > 0)) {
      return toast.error("Enter a dish name and a valid price");
    }
    setIsSaving(true);
    try {
      await saveMenuItem({
        ...form,
        id: editing.id,
        restaurantId,
        price: Number(form.price),
        image: form.image || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
      });
      toast.success(editing.id ? "Dish updated in database!" : "Dish created in database!");
      await queryClient.invalidateQueries({ queryKey: ["restaurant-menu", restaurantId] });
      setEditing(null);
    } catch {
      toast.error("Failed to save menu item");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this dish from the menu?")) return;
    try {
      await deleteMenuItem(id);
      toast.success("Dish deleted from database");
      await queryClient.invalidateQueries({ queryKey: ["restaurant-menu", restaurantId] });
    } catch {
      toast.error("Failed to delete dish");
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await saveMenuItem({
        ...item,
        restaurantId,
        available: !item.available,
      });
      toast.success(!item.available ? `${item.name} is in stock` : `${item.name} marked sold out`);
      await queryClient.invalidateQueries({ queryKey: ["restaurant-menu", restaurantId] });
    } catch {
      toast.error("Failed to update availability");
    }
  };

  return (
    <>
      <Card title={`Menu Dishes from Database (${list.length})`} action={<Button onClick={() => startEdit()}><Plus size={17} />New item</Button>}>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 rounded-xl bg-cream px-3 py-2">
            <Search size={15} className="text-ink/40" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dishes" className="w-40 bg-transparent text-sm outline-none" />
          </label>
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition ${cat === c ? "bg-ink text-white" : "bg-cream text-ink/70 hover:bg-ink/5"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <ul className="divide-y divide-ink/8">
          {list.map((i) => (
            <li key={i.id} className={`flex flex-wrap items-center gap-4 py-4 ${i.available ? "" : "opacity-60"}`}>
              {i.image && <img src={i.image} alt="" className="h-16 w-16 rounded-xl bg-ink/5 object-cover" />}
              <div className="min-w-0 flex-1 basis-48">
                <p className="font-bold">
                  {i.name}
                  {i.bestseller && <span className="ml-1 rounded-full bg-sun/40 px-2 py-0.5 text-[10px]">Bestseller</span>}
                </p>
                <p className="truncate text-xs text-ink/50 mt-0.5">
                  {i.category} · {i.veg ? "Veg" : "Non-veg"} {i.calories ? `· ${i.calories} kcal` : ""}
                </p>
              </div>
              <span className="font-bold text-base w-20 text-right">${Number(i.price || 0).toFixed(2)}</span>
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                {i.available ? "In stock" : "Sold out"}
                <Toggle on={i.available} onChange={() => toggleAvailability(i)} label="Availability" />
              </label>
              <button onClick={() => startEdit(i)} className="rounded-lg p-2 hover:bg-cream" aria-label="Edit dish">
                <Edit3 size={16} />
              </button>
              <button onClick={() => handleDelete(i.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Delete dish">
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Modal open={editing !== null} title={editing?.id ? "Edit Menu Dish" : "Add New Dish"} onClose={() => setEditing(null)}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Dish name" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Crispy Chicken Burger" />
          <label className="block">
            <span className="mb-2 block text-sm font-bold">Description</span>
            <textarea
              rows={2}
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-ink/12 p-3 text-sm outline-none"
              placeholder="Freshly grilled patty, cheddar, lettuce, brioche bun"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price ($)" type="number" step="0.01" value={form.price ?? ""} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="12.50" />
            <Input label="Category" value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Burgers" />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
            <input type="checkbox" checked={!!form.veg} onChange={(e) => setForm({ ...form, veg: e.target.checked })} className="accent-leaf" />
            Vegetarian
          </label>
          <Button className="w-full" size="lg" loading={isSaving}>
            Save Dish to Database
          </Button>
        </form>
      </Modal>
    </>
  );
}

function Reviews({ reviews }) {
  const [replies, setReplies] = useState({});
  const [draft, setDraft] = useState({});

  const avg = useMemo(() => {
    if (!reviews || reviews.length === 0) return "4.8";
    const sum = reviews.reduce((a, r) => a + (r.rating || 5), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const dist = [5, 4, 3, 2, 1].map((s) => [s, (reviews || []).filter((r) => r.rating === s).length]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
      <Card title="Customer Ratings">
        <p className="font-display text-5xl font-extrabold">{avg}</p>
        <p className="text-sm text-ink/50 mt-1">{reviews.length} total reviews in database</p>
        <div className="mt-4 space-y-2">
          {dist.map(([s, n]) => (
            <div key={s} className="flex items-center gap-2 text-xs">
              <span className="w-4 font-bold">{s}★</span>
              <div className="h-2 flex-1 rounded-full bg-ink/8">
                <div className="h-2 rounded-full bg-sun" style={{ width: `${reviews.length ? (n / reviews.length) * 100 : 0}%` }} />
              </div>
              <span className="w-4 text-ink/50">{n}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Customer Reviews from Database">
        {reviews.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink/50">No reviews recorded in database yet.</p>
        ) : (
          <ul className="space-y-5">
            {reviews.map((r, i) => (
              <li key={r.id || i} className="border-b border-ink/8 pb-5 last:border-0 last:pb-0">
                <div className="flex justify-between text-sm">
                  <b>{r.name || r.customerName || "Customer"}</b>
                  <span className="text-ink/40">{r.date || "Recent"}</span>
                </div>
                <p className="text-sm text-sun mt-1">
                  {"★".repeat(r.rating || 5)}
                  <span className="text-ink/15">{"★".repeat(5 - (r.rating || 5))}</span>
                </p>
                <p className="mt-1 text-sm text-ink/70">{r.comment || r.text || "Great taste and prompt delivery!"}</p>
                {replies[i] ? (
                  <p className="mt-3 rounded-xl bg-cream p-3 text-sm">
                    <b>Your reply:</b> {replies[i]}
                  </p>
                ) : (
                  <form
                    className="mt-3 flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!draft[i]?.trim()) return;
                      setReplies({ ...replies, [i]: draft[i] });
                      toast.success("Reply posted");
                    }}
                  >
                    <input
                      value={draft[i] || ""}
                      onChange={(e) => setDraft({ ...draft, [i]: e.target.value })}
                      placeholder="Write a reply to this customer"
                      className="min-w-0 flex-1 rounded-xl border border-ink/12 px-3 py-2 text-sm outline-none"
                    />
                    <Button size="sm">Reply</Button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Offers({ offers, setOffers }) {
  const [form, setForm] = useState({ name: "", code: "", pct: 10 });
  const add = (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.code.trim().length < 3) {
      return toast.error("Enter an offer name and a code of 3+ characters");
    }
    setOffers([{ id: Date.now(), name: form.name, code: form.code.toUpperCase(), pct: Number(form.pct), on: true, used: 0 }, ...offers]);
    setForm({ name: "", code: "", pct: 10 });
    toast.success("Offer created");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <Card title="Create offer" action={<Tag size={20} className="text-tangerine" />}>
        <form onSubmit={add} className="space-y-4">
          <Input label="Offer name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Weekend 20% off" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="WEEKEND20" />
            <Input label="Discount %" type="number" min="1" max="60" value={form.pct} onChange={(e) => setForm({ ...form, pct: e.target.value })} />
          </div>
          <Button className="w-full">Launch offer</Button>
        </form>
      </Card>
      <Card title="Active Restaurant Offers">
        <ul className="space-y-3">
          {offers.map((o) => (
            <li key={o.id} className="flex items-center gap-4 rounded-2xl border border-dashed border-ink/20 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-bold">{o.name}</p>
                <p className="text-xs text-ink/50 mt-0.5">
                  <b className="text-ink">{o.code}</b> · {o.pct ? `${o.pct}% off` : "Freebie"} · {o.used} redemptions
                </p>
              </div>
              <Toggle on={o.on} onChange={(v) => setOffers(offers.map((x) => (x.id === o.id ? { ...x, on: v } : x)))} label={`Toggle ${o.code}`} />
              <button onClick={() => setOffers(offers.filter((x) => x.id !== o.id))} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" aria-label="Delete">
                <Trash2 size={16} />
              </button>
            </li>
          ))}
          {offers.length === 0 && <p className="text-sm text-ink/50 py-4">No offers yet.</p>}
        </ul>
      </Card>
    </div>
  );
}

function SettingsTab({ settings, setSettings, app, detail }) {
  const set = (p) => setSettings({ ...settings, ...p });
  const row = (k, label, hint) => (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-bold">{label}</p>
        <p className="text-xs text-ink/50">{hint}</p>
      </div>
      <Toggle on={settings[k]} onChange={(v) => set({ [k]: v })} label={label} />
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Kitchen order handling">
        <div className="divide-y divide-ink/8">
          {row("autoAccept", "Auto-accept orders", "Skip the manual accept step")}
          {row("pause", "Pause incoming orders", "Temporarily stop receiving orders")}
          {row("sound", "Sound chime on new orders", "Audio notification when customer places order")}
        </div>
        <label className="mt-4 block text-sm font-bold">
          Default preparation time
          <select value={settings.prep} onChange={(e) => set({ prep: Number(e.target.value) })} className="mt-1 w-full rounded-xl border border-ink/12 bg-white p-3 text-sm font-normal">
            {[10, 15, 20, 25, 30, 45].map((m) => (
              <option key={m} value={m}>{m} minutes</option>
            ))}
          </select>
        </label>
      </Card>

      <Card title="Kitchen hours">
        <ul className="space-y-2">
          {Object.entries(settings.hours).map(([d, [a, b]]) => (
            <li key={d} className="flex items-center gap-3 text-sm">
              <span className="w-10 font-bold">{d}</span>
              <input type="time" value={a} onChange={(e) => set({ hours: { ...settings.hours, [d]: [e.target.value, b] } })} className="rounded-lg border border-ink/12 px-2 py-1.5" />
              <span>to</span>
              <input type="time" value={b} onChange={(e) => set({ hours: { ...settings.hours, [d]: [a, e.target.value] } })} className="rounded-lg border border-ink/12 px-2 py-1.5" />
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Database Restaurant Profile" className="lg:col-span-2">
        <dl className="grid gap-4 text-sm sm:grid-cols-3">
          {[
            ["Restaurant Name", detail?.name || app?.name || user?.name || "Restaurant Partner"],
            ["Cuisine", detail?.cuisine || "Kitchen & Dining"],
            ["Address", detail?.address || app?.address || "Address registered on file"],
            ["Food licence", app?.licence || "Verified in database"],
            ["Platform Commission", "15% per order"],
            ["Payout schedule", "Weekly, every Monday"],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-ink/45">{k}</dt>
              <dd className="font-bold mt-0.5">{v}</dd>
            </div>
          ))}
        </dl>
        <Button className="mt-5" onClick={() => toast.success("Settings saved")}>Save changes</Button>
      </Card>
    </div>
  );
}
