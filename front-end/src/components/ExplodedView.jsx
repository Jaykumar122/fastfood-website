import { Download, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { explosionAt, exportBurgerVideo, loadBurgerImage, paintBurger } from "./burgerVideo";

const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1000&h=1200&q=80`;

const foods = {
  chicken: {
    label: "Crispy Chicken Burger",
    blurb: "Golden buttermilk-fried chicken, creamy house sauce and a glossy brioche bun. Watch it come apart.",
    src: "/images/crispy-chicken-burger.jpg",
    SW: 800, SH: 600, x: 140, w: 560,
    layers: [
      { name: "Glossy brioche bun", note: "Baked fresh every morning", y: 105, h: 160 },
      { name: "Crispy chicken and cream", note: "Buttermilk fried, melted cream cheese", y: 265, h: 113 },
      { name: "Lettuce and house sauce", note: "Crunchy lettuce, creamy sauce", y: 378, h: 47 },
      { name: "Bottom bun", note: "Soft and toasted", y: 425, h: 87 },
    ],
  },
  black: {
    label: "Black Bean Burger",
    blurb: "A smoky black-bean patty with avocado, crisp lettuce and mango salsa. Watch it come apart.",
    src: img("1525059696034-4967a8e1dca2"),
    SW: 500, SH: 600, x: 90, w: 320,
    layers: [
      { name: "Toasted bun", note: "Soft, golden, lightly floured", y: 205, h: 100 },
      { name: "Avocado and tomato", note: "Ripe avocado, fresh tomato, red onion", y: 305, h: 45 },
      { name: "Black bean patty", note: "Black beans, sweet potato, spices", y: 350, h: 45 },
      { name: "Crisp lettuce and salsa", note: "Romaine with mango salsa", y: 395, h: 50 },
      { name: "Bottom bun", note: "Holds it all together", y: 445, h: 50 },
    ],
  },
  crispy: {
    label: "Crispy Veg Burger",
    blurb: "A golden breadcrumb veg patty with red onion, avocado and a smoky tomato relish.",
    src: img("1520073201527-6b044ba2ca9f"),
    SW: 500, SH: 600, x: 90, w: 340,
    layers: [
      { name: "Toasted bun", note: "Glazed and charred", y: 240, h: 98 },
      { name: "Red onion and avocado", note: "Sliced thin, with crisp greens", y: 338, h: 42 },
      { name: "Crispy veg patty", note: "Golden breadcrumb crust", y: 380, h: 48 },
      { name: "Tomato relish and base bun", note: "Slow-cooked smoky tomato", y: 428, h: 62 },
    ],
  },
};

export default function ExplodedView() {
  const [food, setFood] = useState("chicken");
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [active, setActive] = useState(null);
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [exportProgress, setExportProgress] = useState(null);
  const canvasRef = useRef(null);
  const exportController = useRef(null);
  const clock = useRef(0);
  const f = foods[food];

  useEffect(() => {
    let cancelled = false;
    setImage(null);
    setError('');
    loadBurgerImage(f.src).then((loaded) => { if (!cancelled) setImage(loaded); }).catch((failure) => { if (!cancelled) setError(failure.message); });
    return () => { cancelled = true; };
  }, [f.src]);

  useEffect(() => {
    if (image && canvasRef.current) paintBurger(canvasRef.current, image, f, t, active);
  }, [image, f, t, active]);

  useEffect(() => () => exportController.current?.abort(), []);

  async function downloadVideo() {
    setError('');
    setExportProgress(0);
    exportController.current = new AbortController();
    try {
      await exportBurgerVideo(f, setExportProgress, exportController.current.signal);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setExportProgress(null);
    }
  }

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let id = 0;
    const tick = (now) => {
      clock.current += (now - last) / 1000;
      last = now;
      setT(explosionAt(clock.current));
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [playing]);

  return (
    <section className="bg-[#101a14] text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8 lg:py-20">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-sun">Exploded view</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-tight sm:text-5xl">See what goes into every bite</h2>
          <p className="mt-4 max-w-md text-white/65">{f.blurb}</p>
          <div className="mt-6 flex flex-wrap gap-2">{Object.entries(foods).map(([k, v]) => <button key={k} aria-pressed={food === k} disabled={exportProgress !== null} onClick={() => { setFood(k); setActive(null); clock.current = 0; setT(0); }} className={`rounded-full px-5 py-2.5 text-sm font-bold transition disabled:opacity-50 ${food === k ? "bg-tangerine text-white" : "bg-white/10 hover:bg-white/20"}`}>{v.label}</button>)}</div>
          <ol className="mt-7 space-y-1.5">
            {f.layers.map((l, i) => (
              <li key={l.name}><button onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(i)} onBlur={() => setActive(null)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${active === i ? "bg-white/12" : ""}`}><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-tangerine text-xs font-bold">{i + 1}</span><span className="text-sm font-bold">{l.name}</span><span className="hidden truncate text-xs text-white/45 sm:block">{l.note}</span></button></li>
            ))}
          </ol>
          <div className="mt-6 flex items-center gap-4">
            <button onClick={() => { clock.current = t < 1 ? (0.15 + t * 0.28) * 9 : 0.43 * 9; setPlaying(!playing); }} aria-label={playing ? "Pause animation" : "Play animation"} className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink">{playing ? <Pause size={18} /> : <Play size={18} />}</button>
            <input type="range" min="0" max="100" value={Math.round(t * 100)} onChange={(e) => { setPlaying(false); setT(e.target.value / 100); }} className="flex-1 accent-tangerine" aria-label="Explode amount" />
          </div>
          <button onClick={downloadVideo} disabled={exportProgress !== null || !image} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-bold transition hover:bg-white/10 disabled:opacity-50"><Download size={16} />{exportProgress === null ? 'Download video loop' : `Rendering video · ${exportProgress}%`}</button>
          <p className="mt-3 text-xs text-white/65" role="status">{exportProgress !== null ? 'Keep this tab visible while your 9-second video renders.' : '1080 × 1350 · 9-second loop · browser-rendered video'}</p>
          {error && <p role="alert" className="mt-3 text-sm text-sun">{error}</p>}
        </div>
        <div className="relative mx-auto aspect-[4/5] w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#101a14]">
          <canvas ref={canvasRef} width={1080} height={1350} role="img" aria-label={`Animated exploded view of ${f.label}; use the slider to separate its ingredients`} className="h-full w-full" />
          {!image && <p className="absolute inset-0 grid place-items-center text-sm text-white/65">{error ? 'Photo unavailable' : 'Preparing the good stuff…'}</p>}
        </div>
      </div>
    </section>
  );
}
