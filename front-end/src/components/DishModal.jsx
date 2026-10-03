import { Flame, Leaf, Minus, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { addToCart, buildCartLine } from "../utils/cart";
import { Button } from "./ui";

export default function DishModal({ item, restaurant, onClose }) {
  const defaults = useMemo(() => Object.fromEntries((item.options || []).filter((group) => group.required).map((group) => [group.id, [group.choices[0].name]])), [item]);
  const [selections, setSelections] = useState(defaults);
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const toggle = (group, name) => setSelections((current) => {
    const existing = current[group.id] || [];
    if (!group.multi) return { ...current, [group.id]: [name] };
    return { ...current, [group.id]: existing.includes(name) ? existing.filter((entry) => entry !== name) : [...existing, name] };
  });

  const line = buildCartLine(item, selections, note);
  const submit = () => { if (addToCart(line, restaurant, quantity)) onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={item.name} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="flex max-h-[94vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl bg-cream shadow-2xl sm:rounded-3xl">
        <div className="relative h-56 shrink-0 bg-ink/10 sm:h-64">
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
          <button onClick={onClose} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white shadow-lg" aria-label="Close"><X size={20} /></button>
        </div>
        <div className="overflow-y-auto p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex flex-wrap gap-2 text-xs font-bold">
                {item.bestseller && <span className="rounded-full bg-sun px-3 py-1">Bestseller</span>}
                {item.veg && <span className="flex items-center gap-1 rounded-full bg-mint px-3 py-1 text-leaf"><Leaf size={12} />Vegetarian</span>}
                {item.spicy > 0 && <span className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-orange-700"><Flame size={12} />{["", "Mild heat", "Spicy", "Very spicy"][item.spicy]}</span>}
              </div>
              <h2 className="font-display text-3xl font-extrabold">{item.name}</h2>
            </div>
            <span className="font-display text-2xl font-extrabold">${item.price.toFixed(2)}</span>
          </div>
          <p className="mt-3 leading-7 text-ink/60">{item.description}</p>
          <p className="mt-2 text-xs font-semibold text-ink/40">{item.calories} kcal · from {restaurant.name}</p>

          {(item.options || []).map((group) => (
            <fieldset key={group.id} className="mt-6">
              <legend className="flex w-full items-center justify-between font-display text-lg font-bold">{group.name}<span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${group.required ? "bg-ink text-white" : "bg-ink/8 text-ink/55"}`}>{group.required ? "Required" : group.multi ? "Optional · pick any" : "Optional"}</span></legend>
              <div className="mt-3 space-y-2">
                {group.choices.map((choice) => {
                  const checked = (selections[group.id] || []).includes(choice.name);
                  return (
                    <label key={choice.name} className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${checked ? "border-tangerine bg-orange-50" : "border-ink/10 bg-white hover:border-ink/30"}`}>
                      <span className="flex items-center gap-3 font-semibold">
                        <input type={group.multi ? "checkbox" : "radio"} name={group.id} checked={checked} onChange={() => toggle(group, choice.name)} className="accent-tangerine" />{choice.name}
                      </span>
                      <span className="text-ink/50">{choice.price ? `+$${choice.price.toFixed(2)}` : "Included"}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}

          <label className="mt-6 block">
            <span className="font-display text-lg font-bold">Special instructions</span>
            <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={140} rows={2} placeholder="Allergies, no onions, extra napkins…" className="mt-3 w-full resize-none rounded-xl border border-ink/12 bg-white px-4 py-3 text-sm placeholder:text-ink/35 focus:border-tangerine" />
          </label>
        </div>
        <div className="flex items-center gap-3 border-t border-ink/8 bg-white p-4">
          <div className="flex items-center rounded-xl bg-cream">
            <button className="p-3 disabled:opacity-30" disabled={quantity <= 1} onClick={() => setQuantity(quantity - 1)} aria-label="Decrease quantity"><Minus size={16} /></button>
            <span className="w-8 text-center font-bold">{quantity}</span>
            <button className="p-3" onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity"><Plus size={16} /></button>
          </div>
          <Button className="flex-1" size="lg" onClick={submit} disabled={!item.available}>{item.available ? `Add to cart · $${(line.price * quantity).toFixed(2)}` : "Sold out"}</Button>
        </div>
      </div>
    </div>
  );
}
