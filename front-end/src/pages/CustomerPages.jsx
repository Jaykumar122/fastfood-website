import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, AlertTriangle, Briefcase, Check, Clock3, CreditCard, Heart, Home, MapPin, Minus, Package, Phone, Plus, RotateCcw, ShoppingBag, Tag, Trash2, UserRound, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { createOrder, getMenu, getOrder, getOrders, getRestaurants, processPayment, validatePromo } from "../api/services";
import DishModal from "../components/DishModal";
import RestaurantCard from "../components/RestaurantCard";
import { addToCart, buildCartLine } from "../utils/cart";
import { useFavoritesStore } from "../store/favoritesStore";
import OrderStatusStepper from "../components/OrderStatusStepper";
import { EmptyState, ErrorState, PageSkeleton } from "../components/states";
import { Badge, Button, Input } from "../components/ui";
import { FREE_DELIVERY_THRESHOLD, getCartTotals, useCartStore } from "../store/cartStore";
import { formatAddress, useProfileStore } from "../store/profileStore";
import { useAuthStore } from "../store/authStore";
import { OrderTools, RateOrder } from "./CustomerExtras";
import { useActivityStore } from "../store/activityStore";
import useOrderSocket from "../hooks/useOrderSocket";

function Summary({ items, restaurant, totals, action }) {
  return (
    <aside className="rounded-3xl bg-ink p-6 text-white lg:sticky lg:top-24">
      <h2 className="font-display text-xl font-bold">Order summary</h2>
      {restaurant && <p className="mt-1 text-sm text-white/50">{restaurant.name}</p>}
      <div className="my-5 space-y-3 border-y border-white/10 py-5">{items.map((item) => <div key={item.id} className="flex justify-between gap-4 text-sm"><span className="min-w-0 text-white/65">{item.quantity} × {item.name}{item.customization && <span className="block truncate text-xs text-white/35">{item.customization}</span>}</span><span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span></div>)}</div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-white/55"><span>Subtotal</span><span>${totals.subtotal.toFixed(2)}</span></div>
        {totals.discount > 0 && <div className="flex justify-between text-sun"><span>Promo discount</span><span>−${totals.discount.toFixed(2)}</span></div>}
        <div className="flex justify-between text-white/55"><span>Delivery</span><span>{totals.delivery ? `$${totals.delivery.toFixed(2)}` : "Free"}</span></div>
        <div className="flex justify-between text-white/55"><span>Service fee</span><span>${totals.serviceFee.toFixed(2)}</span></div>
        {totals.tip > 0 && <div className="flex justify-between text-white/55"><span>Rider tip</span><span>${totals.tip.toFixed(2)}</span></div>}
        <div className="mt-4 flex justify-between border-t border-white/10 pt-4 font-display text-xl font-bold"><span>Total</span><span>${totals.total.toFixed(2)}</span></div>
      </div>
      {action}
    </aside>
  );
}

function PromoBox() {
  const { items, promo, setPromo } = useCartStore();
  const [code, setCode] = useState("");
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const apply = useMutation({
    mutationFn: () => validatePromo(code, subtotal),
    onSuccess: (result) => { setPromo(result); setCode(""); toast.success(`${result.code} applied: ${result.label}`); },
    onError: (error) => toast.error(error.message || "That code isn't valid"),
  });
  return (
    <section className="rounded-2xl border border-ink/8 bg-white p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold"><Tag size={18} className="text-tangerine" />Promo code</h2>
      {promo ? (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-mint px-4 py-3 text-sm font-bold text-leaf"><span className="flex items-center gap-2"><Check size={16} />{promo.code} · {promo.label}</span><button onClick={() => setPromo(null)} aria-label="Remove promo" className="p-1"><X size={16} /></button></div>
      ) : (
        <form onSubmit={(event) => { event.preventDefault(); if (code.trim()) apply.mutate(); }} className="mt-3 flex gap-2">
          <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Try RUSH20, FREESHIP or SAVE5" className="min-w-0 flex-1 rounded-xl border border-ink/12 px-4 py-3 text-sm uppercase placeholder:normal-case placeholder:text-ink/35 focus:border-tangerine" />
          <Button type="submit" variant="dark" loading={apply.isPending}>Apply</Button>
        </form>
      )}
    </section>
  );
}

function Suggestions({ restaurant }) {
  const { items } = useCartStore();
  const { data = [] } = useQuery({ queryKey: ["menu", restaurant.id], queryFn: () => getMenu(restaurant.id) });
  const picks = data.filter((dish) => dish.available && !items.some((line) => (line.baseId || line.id) === dish.id) && !(dish.options || []).some((group) => group.required)).slice(0, 3);
  if (!picks.length) return null;
  return (
    <section className="rounded-2xl border border-ink/8 bg-white p-5">
      <h2 className="font-display text-lg font-bold">Complete your meal</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">{picks.map((dish) => (
        <div key={dish.id} className="overflow-hidden rounded-xl border border-ink/8">
          <img src={dish.image} alt={dish.name} loading="lazy" className="h-24 w-full object-cover" />
          <div className="p-3"><p className="truncate text-sm font-bold">{dish.name}</p><div className="mt-2 flex items-center justify-between"><span className="text-sm font-bold">${dish.price.toFixed(2)}</span><button onClick={() => addToCart(buildCartLine(dish), restaurant)} className="grid h-8 w-8 place-items-center rounded-lg bg-tangerine text-white" aria-label={`Add ${dish.name}`}><Plus size={16} /></button></div></div>
        </div>
      ))}</div>
    </section>
  );
}

export function CartPage() {
  const { items, restaurant, promo, tip, updateQuantity, removeItem, clear } = useCartStore();
  const totals = getCartTotals(items, restaurant?.deliveryFee, promo, 0);
  if (!items.length) return <div className="mx-auto max-w-3xl px-4 py-16"><EmptyState title="Your cart is hungry" message="Add something delicious and come back here." action={<Link to="/restaurants"><Button className="mt-5">Explore restaurants</Button></Link>} /></div>;
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - totals.subtotal);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to={`/restaurants/${restaurant.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-ink/50"><ArrowLeft size={17} />Back to menu</Link>
      <div className="mt-5 flex items-end justify-between"><h1 className="font-display text-4xl font-extrabold">Your cart</h1><button onClick={() => { clear(); toast("Cart cleared"); }} className="text-sm font-bold text-red-600">Clear cart</button></div>
      <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {restaurant.deliveryFee > 0 && <div className="rounded-2xl bg-mint p-4 text-sm font-semibold text-leaf">{remaining > 0 ? <>Add <strong>${remaining.toFixed(2)}</strong> more to get free delivery</> : <>You've unlocked free delivery</>}<div className="mt-2 h-1.5 overflow-hidden rounded-full bg-leaf/15"><div className="h-full rounded-full bg-leaf transition-all" style={{ width: `${Math.min(100, (totals.subtotal / FREE_DELIVERY_THRESHOLD) * 100)}%` }} /></div></div>}
          {items.map((item) => (
            <article key={item.id} className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-white p-4">
              <img src={item.image} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />
              <div className="min-w-0 flex-1"><h3 className="truncate font-display font-bold">{item.name}</h3>{item.customization && <p className="mt-0.5 truncate text-xs text-ink/50">{item.customization}</p>}{item.note && <p className="truncate text-xs italic text-ink/40">“{item.note}”</p>}<p className="mt-1 text-sm font-bold">${item.price.toFixed(2)}</p></div>
              <div className="flex items-center rounded-xl bg-cream"><button className="p-2" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease"><Minus size={15} /></button><span className="w-6 text-center text-sm font-bold">{item.quantity}</span><button className="p-2" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase"><Plus size={15} /></button></div>
              <button onClick={() => removeItem(item.id)} className="p-2 text-red-500" aria-label={`Remove ${item.name}`}><Trash2 size={18} /></button>
            </article>
          ))}
          <PromoBox />
          <Suggestions restaurant={restaurant} />
        </div>
        <Summary items={items} restaurant={restaurant} totals={totals} action={<Link to="/checkout"><Button className="mt-6 w-full" size="lg">Checkout <ArrowRight size={18} /></Button></Link>} />
      </div>
    </div>
  );
}

const checkoutSchema = z.object({
  address: z.string().min(8, "Enter a complete delivery address"),
  phone: z.string().min(7, "Enter a valid phone number"),
  paymentMethod: z.enum(["COD", "ONLINE", "WALLET"]),
  instructions: z.string().optional(),
  schedule: z.string().optional(),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvc: z.string().optional(),
}).superRefine((values, ctx) => {
  if (values.paymentMethod !== "ONLINE") return;
  if (!/^\d{4} ?\d{4} ?\d{4} ?\d{4}$/.test(values.cardNumber || "")) ctx.addIssue({ code: "custom", path: ["cardNumber"], message: "Enter a 16-digit card number" });
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(values.cardExpiry || "")) ctx.addIssue({ code: "custom", path: ["cardExpiry"], message: "Use MM/YY" });
  if (!/^\d{3,4}$/.test(values.cardCvc || "")) ctx.addIssue({ code: "custom", path: ["cardCvc"], message: "3–4 digits" });
});

const slots = ["ASAP (25–35 min)", "Today, 7:30 PM", "Today, 8:00 PM", "Today, 8:30 PM", "Today, 9:00 PM"];

export function CheckoutPage() {
  const { items, restaurant, promo, tip, setTip, clear } = useCartStore();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const profile = useProfileStore();
  const savedAddresses = profile.getAddressesForUser ? profile.getAddressesForUser(user) : [];
  const defaultAddress = profile.getDefaultAddress ? profile.getDefaultAddress(user) : savedAddresses.find((item) => item.isDefault) || savedAddresses[0] || null;
  const wallet = useProfileStore((state) => state.wallet);
  const spendWallet = useProfileStore((state) => state.spendWallet);
  const totals = getCartTotals(items, restaurant?.deliveryFee, promo, tip);

  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddress?.id || "custom");
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState("Home");

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      address: defaultAddress ? formatAddress(defaultAddress) : "",
      phone: defaultAddress?.phone || user?.phone || "",
      paymentMethod: "COD",
      instructions: defaultAddress?.note || "",
      schedule: slots[0],
      cardNumber: "",
      cardExpiry: "",
      cardCvc: "",
    },
  });

  const handleSelectAddress = (addr) => {
    if (addr) {
      setSelectedAddressId(addr.id);
      setValue("address", formatAddress(addr), { shouldValidate: true });
      setValue("phone", addr.phone || user?.phone || "", { shouldValidate: true });
      setValue("instructions", addr.note || "");
      setSaveToProfile(false);
    } else {
      setSelectedAddressId("custom");
      setValue("address", "");
      setValue("instructions", "");
    }
  };

  const mutation = useMutation({
    mutationFn: async (payload) => {
      if (payload.paymentMethod === "ONLINE") {
        await processPayment({ amount: payload.total, currency: "USD" });
      }
      return createOrder(payload);
    },
    onSuccess: (order, payload) => {
      if (payload.paymentMethod === "WALLET") spendWallet(payload.total, `Order at ${payload.restaurantName}`);
      clear();
      toast.success("Order confirmed. The kitchen is on it.");
      navigate(`/orders/${order.id}`, { replace: true });
    },
    onError: () => toast.error("We couldn't place your order"),
  });

  const online = watch("paymentMethod") === "ONLINE";
  if (!items.length) return <div className="mx-auto max-w-3xl px-4 py-16"><EmptyState title="Nothing to check out" action={<Link to="/restaurants"><Button className="mt-5">Find food</Button></Link>} /></div>;

  const submit = ({ cardNumber, cardExpiry, cardCvc, ...values }) => {
    if (saveToProfile && values.address) {
      profile.saveAddress(
        {
          label: newAddressLabel,
          recipient: user?.name || "Customer",
          street: values.address,
          phone: values.phone,
          note: values.instructions || "",
          isDefault: savedAddresses.length === 0,
        },
        user?.email
      );
    }
    mutation.mutate({
      ...values,
      items,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      promoCode: promo?.code,
      tip,
      total: totals.total,
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/cart" className="inline-flex items-center gap-2 text-sm font-bold text-ink/50"><ArrowLeft size={17} />Back to cart</Link>
      <h1 className="mt-5 font-display text-4xl font-extrabold">Checkout</h1>
      <form onSubmit={handleSubmit(submit)} className="mt-8 grid gap-7 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <section className="rounded-3xl border border-ink/8 bg-white p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold">
                <MapPin className="text-tangerine" />Delivery details
              </h2>
              {user && (
                <Link to="/profile" state={{ allowedNav: true }} className="text-xs font-bold text-tangerine hover:underline">
                  Manage saved addresses →
                </Link>
              )}
            </div>

            {savedAddresses.length > 0 && (
              <div className="mb-5">
                <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-ink/45">Deliver to</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    const Icon = addr.label === "Work" ? Briefcase : addr.label === "Home" ? Home : MapPin;
                    return (
                      <button
                        type="button"
                        key={addr.id}
                        onClick={() => handleSelectAddress(addr)}
                        className={`flex flex-col items-start rounded-2xl border p-4 text-left transition ${
                          isSelected
                            ? "border-tangerine bg-orange-50/70 ring-2 ring-tangerine/30"
                            : "border-ink/10 hover:border-ink/30 bg-white"
                        }`}
                      >
                        <div className="flex w-full items-center justify-between">
                          <span className="flex items-center gap-2 text-sm font-bold text-ink">
                            <Icon size={16} className={isSelected ? "text-tangerine" : "text-ink/50"} />
                            {addr.label}
                          </span>
                          {addr.isDefault && (
                            <span className="rounded-full bg-tangerine/15 px-2 py-0.5 text-[10px] font-bold text-tangerine">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs font-medium text-ink/75">{formatAddress(addr)}</p>
                        {addr.phone && <p className="mt-1 text-[11px] text-ink/45">{addr.phone}</p>}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => handleSelectAddress(null)}
                    className={`flex flex-col items-start justify-center rounded-2xl border p-4 text-left transition ${
                      selectedAddressId === "custom"
                        ? "border-tangerine bg-orange-50/70 ring-2 ring-tangerine/30"
                        : "border-dashed border-ink/20 hover:border-ink/40 bg-ink/[0.02]"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm font-bold text-ink">
                      <Plus size={16} className={selectedAddressId === "custom" ? "text-tangerine" : "text-ink/50"} />
                      Enter another address
                    </span>
                    <span className="mt-1 text-xs text-ink/45">Deliver to a new location</span>
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Delivery address"
                icon={Home}
                error={errors.address?.message}
                {...register("address", {
                  onChange: () => {
                    if (selectedAddressId !== "custom") setSelectedAddressId("custom");
                  },
                })}
              />
              <Input label="Phone number" icon={Phone} error={errors.phone?.message} {...register("phone")} />
              <Input label="Delivery notes (optional)" placeholder="Gate code, floor, landmark…" {...register("instructions")} />

              {selectedAddressId === "custom" && (
                <div className="rounded-2xl border border-ink/8 bg-ink/[0.02] p-4 space-y-3">
                  <label className="flex items-center gap-2.5 text-sm font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveToProfile}
                      onChange={(e) => setSaveToProfile(e.target.checked)}
                      className="h-4 w-4 accent-tangerine rounded"
                    />
                    <span>Save this address to my profile for future orders</span>
                  </label>
                  {saveToProfile && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs font-bold text-ink/50">Save as:</span>
                      {["Home", "Work", "Other"].map((label) => (
                        <button
                          type="button"
                          key={label}
                          onClick={() => setNewAddressLabel(label)}
                          className={`rounded-lg px-3 py-1 text-xs font-bold border transition ${
                            newAddressLabel === label
                              ? "border-tangerine bg-tangerine text-white"
                              : "border-ink/12 bg-white text-ink/70 hover:border-ink/30"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
          <section className="rounded-3xl border border-ink/8 bg-white p-6"><h2 className="mb-5 flex items-center gap-2 font-display text-xl font-bold"><Clock3 className="text-tangerine" />Delivery time</h2><div className="flex flex-wrap gap-2">{slots.map((slot) => <label key={slot} className={`cursor-pointer rounded-xl border px-4 py-3 text-sm font-bold transition ${watch("schedule") === slot ? "border-tangerine bg-orange-50" : "border-ink/10 hover:border-ink/30"}`}><input type="radio" value={slot} {...register("schedule")} className="sr-only" />{slot}</label>)}</div></section>
          <section className="rounded-3xl border border-ink/8 bg-white p-6"><h2 className="mb-1 flex items-center gap-2 font-display text-xl font-bold"><Heart className="text-tangerine" />Tip your rider</h2><p className="mb-4 text-sm text-ink/50">100% of tips go to your delivery partner.</p><div className="flex flex-wrap gap-2">{[0, 1, 2, 3, 5].map((amount) => <button type="button" key={amount} onClick={() => setTip(amount)} className={`rounded-xl border px-5 py-3 text-sm font-bold transition ${tip === amount ? "border-leaf bg-leaf text-white" : "border-ink/10 hover:border-ink/30"}`}>{amount ? `$${amount}` : "No tip"}</button>)}</div></section>
          <section className="rounded-3xl border border-ink/8 bg-white p-6"><h2 className="mb-5 flex items-center gap-2 font-display text-xl font-bold"><CreditCard className="text-tangerine" />Payment method</h2><div className="grid gap-3 sm:grid-cols-3">{[["COD", "Cash on delivery", "Pay when your order arrives"], ["ONLINE", "Pay online", "Secure card payment"], ["WALLET", "Wallet", `Balance $${wallet.toFixed(2)}${wallet < totals.total ? " · not enough" : ""}`]].map(([value, label, help]) => <label key={value} className={`rounded-2xl border p-4 transition ${value === "WALLET" && wallet < totals.total ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${watch("paymentMethod") === value ? "border-tangerine bg-orange-50" : "border-ink/10"}`}><input type="radio" value={value} disabled={value === "WALLET" && wallet < totals.total} {...register("paymentMethod")} className="mr-3 accent-tangerine" /><strong className="text-sm">{label}</strong><span className="mt-1 block pl-7 text-xs text-ink/45">{help}</span></label>)}</div>
            {online && <div className="mt-5 grid gap-4 sm:grid-cols-2"><Input className="sm:col-span-2" label="Card number" icon={CreditCard} placeholder="4242 4242 4242 4242" inputMode="numeric" error={errors.cardNumber?.message} {...register("cardNumber")} /><Input label="Expiry" placeholder="MM/YY" error={errors.cardExpiry?.message} {...register("cardExpiry")} /><Input label="CVC" placeholder="123" inputMode="numeric" error={errors.cardCvc?.message} {...register("cardCvc")} /></div>}
          </section>
        </div>
        <Summary items={items} restaurant={restaurant} totals={totals} action={<Button type="submit" className="mt-6 w-full" size="lg" loading={mutation.isPending}>Place order · ${totals.total.toFixed(2)} <ArrowRight size={18} /></Button>} />
      </form>
    </div>
  );
}

export function FavoritesPage() {
  const { restaurants: savedIds, dishes, toggleDish } = useFavoritesStore();
  const { data } = useQuery({ queryKey: ["restaurants", "all"], queryFn: () => getRestaurants({ sort: "popular" }) });
  const saved = data?.content.filter((restaurant) => savedIds.includes(restaurant.id)) || [];
  const [dish, setDish] = useState(null);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-tangerine">Your list</p><h1 className="mt-2 font-display text-4xl font-extrabold">Saved favorites</h1>
      <h2 className="mt-10 font-display text-2xl font-bold">Restaurants</h2>
      <div className="mt-5">{saved.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{saved.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}</div> : <EmptyState title="No saved restaurants" message="Tap the heart on any restaurant to save it here." action={<Link to="/restaurants"><Button className="mt-5">Browse restaurants</Button></Link>} />}</div>
      <h2 className="mt-12 font-display text-2xl font-bold">Dishes</h2>
      <div className="mt-5">{dishes.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{dishes.map((item) => (
        <article key={item.id} className="flex gap-4 rounded-2xl border border-ink/8 bg-white p-3">
          <img src={item.image} alt={item.name} className="h-24 w-24 rounded-xl object-cover" />
          <div className="min-w-0 flex-1"><h3 className="truncate font-display font-bold">{item.name}</h3><p className="truncate text-xs text-ink/45">{item.restaurant?.name}</p><div className="mt-3 flex items-center justify-between"><span className="font-bold">${item.price.toFixed(2)}</span><div className="flex gap-2"><button onClick={() => toggleDish(item)} className="rounded-lg bg-ink/5 p-2" aria-label="Remove"><Trash2 size={15} /></button><Button size="sm" onClick={() => setDish(item)}>Order</Button></div></div></div>
        </article>
      ))}</div> : <EmptyState title="No saved dishes" message="Tap the heart on a dish to keep it handy." />}</div>
      {dish && dish.restaurant && <DishModal item={dish} restaurant={dish.restaurant} onClose={() => setDish(null)} />}
    </div>
  );
}

export function OrdersPage() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["orders"], queryFn: getOrders });
  const replaceRestaurant = useCartStore((state) => state.replaceRestaurant);
  const navigate = useNavigate();
  const reorder = (order) => { if (order.items.length) replaceRestaurant(order.items.map((entry) => ({ ...entry })), { id: order.restaurantId, name: order.restaurantName, deliveryFee: 1.99 }); toast.success("Added to cart"); navigate("/cart"); };
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8"><p className="text-xs font-bold uppercase tracking-[.2em] text-tangerine">Your meals</p><h1 className="mt-2 font-display text-4xl font-extrabold">Order history</h1><div className="mt-8">{isLoading ? <PageSkeleton cards={3} /> : isError ? <ErrorState onRetry={refetch} /> : data?.length ? <div className="space-y-4">{data.map((order) => <article key={order.id} className="rounded-3xl border border-ink/8 bg-white p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-3"><h2 className="font-display text-xl font-bold">{order.restaurantName}</h2><Badge tone={order.status === "DELIVERED" ? "green" : "orange"}>{order.status.replaceAll("_", " ")}</Badge></div><p className="mt-2 text-sm text-ink/45">{order.date} · #{order.id}</p></div><p className="font-display text-xl font-bold">${order.total.toFixed(2)}</p></div><div className="mt-5 flex flex-wrap gap-3 border-t border-ink/8 pt-4"><Link to={`/orders/${order.id}`}><Button variant="secondary" size="sm">View details</Button></Link><Button variant="ghost" size="sm" onClick={() => reorder(order)}><RotateCcw size={16} />Reorder</Button></div></article>)}</div> : <EmptyState title="No orders yet" />}</div></div>
  );
}

export function TrackingPage() {
  const { id } = useParams();
  const liveStatus = useOrderSocket(id);
  const cancelledMap = useActivityStore((state) => state.cancelled);
  const { data: order, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrder(id),
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <PageSkeleton cards={2} />
      </div>
    );
  }

  if (isError || !order) {
    const isForbidden = error?.response?.status === 403;
    const isNotFound = error?.response?.status === 404;
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="rounded-3xl border border-red-200 bg-red-50/70 p-8 text-center sm:p-12">
          <AlertTriangle className="mx-auto mb-3 text-red-600" size={32} />
          <h2 className="font-display text-2xl font-bold text-ink">
            {isForbidden
              ? "Order belongs to another account"
              : isNotFound
                ? `Order #${id} not found`
                : "Unable to load order details"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink/65">
            {isForbidden
              ? "For privacy and security, you can only track orders placed from your own account."
              : isNotFound
                ? "We couldn't find an order with this reference number. Please check the order number or view your order history."
                : "We couldn't load this order right now. Please check your connection and try again."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/orders">
              <Button>View my orders</Button>
            </Link>
            <Button variant="secondary" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const cancelled = cancelledMap[order.id];
  const status = cancelled ? "CANCELLED" : liveStatus || order.status;
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-tangerine">Order #{order.id}</p><h1 className="mt-2 font-display text-4xl font-extrabold">Track your order</h1></div><Badge tone="orange">{status.replaceAll("_", " ")}</Badge></div>
      <section className="mt-8 rounded-3xl border border-ink/8 bg-white p-6 sm:p-8">{status === "CANCELLED" ? <p className="font-display text-xl font-bold text-red-600">This order was cancelled. Any payment will be refunded.</p> : <OrderStatusStepper status={status} />}</section>
      <div className="mt-5 grid gap-5 md:grid-cols-2"><section className="rounded-3xl bg-leaf p-6 text-white"><p className="text-xs font-bold uppercase tracking-wider text-white/50">Estimated arrival</p><p className="mt-3 font-display text-4xl font-extrabold">8:05 PM</p><p className="mt-2 flex items-center gap-2 text-sm text-white/65"><Clock3 size={16} />About 12 minutes away</p></section><section className="rounded-3xl border border-ink/8 bg-white p-6"><p className="text-xs font-bold uppercase tracking-wider text-ink/40">Delivery partner</p><div className="mt-4 flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-full bg-mint text-leaf"><UserRound /></span><div><p className="font-display text-lg font-bold">{order.rider?.name || "Assigned soon"}</p><p className="text-sm text-ink/45">{order.rider?.phone || "We’ll notify you"}</p></div></div></section></div>
      <section className="mt-5 rounded-3xl border border-ink/8 bg-white p-6"><h2 className="font-display text-xl font-bold">Delivery details</h2><p className="mt-3 flex items-start gap-2 text-sm text-ink/55"><MapPin size={17} className="mt-0.5 shrink-0 text-tangerine" />{order.address}</p></section>
      <OrderTools orderId={order.id} status={status} rider={order.rider} />
      {status === "DELIVERED" && <RateOrder orderId={order.id} />}
    </div>
  );
}
