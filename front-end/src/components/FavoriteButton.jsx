import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import { useFavoritesStore } from "../store/favoritesStore";

export default function FavoriteButton({ restaurantId, dish, className = "" }) {
  const { restaurants, dishes, toggleRestaurant, toggleDish } = useFavoritesStore();
  const active = dish ? dishes.some((entry) => entry.id === dish.id) : restaurants.includes(restaurantId);
  const onClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    dish ? toggleDish(dish) : toggleRestaurant(restaurantId);
    toast(active ? "Removed from favorites" : "Saved to favorites", { icon: active ? "💔" : "❤️", duration: 1500 });
  };
  return (
    <button type="button" onClick={onClick} aria-pressed={active} aria-label={active ? "Remove from favorites" : "Save to favorites"} className={`grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-md transition hover:scale-110 ${className}`}>
      <Heart size={17} className={active ? "fill-tangerine text-tangerine" : "text-ink/60"} />
    </button>
  );
}
