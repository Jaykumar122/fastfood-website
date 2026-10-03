import { useQuery } from "@tanstack/react-query";
import { Clock3, Search, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRestaurants } from "../api/services";

export default function SearchBox({ className = "" }) {
  const [value, setValue] = useState("");
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  const navigate = useNavigate();
  useEffect(() => { const t = setTimeout(() => setTerm(value.trim()), 200); return () => clearTimeout(t); }, [value]);
  useEffect(() => {
    const close = (event) => { if (!box.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const { data } = useQuery({ queryKey: ["suggest", term], queryFn: () => getRestaurants({ search: term }), enabled: term.length > 1 });
  const results = (data?.content || []).slice(0, 5);
  const go = (path) => { setOpen(false); setValue(""); navigate(path); };
  return (
    <div ref={box} className={`relative ${className}`}>
      <form onSubmit={(event) => { event.preventDefault(); if (value.trim()) go(`/restaurants?search=${encodeURIComponent(value.trim())}`); }}>
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
        <input value={value} onFocus={() => setOpen(true)} onChange={(event) => { setValue(event.target.value); setOpen(true); }} placeholder="Search dishes or restaurants" aria-label="Search" className="w-full rounded-full border border-ink/10 bg-white py-2.5 pl-11 pr-4 text-sm placeholder:text-ink/35 focus:border-tangerine" />
      </form>
      {open && term.length > 1 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-ink/8 bg-white p-2 shadow-2xl">
          {results.length === 0 ? <p className="p-4 text-sm text-ink/50">No matches for “{term}”.</p> : results.map((restaurant) => (
            <button key={restaurant.id} onClick={() => go(`/restaurants/${restaurant.id}`)} className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-cream">
              <img src={restaurant.image} alt="" className="h-11 w-11 rounded-lg bg-ink/5 object-cover" />
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{restaurant.name}</span><span className="flex items-center gap-2 text-xs text-ink/50">{restaurant.cuisine}<Star size={11} className="fill-sun text-sun" />{restaurant.rating}<Clock3 size={11} />{restaurant.eta}</span></span>
            </button>
          ))}
          <button onClick={() => go(`/restaurants?search=${encodeURIComponent(term)}`)} className="w-full rounded-xl p-3 text-left text-sm font-bold text-tangerine hover:bg-cream">See all results for “{term}”</button>
        </div>
      )}
    </div>
  );
}
