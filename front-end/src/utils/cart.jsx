import toast from "react-hot-toast";
import { useCartStore } from "../store/cartStore";

export const buildCartLine = (item, selections = {}, note = "") => {
  const picked = (item.options || []).flatMap((group) => (selections[group.id] || []).map((name) => ({ group, choice: group.choices.find((choice) => choice.name === name) }))).filter((entry) => entry.choice);
  const extra = picked.reduce((sum, entry) => sum + entry.choice.price, 0);
  const customization = picked.map((entry) => entry.choice.name).join(" · ");
  const signature = [picked.map((entry) => entry.choice.name).join("|"), note.trim()].join("#");
  const baseId = item.baseId || item.id;
  return { ...item, baseId, id: signature === "#" ? baseId : `${baseId}::${signature}`, price: +(item.price + extra).toFixed(2), customization, note: note.trim() };
};

export function addToCart(line, restaurant, quantity = 1) {
  const store = useCartStore.getState();
  if (store.addItem(line, restaurant, quantity)) {
    toast.success(`${quantity > 1 ? `${quantity} × ` : ""}${line.name} added`);
    return true;
  }
  toast.custom((t) => (
    <div className="max-w-sm rounded-2xl bg-ink p-4 text-sm text-white shadow-2xl">
      <p className="font-bold">Start a new cart?</p>
      <p className="mt-1 text-white/65">Your cart has items from {store.restaurant?.name}. Adding from {restaurant.name} will clear it.</p>
      <div className="mt-3 flex gap-2">
        <button className="rounded-lg bg-tangerine px-3 py-2 font-bold" onClick={() => { store.replaceRestaurant([{ ...line, quantity }], restaurant); toast.dismiss(t.id); toast.success(`${line.name} added to a new cart`); }}>Start new cart</button>
        <button className="rounded-lg bg-white/10 px-3 py-2 font-bold" onClick={() => toast.dismiss(t.id)}>Keep current</button>
      </div>
    </div>
  ), { duration: 8000 });
  return false;
}
