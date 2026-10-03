import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Clock3, Copy, Dices, Headphones, Mail, MessageCircle, Phone, RotateCcw, Send, Star, Ticket, Truck, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { getOrders, getPopularDishes, getRestaurants } from "../api/services";
import DishModal from "../components/DishModal";
import { useAuthStore } from "../store/authStore";
import { useProfileStore } from "../store/profileStore";
import RestaurantCard from "../components/RestaurantCard";
import { Button, Input } from "../components/ui";
import { promoCodes } from "../mocks/data";
import { useActivityStore } from "../store/activityStore";
import { useCartStore } from "../store/cartStore";

const offerMeta = {
  RUSH20: { title: "20% off your first rush", text: "Applies to food on any order. Max one use per account.", tone: "bg-tangerine text-white", min: "No minimum" },
  WELCOME10: { title: "Welcome treat", text: "10% off your order as a thank-you for joining.", tone: "bg-leaf text-white", min: "No minimum" },
  FREESHIP: { title: "Free delivery", text: "We cover the delivery fee on your order.", tone: "bg-sun text-ink", min: "No minimum" },
  SAVE5: { title: "$5 off, just because", text: "Flat $5 off. Stack it with free delivery progress.", tone: "bg-ink text-white", min: "No minimum" },
};

export function OffersPage() {
  const { promo } = useCartStore();
  const { data } = useQuery({ queryKey: ["restaurants", "all"], queryFn: () => getRestaurants({ sort: "popular" }) });
  const deals = (data?.content || []).filter((restaurant) => restaurant.promo);
  const copy = (code) => { navigator.clipboard?.writeText(code); toast.success(`${code} copied. Paste it in your cart.`); };
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-tangerine">Save more</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold">Offers & promo codes</h1>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {Object.keys(promoCodes).map((code) => { const meta = offerMeta[code]; return (
          <article key={code} className={`relative overflow-hidden rounded-3xl p-7 ${meta.tone}`}>
            <Ticket size={26} className="opacity-70" />
            <h2 className="mt-4 font-display text-2xl font-extrabold">{meta.title}</h2>
            <p className="mt-2 max-w-sm text-sm opacity-80">{meta.text}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button onClick={() => copy(code)} className="flex items-center gap-2 rounded-xl border-2 border-dashed border-current px-4 py-2.5 font-display font-bold tracking-widest"><Copy size={16} />{code}</button>
              <span className="text-xs font-bold opacity-75">{meta.min}{promo?.code === code && " · Applied"}</span>
            </div>
          </article>
        ); })}
      </div>
      <h2 className="mt-14 font-display text-3xl font-extrabold">Restaurant deals</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{deals.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}</div>
    </div>
  );
}

const faqs = [
  ["How long does delivery take?", "Most orders arrive in 20–40 minutes. The estimate on each restaurant page updates with kitchen load and rider distance."],
  ["Can I change or cancel my order?", "You can cancel for free until the restaurant accepts it. After that, contact support from the order page and we'll do our best."],
  ["How do promo codes work?", "Enter a code in your cart. Percentage codes apply to food, free-delivery codes remove the delivery fee, and flat codes come off the subtotal."],
  ["Which payment methods are accepted?", "Cash on delivery and card payments. Saved cards live in Profile > Payment methods."],
  ["My order is wrong or missing something.", "Open the order in Orders and tell us what happened. We'll refund the item or reship it at no cost."],
  ["Are the dishes vegetarian or egg-based?", "Every dish shows a green mark for vegetarian. Our menus are vegetarian, vegan, egg and chicken only."],
];

export function HelpPage() {
  const [open, setOpen] = useState(0);
  const [orderId, setOrderId] = useState("");
  const [form, setForm] = useState({ topic: "Order issue", message: "" });
  const navigate = useNavigate();
  const send = (event) => {
    event.preventDefault();
    if (form.message.trim().length < 10) return toast.error("Please describe the issue in a few words");
    toast.success("Message sent. We'll reply within 15 minutes.");
    setForm({ topic: "Order issue", message: "" });
  };
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-tangerine">Help center</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold">How can we help?</h1>
      <form onSubmit={(event) => { event.preventDefault(); if (orderId.trim()) navigate(`/orders/${orderId.trim().replace(/^#/, "")}`); }} className="mt-7 flex flex-col gap-3 rounded-3xl bg-ink p-6 text-white sm:flex-row sm:items-end">
        <div className="flex-1"><p className="flex items-center gap-2 font-display text-lg font-bold"><Truck size={18} className="text-sun" />Track an order</p><input value={orderId} onChange={(event) => setOrderId(event.target.value)} placeholder="Order number, e.g. FR-2048" className="mt-3 w-full rounded-xl bg-white px-4 py-3 text-sm text-ink" /></div>
        <Button type="submit">Track</Button>
      </form>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">{[[Phone, "Call us", "+1 800 555 0142"], [Mail, "Email", "help@fastfood.app"], [Clock3, "Hours", "Daily 8 AM – midnight"]].map(([Icon, title, text]) => <div key={title} className="rounded-2xl border border-ink/8 bg-white p-5"><Icon size={20} className="text-tangerine" /><p className="mt-3 font-display font-bold">{title}</p><p className="text-sm text-ink/55">{text}</p></div>)}</div>
      <h2 className="mt-12 font-display text-2xl font-extrabold">Frequently asked</h2>
      <div className="mt-5 divide-y divide-ink/8 rounded-3xl border border-ink/8 bg-white">
        {faqs.map(([question, answer], index) => (
          <div key={question}>
            <button onClick={() => setOpen(open === index ? -1 : index)} className="flex w-full items-center justify-between gap-4 p-5 text-left font-bold"><span>{question}</span><ChevronDown size={18} className={`shrink-0 transition ${open === index ? "rotate-180" : ""}`} /></button>
            {open === index && <p className="px-5 pb-5 text-sm leading-6 text-ink/60">{answer}</p>}
          </div>
        ))}
      </div>
      <form onSubmit={send} className="mt-12 rounded-3xl border border-ink/8 bg-white p-6 sm:p-8">
        <h2 className="flex items-center gap-2 font-display text-2xl font-extrabold"><Headphones className="text-tangerine" />Contact support</h2>
        <div className="mt-5 space-y-4">
          <label className="block"><span className="mb-2 block text-sm font-bold">Topic</span><select value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })} className="w-full rounded-xl border border-ink/12 bg-white px-4 py-3.5 text-sm">{["Order issue", "Payment or refund", "Account", "Feedback"].map((topic) => <option key={topic}>{topic}</option>)}</select></label>
          <label className="block"><span className="mb-2 block text-sm font-bold">Message</span><textarea rows={4} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} className="w-full rounded-xl border border-ink/12 bg-white px-4 py-3 text-sm focus:border-tangerine" placeholder="Tell us what happened" /></label>
          <Button type="submit"><MessageCircle size={17} />Send message</Button>
        </div>
      </form>
    </div>
  );
}

export function RateOrder({ orderId }) {
  const { ratings, rateOrder } = useActivityStore();
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const done = ratings[orderId];
  return (
    <section className="mt-5 rounded-3xl border border-ink/8 bg-white p-6">
      <h2 className="font-display text-xl font-bold">How was your order?</h2>
      {done ? <p className="mt-3 text-sm font-semibold text-leaf">Thanks for rating {done.stars} / 5. Your feedback helps the kitchen.</p> : (
        <>
          <div className="mt-3 flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button key={n} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setHover(0) || rateOrder(orderId, { stars: n, comment })} aria-label={`${n} stars`} className="p-1"><Star size={30} className={n <= hover ? "fill-sun text-sun" : "text-ink/20"} /></button>)}</div>
          <textarea rows={2} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a comment (optional), then tap a star" className="mt-3 w-full rounded-xl border border-ink/12 px-4 py-3 text-sm" />
        </>
      )}
    </section>
  );
}

export function RecentlyViewed() {
  const { recent, clearRecent } = useActivityStore();
  const { data } = useQuery({ queryKey: ["restaurants", "all"], queryFn: () => getRestaurants({ sort: "popular" }) });
  const items = recent.map((id) => data?.content.find((restaurant) => restaurant.id === id)).filter(Boolean).slice(0, 4);
  if (!items.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between"><h2 className="font-display text-3xl font-extrabold">Pick up where you left off</h2><button onClick={clearRecent} className="text-sm font-bold text-ink/45 hover:text-ink">Clear</button></div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{items.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}</div>
    </section>
  );
}

export function OrderTools({ orderId, status, rider }) {
  const cancelOrder = useActivityStore((state) => state.cancelOrder);
  const [chatOpen, setChatOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([{ from: "rider", text: "Hi! I've picked up your order and I'm on my way." }]);
  const canCancel = ["CONFIRMED", "PREPARING"].includes(status);
  const canChat = status === "OUT_FOR_DELIVERY";
  if (!canCancel && !canChat) return null;
  const send = (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    setMessages((list) => [...list, { from: "me", text: text.trim() }]);
    setText("");
    setTimeout(() => setMessages((list) => [...list, { from: "rider", text: "Got it, thanks! See you in a few minutes." }]), 900);
  };
  return (
    <section className="mt-5 rounded-3xl border border-ink/8 bg-white p-6">
      <h2 className="font-display text-xl font-bold">Need something?</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {canChat && <Button onClick={() => setChatOpen(!chatOpen)}><MessageCircle size={17} />Chat with {rider?.name || "rider"}</Button>}
        {canChat && rider?.phone && <a href={`tel:${rider.phone}`}><Button variant="secondary"><Phone size={17} />Call rider</Button></a>}
        {canCancel && <Button variant="secondary" className="!text-red-600" onClick={() => { if (window.confirm("Cancel this order?")) { cancelOrder(orderId); toast("Order cancelled"); } }}><X size={17} />Cancel order</Button>}
      </div>
      {chatOpen && (
        <div className="mt-5 rounded-2xl bg-cream p-4">
          <div className="max-h-56 space-y-2 overflow-y-auto">{messages.map((message, index) => <p key={index} className={`w-fit max-w-[80%] rounded-2xl px-4 py-2 text-sm ${message.from === "me" ? "ml-auto bg-tangerine text-white" : "bg-white"}`}>{message.text}</p>)}</div>
          <form onSubmit={send} className="mt-3 flex gap-2"><input value={text} onChange={(event) => setText(event.target.value)} placeholder="Message your rider" className="min-w-0 flex-1 rounded-xl border border-ink/12 bg-white px-4 py-3 text-sm" /><Button type="submit" aria-label="Send"><Send size={17} /></Button></form>
        </div>
      )}
    </section>
  );
}

export function SurpriseMe() {
  const diets = useProfileStore((state) => state.diets);
  const { data = [] } = useQuery({ queryKey: ["dishes", "popular"], queryFn: getPopularDishes });
  const [pick, setPick] = useState(null);
  const [order, setOrder] = useState(null);
  const roll = () => {
    const pool = data.filter((dish) => !diets.includes("Vegetarian") || dish.veg).filter((dish) => !diets.includes("Extra spicy") || dish.spicy > 0);
    const list = pool.length ? pool : data;
    setPick(list[Math.floor(Math.random() * list.length)]);
  };
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid items-center gap-6 rounded-[32px] bg-ink p-7 text-white sm:p-10 md:grid-cols-[1fr_auto]">
        <div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-sun"><Dices size={15} />Can't decide?</p><h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Let us pick your dinner.</h2><p className="mt-2 max-w-md text-sm text-white/60">We choose a crowd favorite that fits your food preferences. Spin until something looks right.</p></div>
        <Button size="lg" onClick={roll}><Dices size={19} />{pick ? "Spin again" : "Surprise me"}</Button>
      </div>
      {pick && (
        <article className="mt-5 flex flex-col gap-5 rounded-3xl border border-ink/8 bg-white p-4 sm:flex-row sm:items-center">
          <img src={pick.image} alt={pick.name} className="h-44 w-full rounded-2xl bg-ink/5 object-cover sm:w-56" />
          <div className="flex-1"><p className="text-xs font-bold uppercase tracking-wider text-tangerine">{pick.restaurant.name}</p><h3 className="mt-1 font-display text-2xl font-extrabold">{pick.name}</h3><p className="mt-2 text-sm text-ink/55">{pick.description}</p><p className="mt-3 font-display text-xl font-bold">${pick.price.toFixed(2)}</p></div>
          <Button onClick={() => setOrder(pick)}>Order this</Button>
        </article>
      )}
      {order && <DishModal item={order} restaurant={order.restaurant} onClose={() => setOrder(null)} />}
    </section>
  );
}

export function QuickReorder() {
  const user = useAuthStore((state) => state.user);
  const replaceRestaurant = useCartStore((state) => state.replaceRestaurant);
  const navigate = useNavigate();
  const enabled = user?.role === "CUSTOMER";
  const { data = [] } = useQuery({ queryKey: ["orders"], queryFn: getOrders, enabled });
  const past = data.filter((order) => order.status === "DELIVERED").slice(0, 3);
  if (!enabled || !past.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h2 className="font-display text-3xl font-extrabold">Order it again</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">{past.map((order) => (
        <article key={order.id} className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-white p-4">
          <img src={order.items[0]?.image} alt="" className="h-20 w-20 shrink-0 rounded-xl bg-ink/5 object-cover" />
          <div className="min-w-0 flex-1"><p className="truncate font-display font-bold">{order.restaurantName}</p><p className="truncate text-xs text-ink/50">{order.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}</p><button onClick={() => { replaceRestaurant(order.items.map((entry) => ({ ...entry })), { id: order.restaurantId, name: order.restaurantName, deliveryFee: 1.99 }); toast.success("Added to cart"); navigate("/cart"); }} className="mt-2 flex items-center gap-1.5 text-sm font-bold text-tangerine"><RotateCcw size={14} />Reorder · ${order.total.toFixed(2)}</button></div>
        </article>
      ))}</div>
    </section>
  );
}
