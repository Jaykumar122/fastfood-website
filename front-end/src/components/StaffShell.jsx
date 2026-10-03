import { LogOut, Zap } from "lucide-react";
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { loginPathForPath, PORTALS } from "../pages/AuthPages";
import { useAuthStore } from "../store/authStore";
import { isTokenExpired } from "../routes/guards";

const links = {
  RESTAURANT_OWNER: [{ to: "/owner", label: "Dashboard" }],
  DELIVERY_PARTNER: [{ to: "/delivery", label: "Deliveries" }],
  ADMIN: [{ to: "/admin", label: "Overview" }],
};

export default function StaffShell() {
  const { token, user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const isStaff = Boolean(
    token &&
    user &&
    !isTokenExpired(token) &&
    ["RESTAURANT_OWNER", "DELIVERY_PARTNER", "ADMIN"].includes(user?.role)
  );

  // If not authenticated as staff, redirect to the specific portal login
  if (!isStaff) {
    const target = loginPathForPath(location.pathname);
    return <Navigate to={target} state={{ from: location.pathname }} replace />;
  }

  const portal = PORTALS[user?.role];
  const signOut = () => { logout(); navigate(portal?.login || "/login", { replace: true }); };

  return (
    <div className="noise min-h-screen">
      <header className="sticky top-0 z-40 border-b border-ink/8 bg-cream/92 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 font-display text-xl font-extrabold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-tangerine text-white shadow-[0_4px_0_#c83d15]"><Zap size={20} fill="currentColor" /></span>
            <span>fast<span className="text-tangerine">food</span></span>
            <span className="ml-1 hidden rounded-full bg-mint px-3 py-1 font-sans text-xs font-bold text-leaf sm:inline">{portal?.label}</span>
          </div>
          <nav className="flex items-center gap-3 sm:gap-5">
            {(links[user?.role] || []).map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                state={{ allowedNav: true }}
                end
                className={({ isActive }) => `text-xs font-bold sm:text-sm ${isActive ? "text-tangerine" : "text-ink/65 hover:text-ink"}`}
              >
                {link.label}
              </NavLink>
            ))}
            <span className="hidden rounded-xl bg-white px-3 py-2 text-sm font-semibold sm:block">{user?.name?.split(" ")[0]}</span>
            <button onClick={signOut} className="rounded-xl p-3 hover:bg-ink/5" aria-label="Sign out"><LogOut size={19} /></button>
          </nav>
        </div>
      </header>
      <main><Outlet /></main>
    </div>
  );
}
