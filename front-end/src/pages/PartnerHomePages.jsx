import { ArrowRight, BarChart3, Bike, CalendarClock, Check, ChefHat, Clock3, Smartphone, Store, TrendingUp, Wallet, Zap } from "lucide-react";
import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Button } from "../components/ui";
import { PORTALS } from "./AuthPages";

const img = (id, w = 1400) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export function PartnerShell() {
  return (
    <div className="noise min-h-screen">
      <header className="sticky top-0 z-40 border-b border-ink/8 bg-cream/92 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-tangerine text-white"><Zap size={20} fill="currentColor" /></span>fast<span className="-ml-2 text-tangerine">food</span></Link>
          <nav className="flex items-center gap-2 text-sm font-bold">
            <Link to="/restaurant" className="hidden rounded-xl px-3 py-2 text-ink/65 hover:text-ink sm:block">For restaurants</Link>
            <Link to="/deliver" className="hidden rounded-xl px-3 py-2 text-ink/65 hover:text-ink sm:block">For riders</Link>
            <Link to="/"><Button size="sm" variant="ghost">Order food</Button></Link>
          </nav>
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="bg-ink px-4 py-8 text-center text-xs text-white/45">© 2026 fastfood partners. <Link to="/admin/login" className="ml-3 hover:text-white">Staff</Link></footer>
    </div>
  );
}

function Steps({ steps }) {
  return <div className="grid gap-5 md:grid-cols-3">{steps.map(([title, text], index) => <div key={title} className="rounded-3xl border border-ink/8 bg-white p-7"><span className="grid h-10 w-10 place-items-center rounded-full bg-tangerine font-display font-bold text-white">{index + 1}</span><h3 className="mt-5 font-display text-xl font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-ink/55">{text}</p></div>)}</div>;
}

function Cta({ portal, dark, label }) {
  return (
    <div className="flex flex-wrap gap-3">
      <Link to={portal.register}><Button size="lg">{label} <ArrowRight size={18} /></Button></Link>
      <Link to={portal.login}><Button size="lg" variant={dark ? "ghost" : "dark"} className={dark ? "border border-white/30 !text-white hover:!bg-white/10" : ""}>Partner sign in</Button></Link>
    </div>
  );
}

export function RestaurantHome() {
  const portal = PORTALS.RESTAURANT_OWNER;
  return (
    <>
      <section className="bg-ink text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-sun"><Store size={14} />fastfood for restaurants</span>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.02] sm:text-6xl">Put your kitchen in <span className="text-tangerine">every neighborhood</span> near you.</h1>
            <p className="mt-6 max-w-lg text-lg text-white/65">Get discovered by hungry customers, manage orders in real time and grow sales without running your own delivery fleet.</p>
            <div className="mt-8"><Cta portal={portal} dark label="Open your restaurant" /></div>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-8">{[["+38%", "avg. sales lift"], ["24 min", "avg. delivery"], ["0 $", "setup fee"]].map(([value, label]) => <div key={label}><p className="font-display text-2xl font-extrabold text-sun">{value}</p><p className="text-xs text-white/50">{label}</p></div>)}</div>
          </div>
          <div className="relative"><img src={img("photo-1556910103-1c02745aae4d")} alt="Chef plating a dish in a restaurant kitchen" className="aspect-[4/3] w-full rounded-[32px] bg-white/10 object-cover" /><div className="absolute -bottom-5 -left-3 rounded-2xl bg-white p-4 text-ink shadow-xl sm:-left-8"><p className="text-xs font-bold text-ink/45">New order · #FR-2051</p><p className="font-display text-lg font-bold">3 items · $34.50</p><p className="text-xs font-bold text-leaf">Auto-accepted</p></div></div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-tangerine">Why partners stay</p><h2 className="mt-2 font-display text-4xl font-extrabold">Everything a kitchen needs</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{[[Smartphone, "Live order inbox", "Accept, prepare and hand off orders from one screen."], [ChefHat, "Menu control", "Edit dishes, prices and availability in seconds."], [BarChart3, "Sales insights", "See bestsellers, peak hours and revenue trends."], [Wallet, "Weekly payouts", "Transparent commission, paid every week."]].map(([Icon, title, text]) => <div key={title} className="rounded-3xl bg-mint p-6"><Icon className="text-leaf" size={26} /><h3 className="mt-4 font-display text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-ink/60">{text}</p></div>)}</div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8"><h2 className="mb-8 font-display text-4xl font-extrabold">Go live in three steps</h2><Steps steps={[["Create your account", "Tell us about your restaurant and upload your menu."], ["Get approved", "Our team reviews your listing, usually within 48 hours."], ["Start receiving orders", "Go live and accept your first order the same day."]]} /></section>
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8"><div className="rounded-[32px] bg-tangerine p-10 text-white sm:p-14"><h2 className="font-display text-4xl font-extrabold">Ready to grow your restaurant?</h2><div className="mt-6 flex flex-wrap gap-3"><Link to={portal.register}><Button size="lg" variant="dark">Create partner account</Button></Link></div></div></section>
    </>
  );
}

export function DeliveryHome() {
  const portal = PORTALS.DELIVERY_PARTNER;
  const [hours, setHours] = useState(20);
  const [rate] = useState(18);
  const weekly = hours * rate;
  return (
    <>
      <section className="bg-leaf text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-xs font-bold uppercase tracking-widest text-sun"><Bike size={14} />Deliver with fastfood</span>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.02] sm:text-6xl">Your bike. Your hours. <span className="text-sun">Your income.</span></h1>
            <p className="mt-6 max-w-lg text-lg text-white/75">Earn on your own schedule delivering meals around your city. Keep 100% of your tips and get paid every week.</p>
            <div className="mt-8"><Cta portal={portal} dark label="Start riding" /></div>
          </div>
          <div className="rounded-[32px] bg-white p-8 text-ink shadow-2xl">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-tangerine"><TrendingUp size={15} />Earnings estimator</p>
            <p className="mt-5 font-display text-6xl font-extrabold">${weekly}<span className="text-lg font-bold text-ink/40"> / week</span></p>
            <label className="mt-6 block text-sm font-bold">Hours per week: {hours}h<input type="range" min="5" max="50" value={hours} onChange={(event) => setHours(+event.target.value)} className="mt-3 w-full accent-tangerine" /></label>
            <p className="mt-4 text-xs text-ink/45">Estimate based on an average ${rate}/hour including tips. Actual earnings vary by city and demand.</p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="font-display text-4xl font-extrabold">Why riders love it</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{[[CalendarClock, "Total flexibility", "Go online whenever you like. No minimum hours."], [Wallet, "Weekly payouts", "Earnings land in your account every week."], [Clock3, "Short trips", "Most deliveries are under 3 km."], [Check, "Keep your tips", "100% of customer tips go to you."]].map(([Icon, title, text]) => <div key={title} className="rounded-3xl border border-ink/8 bg-white p-6"><Icon className="text-tangerine" size={26} /><h3 className="mt-4 font-display text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-ink/55">{text}</p></div>)}</div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8"><h2 className="mb-8 font-display text-4xl font-extrabold">Start in minutes</h2><Steps steps={[["Sign up", "Create your delivery partner account with your details."], ["Get verified", "Upload your ID and vehicle info for a quick check."], ["Go online", "Accept orders nearby and start earning right away."]]} /></section>
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8"><div className="flex flex-wrap items-center justify-between gap-6 rounded-[32px] bg-ink p-10 text-white sm:p-14"><h2 className="font-display text-4xl font-extrabold">Ready to ride?</h2><Link to={portal.register}><Button size="lg">Create rider account <ArrowRight size={18} /></Button></Link></div></section>
    </>
  );
}
