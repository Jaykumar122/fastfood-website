import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BadgePercent, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Copy, MapPin, Plus, Quote, Search, ShieldCheck, Star, Truck, UtensilsCrossed, Zap } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { getPopularDishes, getRestaurants } from "../api/services";
import DishModal from "../components/DishModal";
import BurgerVideo from "../components/BurgerVideo.jsx";
import SandwichShowcase from "../components/SandwichShowcase";
import FavoriteButton from "../components/FavoriteButton";
import RestaurantCard from "../components/RestaurantCard";
import { PageSkeleton } from "../components/states";
import { Button } from "../components/ui";
import { cuisineList, photos } from "../mocks/data";
import { QuickReorder, RecentlyViewed, SurpriseMe } from "./CustomerExtras";

const offers = [
  { code: "RUSH20", title: "20% off your first rush", text: "On any order from Stacked & Smashed.", tone: "bg-tangerine text-white", image: photos.burger[1] },
  { code: "FREESHIP", title: "Free delivery, all week", text: "Zero delivery fees on every restaurant.", tone: "bg-leaf text-white", image: photos.pizza[1] },
  { code: "SAVE5", title: "$5 off dinner", text: "Treat yourself after 6 PM, no minimum.", tone: "bg-sun text-ink", image: photos.dessert[1] },
];

const steps = [
  { icon: Search, title: "Pick your craving", text: "Browse 12+ kitchens, filter by cuisine, price and rating." },
  { icon: UtensilsCrossed, title: "Customize & order", text: "Choose sizes, add extras, leave notes, apply a promo code." },
  { icon: Truck, title: "Track it live", text: "Follow your order from the kitchen to your door in real time." },
];

const testimonials = [
  { name: "Priya Shah", role: "Product designer", text: "The tracking is spot-on and the food shows up hot. fastfood replaced every other app on my phone." },
  { name: "Marcus Bell", role: "Software engineer", text: "Customizing a burger with extras and a note actually works. They got my order exactly right, every time." },
  { name: "Lena Ortiz", role: "Teacher", text: "Free delivery codes, great photos, honest ratings. It is the only place I check on Friday night." },
];

function DishTile({ dish, onOpen }) {
  return (
    <article onClick={() => onOpen(dish)} className="group w-64 shrink-0 cursor-pointer snap-start overflow-hidden rounded-3xl border border-ink/8 bg-white transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(23,35,29,.12)]">
      <div className="relative h-44 overflow-hidden bg-ink/5">
        <img src={dish.image} alt={dish.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <FavoriteButton dish={dish} className="absolute right-3 top-3" />
        <span className="absolute left-3 top-3 rounded-full bg-sun px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider">Bestseller</span>
      </div>
      <div className="p-4">
        <h3 className="truncate font-display text-lg font-bold">{dish.name}</h3>
        <p className="mt-0.5 truncate text-xs text-ink/50">{dish.restaurant.name}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-display text-lg font-bold">${dish.price.toFixed(2)}</span>
          <span className="flex items-center gap-1 text-xs font-bold text-ink/55"><Star size={13} fill="#ffc857" className="text-sun" />{dish.rating}</span>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-tangerine text-white transition group-hover:scale-110"><Plus size={18} /></span>
        </div>
      </div>
    </article>
  );
}

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [dish, setDish] = useState(null);
  const rail = useRef(null);
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ["restaurants", "home"], queryFn: () => getRestaurants({ sort: "popular" }) });
  const dishes = useQuery({ queryKey: ["dishes", "popular"], queryFn: getPopularDishes });

  const submit = (event) => {
    event.preventDefault();
    navigate(`/restaurants?search=${encodeURIComponent(search)}`);
  };
  const scroll = (direction) => rail.current?.scrollBy({ left: direction * 540, behavior: "smooth" });
  const copy = (code) => { navigator.clipboard?.writeText(code); toast.success(`${code} copied. Apply it in your cart.`); };

  return (
    <>
      <section className="overflow-hidden px-4 pb-8 pt-8 sm:px-6 lg:px-8 lg:pb-12">
        <div className="relative mx-auto grid min-h-[610px] max-w-7xl overflow-hidden rounded-[32px] bg-leaf text-white lg:grid-cols-[1.05fr_.95fr]">
          <div className="relative z-10 flex flex-col justify-center p-7 sm:p-12 lg:p-16">
            <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-xs font-bold uppercase tracking-[.18em]"><Zap size={14} fill="currentColor" className="text-sun" /> Fast, fresh, at your door</span>
            <h1 className="font-display max-w-3xl text-5xl font-extrabold leading-[.98] tracking-[-.04em] sm:text-6xl lg:text-7xl">
              Your cravings.<br /><span className="text-sun">Delivered.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/70 sm:text-lg">Burgers, wood-fired pizza, ramen, curries and more from the neighborhood's best kitchens, at your door in about 25 minutes.</p>
            <form onSubmit={submit} className="mt-8 flex max-w-xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row">
              <label className="flex min-w-0 flex-1 items-center gap-3 px-3 text-ink">
                <Search className="shrink-0 text-tangerine" size={20} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full py-3 text-sm placeholder:text-ink/40" placeholder="Search dishes, cuisines or restaurants" aria-label="Search" />
              </label>
              <Button type="submit" size="lg">Find food <ArrowRight size={18} /></Button>
            </form>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Pizza", "Ramen", "Tacos", "Biryani", "Pancakes"].map((term) => <Link key={term} to={`/restaurants?search=${term}`} className="rounded-full border border-white/20 px-3.5 py-1.5 text-xs font-bold text-white/80 transition hover:bg-white hover:text-ink">{term}</Link>)}
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/65">
              <span className="flex items-center gap-2"><Clock3 size={17} />25 min average</span>
              <span className="flex items-center gap-2"><ShieldCheck size={17} />Live order tracking</span>
              <span className="flex items-center gap-2"><Star size={17} />4.8 average rating</span>
            </div>
          </div>
          <div className="relative min-h-[360px] lg:min-h-full">
            <img src={photos.burger[4]} alt="Crispy fried chicken ready for delivery" className="absolute inset-0 h-full w-full object-cover" />
            <BurgerVideo />
            <div className="absolute inset-0 bg-gradient-to-t from-leaf via-transparent to-transparent lg:bg-gradient-to-r" />
            <div className="absolute bottom-7 left-7 right-7 flex items-center gap-3 rounded-2xl bg-white p-4 text-ink shadow-2xl sm:left-auto sm:w-72 lg:bottom-12 lg:right-10">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-mint text-leaf"><CheckCircle2 /></span>
              <div><p className="text-xs font-bold uppercase tracking-wider text-ink/40">Order update</p><p className="mt-1 font-display font-bold">Rider is 4 min away</p></div>
            </div>
          </div>
        </div>
      </section>

      <SandwichShowcase />

      <QuickReorder />
      <RecentlyViewed />
      <SurpriseMe />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-tangerine">Pick your flavor</p><h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">What are you craving?</h2></div>
          <Link to="/restaurants" className="hidden items-center gap-1 text-sm font-bold text-leaf sm:flex">View all <ChevronRight size={17} /></Link>
        </div>
        <div className="hide-scrollbar mt-7 flex gap-4 overflow-x-auto pb-2">
          {cuisineList.map((cuisine) => (
            <Link key={cuisine.name} to={`/restaurants?cuisine=${cuisine.name}`} className="group w-36 shrink-0 text-center">
              <span className="block aspect-square overflow-hidden rounded-full bg-ink/5 ring-4 ring-transparent transition group-hover:ring-tangerine"><img src={cuisine.image} alt={cuisine.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" /></span>
              <span className="mt-3 block font-display font-bold">{cuisine.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {offers.map((offer) => (
            <article key={offer.code} className={`relative flex min-h-48 overflow-hidden rounded-3xl p-6 ${offer.tone}`}>
              <div className="relative z-10 flex max-w-[62%] flex-col justify-between">
                <div><BadgePercent size={24} /><h3 className="mt-3 font-display text-xl font-extrabold leading-tight">{offer.title}</h3><p className="mt-1 text-sm opacity-75">{offer.text}</p></div>
                <button onClick={() => copy(offer.code)} className="mt-4 flex w-fit items-center gap-2 rounded-xl border-2 border-dashed border-current px-3 py-1.5 text-sm font-extrabold tracking-wider transition hover:bg-white/20">{offer.code}<Copy size={14} /></button>
              </div>
              <img src={offer.image} alt="" className="absolute -right-8 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full border-4 border-white/30 object-cover" />
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-tangerine">Bestsellers</p><h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Most-ordered dishes</h2></div>
          <div className="hidden gap-2 sm:flex">
            <button onClick={() => scroll(-1)} className="grid h-11 w-11 place-items-center rounded-full border border-ink/12 bg-white hover:border-ink" aria-label="Scroll left"><ChevronLeft size={20} /></button>
            <button onClick={() => scroll(1)} className="grid h-11 w-11 place-items-center rounded-full bg-ink text-white hover:bg-leaf" aria-label="Scroll right"><ChevronRight size={20} /></button>
          </div>
        </div>
        <div ref={rail} className="hide-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
          {dishes.isLoading ? Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-72 w-64 shrink-0 animate-pulse rounded-3xl bg-ink/8" />) : dishes.data?.map((item) => <DishTile key={item.id} dish={item} onOpen={setDish} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-tangerine">Local favorites</p><h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Popular near you</h2></div><Link to="/restaurants" className="text-sm font-bold text-leaf">See all restaurants</Link></div>
        {isLoading ? <PageSkeleton cards={6} /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data?.content.slice(0, 6).map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}</div>}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-ink p-8 text-white sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-sun">How it works</p>
          <h2 className="mt-2 max-w-xl font-display text-3xl font-extrabold sm:text-4xl">From craving to doorstep in three taps.</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="relative">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-tangerine"><step.icon size={26} /></span>
                <span className="absolute right-0 top-0 font-display text-6xl font-extrabold text-white/8">0{index + 1}</span>
                <h3 className="mt-5 font-display text-xl font-bold">{step.title}</h3>
                <p className="mt-2 leading-7 text-white/60">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-tangerine">Loved by hungry people</p><h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Eaters are talking.</h2></div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {testimonials.map((item) => (
            <figure key={item.name} className="rounded-3xl border border-ink/8 bg-white p-6">
              <Quote className="text-sun" fill="currentColor" size={28} />
              <blockquote className="mt-4 leading-7 text-ink/70">{item.text}</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-ink/8 pt-4"><span className="grid h-10 w-10 place-items-center rounded-full bg-mint font-display font-bold text-leaf">{item.name[0]}</span><span><strong className="block text-sm">{item.name}</strong><span className="text-xs text-ink/45">{item.role}</span></span></figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-[32px] bg-sun p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center lg:p-16">
          <div><span className="flex items-center gap-2 text-sm font-bold"><MapPin size={18} />Now delivering to more neighborhoods</span><h2 className="mt-4 max-w-2xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">Dinner plans just got ridiculously easy.</h2></div>
          <Button variant="dark" size="lg" className="mt-8 lg:mt-0" onClick={() => navigate("/restaurants")}>Order something great <ArrowRight size={18} /></Button>
        </div>
      </section>
      {dish && <DishModal item={dish} restaurant={dish.restaurant} onClose={() => setDish(null)} />}
    </>
  );
}
