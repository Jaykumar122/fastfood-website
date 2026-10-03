import { ArrowRight, ShoppingBag } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { getCartTotals, useCartStore } from "../store/cartStore";

export default function FloatingCartBar() {
  const { items, restaurant, promo } = useCartStore();
  const { pathname } = useLocation();
  if (!items.length || (["/cart", "/checkout"].includes(pathname) || /login|register|signup/.test(pathname))) return null;
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const { subtotal } = getCartTotals(items, 0, promo);
  return (
    <Link to="/cart" className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between rounded-2xl bg-ink p-4 text-white shadow-[0_16px_40px_rgba(23,35,29,.4)] transition hover:bg-leaf lg:hidden">
      <span className="flex items-center gap-3"><span className="relative grid h-10 w-10 place-items-center rounded-xl bg-tangerine"><ShoppingBag size={20} /><span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-sun px-1 text-[11px] font-extrabold text-ink">{count}</span></span><span><strong className="block text-sm">View cart</strong><span className="text-xs text-white/55">{restaurant?.name}</span></span></span>
      <span className="flex items-center gap-2 font-display font-bold">${subtotal.toFixed(2)}<ArrowRight size={18} /></span>
    </Link>
  );
}
