import { Flame, Leaf, Minus, Plus, Star } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "../store/cartStore";
import { addToCart, buildCartLine } from "../utils/cart";
import DishModal from "./DishModal";
import FavoriteButton from "./FavoriteButton";

export default function MenuItemCard({ item, restaurant }) {
  const { items, updateQuantity } = useCartStore();
  const [open, setOpen] = useState(false);
  const lines = items.filter((entry) => (entry.baseId || entry.id) === item.id);
  const quantity = lines.reduce((sum, entry) => sum + entry.quantity, 0);
  const simple = !(item.options || []).length;
  const simpleLine = simple ? lines.find((entry) => entry.id === item.id) : null;

  const quickAdd = (event) => {
    event.stopPropagation();
    if (simple) addToCart(buildCartLine(item), restaurant);
    else setOpen(true);
  };

  return (
    <>
      <article onClick={() => setOpen(true)} className={`group flex cursor-pointer gap-4 rounded-2xl border border-ink/8 bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(23,35,29,.1)] sm:p-4 ${!item.available ? "opacity-60" : ""}`}>
        <div className="min-w-0 flex-1 py-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={`h-3 w-3 rounded-sm border-2 ${item.veg ? "border-leaf" : "border-tangerine"} grid place-items-center`}><span className={`h-1.5 w-1.5 rounded-full ${item.veg ? "bg-leaf" : "bg-tangerine"}`} /></span>
            {item.bestseller && <span className="rounded-full bg-sun px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">Bestseller</span>}
            {item.spicy > 0 && <span className="flex text-tangerine">{Array.from({ length: item.spicy }).map((_, index) => <Flame key={index} size={13} fill="currentColor" />)}</span>}
          </div>
          <h3 className="font-display text-lg font-bold leading-tight">{item.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-ink/55">{item.description}</p>
          <div className="mt-3 flex items-center gap-3 text-xs font-semibold text-ink/45">
            <span className="font-display text-base font-bold text-ink">${item.price.toFixed(2)}</span>
            <span className="flex items-center gap-1"><Star size={12} fill="#ffc857" className="text-sun" />{item.rating}</span>
            <span>{item.calories} kcal</span>
          </div>
        </div>
        <div className="relative h-28 w-28 shrink-0 sm:h-32 sm:w-36">
          <img src={item.image} alt={item.name} loading="lazy" className="h-full w-full rounded-xl bg-ink/5 object-cover transition duration-500 group-hover:scale-[1.03]" />
          <FavoriteButton dish={{ ...item, restaurant: { id: restaurant.id, name: restaurant.name, deliveryFee: restaurant.deliveryFee } }} className="absolute left-1.5 top-1.5 !h-7 !w-7" />
          <div className="absolute inset-x-0 -bottom-3 flex justify-center" onClick={(event) => event.stopPropagation()}>
            {simpleLine ? (
              <div className="flex items-center rounded-xl bg-white p-0.5 shadow-lg ring-1 ring-ink/10">
                <button className="p-2" onClick={() => updateQuantity(simpleLine.id, simpleLine.quantity - 1)} aria-label="Decrease"><Minus size={14} /></button>
                <span className="w-6 text-center text-sm font-bold">{simpleLine.quantity}</span>
                <button className="p-2" onClick={quickAdd} aria-label="Increase"><Plus size={14} /></button>
              </div>
            ) : (
              <button onClick={quickAdd} disabled={!item.available} className="flex items-center gap-1 rounded-xl bg-white px-4 py-2 text-sm font-extrabold text-tangerine shadow-lg ring-1 ring-ink/10 transition hover:bg-tangerine hover:text-white disabled:text-ink/40">
                {item.available ? <><Plus size={14} />{quantity ? `Add (${quantity})` : "Add"}</> : "Sold out"}
              </button>
            )}
          </div>
        </div>
      </article>
      {open && <DishModal item={item} restaurant={restaurant} onClose={() => setOpen(false)} />}
    </>
  );
}
