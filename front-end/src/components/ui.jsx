import React from "react";
import { LoaderCircle, X } from "lucide-react";

export function Button({ children, variant = "primary", size = "md", loading, className = "", ...props }) {
  const variants = {
    primary: "bg-tangerine text-white hover:bg-[#eb5723] shadow-[0_6px_0_#c83d15] active:translate-y-1 active:shadow-none",
    dark: "bg-ink text-white hover:bg-leaf",
    secondary: "bg-white text-ink border border-ink/10 hover:border-ink/30",
    ghost: "bg-transparent text-ink hover:bg-ink/5",
  };
  const sizes = { sm: "px-4 py-2 text-sm", md: "px-5 py-3", lg: "px-7 py-4 text-base" };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <LoaderCircle size={18} className="animate-spin" />}
      {children}
    </button>
  );
}

export const Input = React.forwardRef(function Input({ label, error, icon: Icon, className = "", ...props }, ref) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-2 block text-sm font-bold">{label}</span>}
      <span className="relative block">
        {Icon && <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />}
        <input ref={ref} className={`w-full rounded-xl border bg-white px-4 py-3.5 text-sm transition placeholder:text-ink/35 focus:border-tangerine ${Icon ? "pl-11" : ""} ${error ? "border-red-500" : "border-ink/12"}`} {...props} />
      </span>
      {error && <span className="mt-1.5 block text-xs font-semibold text-red-600">{error}</span>}
    </label>
  );
});

export function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-3xl bg-cream p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-full bg-ink/5 p-2 hover:bg-ink/10" aria-label="Close"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Badge({ children, tone = "green" }) {
  const tones = { green: "bg-mint text-leaf", orange: "bg-orange-100 text-orange-700", dark: "bg-ink text-white", gray: "bg-ink/7 text-ink/60" };
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}
