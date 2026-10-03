import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const steps = [
  { label: "Fresh layers", text: "Crisp lettuce, tomato, red onion and melted cheddar over a grilled chicken patty." },
  { label: "Garlic mayo", text: "A creamy herbed spread goes on before the stack comes together." },
  { label: "Stacked", text: "Everything is pressed between seeded multigrain toast." },
  { label: "Melted", text: "Cheddar melts over the juicy grilled chicken." },
  { label: "Grill-pressed", text: "Toasted until golden with a crisp, charred finish." },
  { label: "Ready to serve", text: "Served fresh on a board, ready for delivery." },
];

export default function SandwichShowcase() {
  const [active, setActive] = useState(5);
  const step = steps[active];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" aria-labelledby="sandwich-title">
      <div className="grid items-center gap-8 overflow-hidden rounded-[32px] bg-cream p-5 ring-1 ring-ink/10 sm:p-8 lg:grid-cols-2 lg:gap-12 lg:p-10">
        <div className="order-2 lg:order-1">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-tangerine">Chef's pick</p>
          <h2 id="sandwich-title" className="mt-2 font-display text-3xl font-extrabold leading-tight sm:text-4xl">Grilled chicken sandwich, layer by layer</h2>
          <p className="mt-4 min-h-[84px] leading-7 text-ink/70" aria-live="polite"><strong className="text-ink">{step.label}.</strong> {step.text}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {steps.map((s, i) => (
              <button key={s.label} type="button" onClick={() => setActive(i)} aria-pressed={active === i} className={`min-h-11 rounded-full px-4 text-sm font-bold transition ${active === i ? "bg-leaf text-white" : "bg-white text-ink/70 ring-1 ring-ink/10 hover:text-ink"}`}>{i + 1}. {s.label}</button>
            ))}
          </div>
          <Link to="/restaurants?search=chicken" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-tangerine px-5 py-3 font-bold text-white transition hover:opacity-90">Order chicken sandwiches <ArrowRight size={18} /></Link>
        </div>
        <div className="order-1 lg:order-2">
          <div className="aspect-square overflow-hidden rounded-3xl bg-ink/5 shadow-xl">
            <img key={active} src={`/images/sandwich/${active + 1}.jpg`} alt={`Grilled chicken sandwich: ${step.label}`} className="h-full w-full object-cover" />
          </div>
          <div className="mt-3 grid grid-cols-6 gap-2">
            {steps.map((s, i) => (
              <button key={s.label} type="button" onClick={() => setActive(i)} aria-label={`Show step ${i + 1}: ${s.label}`} className={`aspect-square overflow-hidden rounded-xl ring-2 transition ${active === i ? "ring-tangerine" : "ring-transparent opacity-70 hover:opacity-100"}`}><img src={`/images/sandwich/${i + 1}.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" /></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
