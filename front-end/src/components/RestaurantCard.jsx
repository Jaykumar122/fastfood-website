import { Bike, Clock3, Percent, Star } from "lucide-react";
import { Link } from "react-router-dom";
import FavoriteButton from "./FavoriteButton";

export default function RestaurantCard({ restaurant }) {
  return (
    <Link to={`/restaurants/${restaurant.id}`} className="group block overflow-hidden rounded-3xl border border-ink/8 bg-white p-2 shadow-[0_10px_40px_rgba(23,35,29,.06)] transition hover:-translate-y-1 hover:shadow-[0_16px_45px_rgba(23,35,29,.12)]">
      <div className="relative h-52 overflow-hidden rounded-[20px] bg-ink/5">
        <img src={restaurant.image} alt={`${restaurant.name} food`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
        {restaurant.badge && <span className="absolute left-3 top-3 rounded-full bg-sun px-3 py-1.5 text-xs font-extrabold">{restaurant.badge}</span>}
        <FavoriteButton restaurantId={restaurant.id} className="absolute right-3 top-3" />
        {restaurant.promo && <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-tangerine px-3 py-1.5 text-xs font-bold text-white"><Percent size={12} />{restaurant.promo}</span>}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-xl font-bold">{restaurant.name}</h3>
            <p className="mt-1 truncate text-sm text-ink/50">{restaurant.cuisine} · <span className="text-ink/80">{"$".repeat(restaurant.priceLevel)}</span><span className="text-ink/20">{"$".repeat(4 - restaurant.priceLevel)}</span> · {restaurant.distance} mi</p>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-lg bg-mint px-2 py-1 text-sm font-bold text-leaf"><Star size={14} fill="currentColor" />{restaurant.rating}</span>
        </div>
        <div className="mt-4 flex items-center gap-4 border-t border-ink/8 pt-3 text-xs font-semibold text-ink/55">
          <span className="flex items-center gap-1.5"><Clock3 size={15} />{restaurant.eta}</span>
          <span className="flex items-center gap-1.5"><Bike size={15} />{restaurant.deliveryFee ? `$${restaurant.deliveryFee.toFixed(2)}` : "Free"}</span>
          <span className="ml-auto text-ink/40">{restaurant.reviews} reviews</span>
        </div>
      </div>
    </Link>
  );
}
