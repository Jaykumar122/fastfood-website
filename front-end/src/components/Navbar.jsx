import { Heart, LogOut, Menu, ShoppingBag, UserRound, X, Zap } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import SearchBox from "./SearchBox";
import { Button } from "./ui";

const roleLinks = {
  CUSTOMER: [{ to: "/favorites", label: "Favorites" }, { to: "/orders", label: "Orders" }, { to: "/profile", label: "Profile" }],
  RESTAURANT_OWNER: [{ to: "/owner", label: "Dashboard" }],
  DELIVERY_PARTNER: [{ to: "/delivery", label: "Deliveries" }],
  ADMIN: [{ to: "/admin", label: "Admin" }],
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const itemCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const navigate = useNavigate();
  const links = user ? roleLinks[user.role] || [] : [];

  const signOut = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink/8 bg-cream/92 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-tangerine text-white shadow-[0_4px_0_#c83d15]"><Zap size={20} fill="currentColor" /></span>
          fast<span className="-ml-2 text-tangerine">food</span>
        </Link>
        <SearchBox className="mx-4 hidden max-w-xs flex-1 lg:block" />
        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/restaurants" className={({ isActive }) => `text-sm font-bold ${isActive ? "text-tangerine" : "text-ink/65 hover:text-ink"}`}>Explore</NavLink>
          {(!user || user.role === "CUSTOMER") && [["/offers", "Offers"], ["/about", "About"], ["/help", "Help"]].map(([to, label]) => <NavLink key={to} to={to} className={({ isActive }) => `text-sm font-bold ${isActive ? "text-tangerine" : "text-ink/65 hover:text-ink"}`}>{label}</NavLink>)}
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              state={{ allowedNav: true }}
              end
              className={({ isActive }) => `text-sm font-bold ${isActive ? "text-tangerine" : "text-ink/65 hover:text-ink"}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {(!user || user.role === "CUSTOMER") && (
            <Link to="/cart" className="relative rounded-xl p-3 hover:bg-ink/5" aria-label="Cart">
              <ShoppingBag size={21} />
              {itemCount > 0 && <span className="absolute right-1 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-tangerine px-1 text-[10px] font-bold text-white">{itemCount}</span>}
            </Link>
          )}
          {user ? (
            <>
              <Link
                to="/profile"
                state={{ allowedNav: true }}
                className="ml-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold hover:bg-ink/5"
              >
                {user.name?.split(" ")[0]}
              </Link>
              <button onClick={signOut} className="rounded-xl p-3 hover:bg-ink/5" aria-label="Sign out"><LogOut size={19} /></button>
            </>
          ) : <Button size="sm" onClick={() => navigate("/login")}>Sign in</Button>}
        </div>
        <button className="rounded-xl p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="border-t border-ink/8 bg-cream p-4 md:hidden">
          <nav className="grid gap-2">
            <Link to="/restaurants" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 font-bold hover:bg-white">Explore restaurants</Link>
            {(!user || user.role === "CUSTOMER") && [["/offers", "Offers & promo codes"], ["/help", "Help center"]].map(([to, label]) => <Link key={to} to={to} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 font-bold hover:bg-white">{label}</Link>)}
            <div className="px-1 py-1"><SearchBox /></div>
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                state={{ allowedNav: true }}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 font-bold hover:bg-white"
              >
                {link.label}
              </Link>
            ))}
            {(!user || user.role === "CUSTOMER") && <Link to="/cart" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 font-bold hover:bg-white"><ShoppingBag size={18} />Cart ({itemCount})</Link>}
            {user ? <button onClick={signOut} className="flex items-center gap-3 rounded-xl px-4 py-3 text-left font-bold hover:bg-white"><LogOut size={18} />Sign out</button> : <Link to="/login" onClick={() => setOpen(false)} className="rounded-xl bg-tangerine px-4 py-3 text-center font-bold text-white">Sign in</Link>}
          </nav>
        </div>
      )}
    </header>
  );
}
