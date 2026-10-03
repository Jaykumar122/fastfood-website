import { useActivityStore } from "../store/activityStore";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Bike, Clock3, MapPin, Minus, Percent, Plus, Search, ShoppingBag, Star, Store, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getMenu, getRestaurant, getRestaurants, getReviews } from "../api/services";
import FavoriteButton from "../components/FavoriteButton";
import MenuItemCard from "../components/MenuItemCard";
import RestaurantCard from "../components/RestaurantCard";
import { EmptyState, ErrorState, PageSkeleton } from "../components/states";
import { Badge, Button, Input } from "../components/ui";
import { cuisineList } from "../mocks/data";
import { FREE_DELIVERY_THRESHOLD, getCartTotals, useCartStore } from "../store/cartStore";

const cuisines = ["All", ...cuisineList.map((cuisine) => cuisine.name)];

function Toggle({ active, onClick, children }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-bold transition ${active ? "border-leaf bg-leaf text-white" : "border-ink/12 bg-white hover:border-ink/30"}`}>{children}</button>;
}

export function RestaurantsPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("search") || "");
  const filters = useMemo(() => ({
    search: params.get("search") || "",
    cuisine: params.get("cuisine") || "All",
    veg: params.get("veg") === "true",
    freeDelivery: params.get("free") === "true",
    topRated: params.get("top") === "true",
    price: params.get("price") || "",
    sort: params.get("sort") || "popular",
    page: params.get("page") || 0,
  }), [params]);
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["restaurants", filters], queryFn: () => getRestaurants(filters) });
  const update = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next);
  };
  const activeCount = [filters.veg, filters.freeDelivery, filters.topRated, filters.price, filters.cuisine !== "All", filters.search].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-tangerine">Explore nearby</p><h1 className="mt-2 font-display text-4xl font-extrabold sm:text-5xl">Food worth rushing for.</h1><p className="mt-3 text-ink/55">Great spots, real ratings, and delivery times you can count on.</p></div>
      <form onSubmit={(event) => { event.preventDefault(); update("search", search.trim()); }} className="mt-8 grid gap-3 rounded-2xl border border-ink/8 bg-white p-3 shadow-sm md:grid-cols-[1fr_auto]">
        <Input icon={Search} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search restaurants, cuisines or dishes (try “biryani”)" />
        <select aria-label="Sort" value={filters.sort} onChange={(event) => update("sort", event.target.value)} className="rounded-xl border border-ink/12 bg-white px-4 py-3 text-sm font-semibold">
          <option value="popular">Most popular</option><option value="rating">Top rated</option><option value="time">Fastest delivery</option><option value="delivery">Lowest delivery fee</option>
        </select>
      </form>
      <div className="hide-scrollbar mt-5 flex gap-2 overflow-x-auto pb-2">{cuisines.map((cuisine) => <button key={cuisine} onClick={() => update("cuisine", cuisine === "All" ? "" : cuisine)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${filters.cuisine === cuisine ? "bg-ink text-white" : "border border-ink/10 bg-white hover:border-ink/30"}`}>{cuisine}</button>)}</div>
      <div className="hide-scrollbar mt-2 flex items-center gap-2 overflow-x-auto pb-2">
        <Toggle active={filters.veg} onClick={() => update("veg", filters.veg ? "" : "true")}>Vegetarian friendly</Toggle>
        <Toggle active={filters.freeDelivery} onClick={() => update("free", filters.freeDelivery ? "" : "true")}>Free delivery</Toggle>
        <Toggle active={filters.topRated} onClick={() => update("top", filters.topRated ? "" : "true")}>4.7★ and up</Toggle>
        {[1, 2, 3].map((level) => <Toggle key={level} active={filters.price === String(level)} onClick={() => update("price", filters.price === String(level) ? "" : String(level))}>{"$".repeat(level)} or less</Toggle>)}
        {activeCount > 0 && <button onClick={() => { setSearch(""); setParams({}); }} className="flex shrink-0 items-center gap-1 px-3 text-sm font-bold text-tangerine"><X size={15} />Clear all</button>}
      </div>
      <div className="mt-6 flex items-center justify-between"><p className="text-sm text-ink/50"><strong className="text-ink">{data?.totalElements || 0}</strong> restaurants found{filters.search && <> for “{filters.search}”</>}</p></div>
      <div className="mt-5">{isLoading ? <PageSkeleton /> : isError ? <ErrorState onRetry={refetch} /> : data?.content.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data.content.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}</div> : <EmptyState title="No restaurants match" message="Try broadening your search or clearing a filter." />}</div>
    </div>
  );
}

function MiniCart({ restaurant }) {
  const { items, restaurant: cartRestaurant, promo, tip, updateQuantity } = useCartStore();
  const mine = cartRestaurant?.id === restaurant.id;
  const lines = mine ? items : [];
  const totals = getCartTotals(lines, restaurant.deliveryFee, promo, 0);
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - totals.subtotal);
  return (
    <aside className="rounded-3xl border border-ink/8 bg-white p-5 shadow-[0_10px_40px_rgba(23,35,29,.06)] lg:sticky lg:top-24">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold"><ShoppingBag size={20} className="text-tangerine" />Your order</h2>
      {!mine && items.length > 0 && <p className="mt-3 rounded-xl bg-orange-50 p-3 text-xs font-semibold text-orange-800">Your cart has items from {cartRestaurant?.name}. Adding from here will ask to start a new cart.</p>}
      {lines.length ? (
        <>
          <div className="mt-4 max-h-72 space-y-3 overflow-y-auto">
            {lines.map((line) => (
              <div key={line.id} className="flex items-start gap-3 text-sm">
                <div className="flex shrink-0 items-center rounded-lg bg-cream"><button className="p-1.5" onClick={() => updateQuantity(line.id, line.quantity - 1)} aria-label="Decrease"><Minus size={13} /></button><span className="w-5 text-center text-xs font-bold">{line.quantity}</span><button className="p-1.5" onClick={() => updateQuantity(line.id, line.quantity + 1)} aria-label="Increase"><Plus size={13} /></button></div>
                <div className="min-w-0 flex-1"><p className="font-semibold leading-tight">{line.name}</p>{line.customization && <p className="mt-0.5 truncate text-xs text-ink/45">{line.customization}</p>}</div>
                <span className="font-bold">${(line.price * line.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-ink/8 pt-4">
            {totals.subtotal < FREE_DELIVERY_THRESHOLD && restaurant.deliveryFee > 0 ? (
              <div className="mb-4"><p className="text-xs font-semibold text-ink/55">Add <strong className="text-ink">${remaining.toFixed(2)}</strong> more for free delivery</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/8"><div className="h-full rounded-full bg-leaf transition-all" style={{ width: `${Math.min(100, (totals.subtotal / FREE_DELIVERY_THRESHOLD) * 100)}%` }} /></div></div>
            ) : <p className="mb-4 flex items-center gap-1.5 text-xs font-bold text-leaf"><Bike size={14} />You've unlocked free delivery</p>}
            <div className="flex justify-between font-display text-lg font-bold"><span>Subtotal</span><span>${totals.subtotal.toFixed(2)}</span></div>
            {totals.subtotal < restaurant.minOrder && <p className="mt-2 text-xs font-semibold text-red-600">Minimum order is ${restaurant.minOrder.toFixed(2)}</p>}
            <Link to="/cart"><Button className="mt-4 w-full" size="lg" disabled={totals.subtotal < restaurant.minOrder}>View cart <ArrowRight size={18} /></Button></Link>
          </div>
        </>
      ) : <p className="mt-4 rounded-2xl bg-cream p-5 text-center text-sm text-ink/50">Your cart is empty. Tap any dish to add it.</p>}
    </aside>
  );
}

function Reviews({ restaurant }) {
  const { data = [] } = useQuery({ queryKey: ["reviews", restaurant.id], queryFn: () => getReviews(restaurant.id) });
  const bars = [[5, 78], [4, 16], [3, 4], [2, 1], [1, 1]];
  return (
    <div className="mt-8 grid gap-6 md:grid-cols-[240px_1fr]">
      <div className="rounded-3xl bg-ink p-6 text-white">
        <p className="font-display text-6xl font-extrabold">{restaurant.rating}</p>
        <div className="mt-2 flex text-sun">{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={16} fill="currentColor" />)}</div>
        <p className="mt-2 text-sm text-white/55">{restaurant.reviews} reviews</p>
        <div className="mt-5 space-y-2">{bars.map(([stars, pct]) => <div key={stars} className="flex items-center gap-2 text-xs"><span className="w-3">{stars}</span><div className="h-1.5 flex-1 rounded-full bg-white/15"><div className="h-full rounded-full bg-sun" style={{ width: `${pct}%` }} /></div></div>)}</div>
      </div>
      <div className="space-y-3">{data.map((review, index) => (
        <article key={index} className="rounded-2xl border border-ink/8 bg-white p-5">
          <div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-mint font-display font-bold text-leaf">{review.name[0]}</span><div><p className="text-sm font-bold">{review.name}</p><p className="text-xs text-ink/40">{review.date}</p></div></div><span className="flex text-sun">{Array.from({ length: review.rating }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}</span></div>
          <p className="mt-3 text-sm leading-6 text-ink/65">{review.text}</p>
        </article>
      ))}</div>
    </div>
  );
}

export function RestaurantDetailPage() {
  const { id } = useParams();
  const [tab, setTab] = useState("menu");
  const [query, setQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const restaurantQuery = useQuery({ queryKey: ["restaurant", id], queryFn: () => getRestaurant(id) });
  const menuQuery = useQuery({ queryKey: ["menu", id], queryFn: () => getMenu(id) });
  const restaurant = restaurantQuery.data;
  const viewRestaurant = useActivityStore((state) => state.viewRestaurant);
  useEffect(() => { if (restaurant?.id) viewRestaurant(restaurant.id); }, [restaurant?.id, viewRestaurant]);
  if (restaurantQuery.isLoading) return <div className="mx-auto max-w-7xl px-4 py-10"><PageSkeleton cards={3} /></div>;
  if (restaurantQuery.isError || !restaurant) return <div className="mx-auto max-w-7xl px-4 py-10"><ErrorState onRetry={restaurantQuery.refetch} /></div>;

  const all = menuQuery.data || [];
  const filtered = all.filter((item) => (!vegOnly || item.veg) && `${item.name} ${item.description}`.toLowerCase().includes(query.toLowerCase()));
  const categories = [...new Set(filtered.map((item) => item.category))];
  const popular = filtered.filter((item) => item.bestseller).slice(0, 4);
  const infoRows = [[Clock3, "Hours", restaurant.hours], [MapPin, "Address", restaurant.address], [Bike, "Delivery", `${restaurant.distance} mi away · ${restaurant.deliveryFee ? `$${restaurant.deliveryFee.toFixed(2)} fee` : "Free delivery"}`], [Store, "Minimum order", `$${restaurant.minOrder.toFixed(2)}`]];

  return (
    <div>
      <section className="relative h-[360px] overflow-hidden sm:h-[440px]">
        <img src={restaurant.image} alt={`${restaurant.name} signature dish`} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-8 text-white sm:px-6 lg:px-8">
          <Link to="/restaurants" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white"><ArrowLeft size={17} />All restaurants</Link>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="flex flex-wrap items-center gap-2"><Badge tone="orange">{restaurant.cuisine}</Badge>{restaurant.badge && <Badge tone="gray">{restaurant.badge}</Badge>}<span className="text-sm font-semibold text-white/60">{"$".repeat(restaurant.priceLevel)}</span></div>
              <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-6xl">{restaurant.name}</h1>
              <p className="mt-2 max-w-2xl text-white/70">{restaurant.description}</p>
            </div>
            <div className="flex items-center gap-2"><span className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-ink"><Star size={16} fill="#ffc857" className="text-sun" />{restaurant.rating} ({restaurant.reviews})</span><span className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-3 text-sm font-bold backdrop-blur"><Clock3 size={16} />{restaurant.eta}</span><FavoriteButton restaurantId={restaurant.id} className="!h-11 !w-11" /></div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {restaurant.promo && <div className="flex items-center gap-3 rounded-2xl bg-sun px-5 py-3 text-sm font-bold"><Percent size={18} />{restaurant.promo}</div>}
        <div className="mt-6 flex gap-1 border-b border-ink/10">{[["menu", "Menu"], ["reviews", "Reviews"], ["info", "Info"]].map(([key, label]) => <button key={key} onClick={() => setTab(key)} className={`-mb-px border-b-2 px-5 py-3 font-display font-bold transition ${tab === key ? "border-tangerine text-ink" : "border-transparent text-ink/45 hover:text-ink"}`}>{label}</button>)}</div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8">
        <div className="min-w-0">
          {tab === "menu" && (
            <>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Input icon={Search} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${restaurant.name}'s menu`} />
                <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-mint px-4 py-3 text-sm font-bold text-leaf"><input type="checkbox" checked={vegOnly} onChange={(event) => setVegOnly(event.target.checked)} className="accent-leaf" />Vegetarian only</label>
              </div>
              {categories.length > 0 && <div className="hide-scrollbar sticky top-[72px] z-20 -mx-4 mt-4 flex gap-2 overflow-x-auto border-b border-ink/8 bg-cream/95 px-4 py-3 backdrop-blur sm:mx-0 sm:px-0">{categories.map((category) => <a key={category} href={`#cat-${category}`} className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-bold ring-1 ring-ink/8 hover:ring-tangerine">{category}</a>)}</div>}
              {menuQuery.isLoading ? <div className="mt-6"><PageSkeleton cards={4} /></div> : menuQuery.isError ? <ErrorState onRetry={menuQuery.refetch} /> : filtered.length ? (
                <div className="mt-7 space-y-12">
                  {popular.length > 0 && !query && !vegOnly && !categories.includes("Popular") && (
                    <section><h2 className="mb-4 font-display text-2xl font-extrabold">Popular right now</h2><div className="grid gap-5 lg:grid-cols-2">{popular.map((item) => <MenuItemCard key={`pop-${item.id}`} item={item} restaurant={restaurant} />)}</div></section>
                  )}
                  {categories.map((category) => <section id={`cat-${category}`} key={category} className="scroll-mt-36"><h2 className="mb-4 font-display text-2xl font-extrabold">{category}</h2><div className="grid gap-5 lg:grid-cols-2">{filtered.filter((item) => item.category === category).map((item) => <MenuItemCard key={item.id} item={item} restaurant={restaurant} />)}</div></section>)}
                </div>
              ) : <div className="mt-6"><EmptyState title="No dishes found" message="Try a different search or turn off the vegetarian filter." /></div>}
            </>
          )}
          {tab === "reviews" && <Reviews restaurant={restaurant} />}
          {tab === "info" && (
            <div className="mt-2 grid gap-4 sm:grid-cols-2">{infoRows.map(([Icon, label, value]) => <div key={label} className="flex gap-4 rounded-2xl border border-ink/8 bg-white p-5"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-mint text-leaf"><Icon size={20} /></span><div><p className="text-xs font-bold uppercase tracking-wider text-ink/40">{label}</p><p className="mt-1 font-semibold">{value}</p></div></div>)}
              <div className="rounded-2xl border border-ink/8 bg-white p-5 sm:col-span-2"><p className="text-xs font-bold uppercase tracking-wider text-ink/40">Known for</p><div className="mt-3 flex flex-wrap gap-2">{restaurant.tags.map((tag) => <Badge key={tag} tone="gray">{tag}</Badge>)}</div></div>
            </div>
          )}
        </div>
        <div className="hidden lg:block"><MiniCart restaurant={restaurant} /></div>
      </div>
    </div>
  );
}
