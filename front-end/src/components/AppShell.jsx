import { Camera, Globe, Play, Zap } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import FloatingCartBar from "./FloatingCartBar";
import Navbar from "./Navbar";

const columns = [
  { title: "Explore", links: [["Restaurants", "/restaurants"], ["Burgers", "/restaurants?cuisine=Burgers"], ["Pizza & pasta", "/restaurants?cuisine=Italian"], ["Desserts", "/restaurants?cuisine=Desserts"]] },
  { title: "Company", links: [["About fastfood", "/about"], ["Careers", "/"], ["Press", "/"], ["Blog", "/"]] },
  { title: "Partner with us", links: [["Open a restaurant", "/restaurant"], ["Deliver with us", "/deliver"], ["Offers", "/offers"]] },
  { title: "Support", links: [["Help center", "/help"], ["Privacy", "/"], ["Terms", "/"], ["Contact", "/"]] },
];

export default function AppShell() {
  return (
    <div className="noise min-h-screen">
      <Navbar />
      <main><Outlet /></main>
      <footer className="mt-16 bg-ink px-4 pb-24 pt-14 text-white lg:pb-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
            <div>
              <Link to="/" className="flex items-center gap-2 font-display text-2xl font-extrabold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-tangerine"><Zap size={20} fill="currentColor" /></span>fast<span className="-ml-2 text-tangerine">food</span></Link>
              <p className="mt-4 max-w-xs text-sm leading-6 text-white/55">Good food, moving fast. Fresh meals from your favorite local kitchens, tracked live to your door.</p>
              <div className="mt-5 flex gap-3">{[Camera, Globe, Play].map((Icon, index) => <a key={index} href="#" aria-label="Social link" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-tangerine"><Icon size={17} /></a>)}</div>
            </div>
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="font-display font-bold">{column.title}</h3>
                <ul className="mt-4 space-y-3 text-sm text-white/55">{column.links.map(([label, to]) => <li key={label}><Link to={to} className="transition hover:text-white">{label}</Link></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row"><p>© 2026 fastfood. Delivery made delicious.</p><p>Photography via Unsplash contributors.</p></div>
        </div>
      </footer>
      <FloatingCartBar />
    </div>
  );
}
