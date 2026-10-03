import { Check, ChefHat, CircleCheck, CookingPot, PackageCheck, Scooter } from "lucide-react";

const steps = [
  { value: "CONFIRMED", label: "Confirmed", icon: CircleCheck },
  { value: "PREPARING", label: "Preparing", icon: CookingPot },
  { value: "READY_FOR_PICKUP", label: "Ready", icon: PackageCheck },
  { value: "OUT_FOR_DELIVERY", label: "On the way", icon: Scooter },
  { value: "DELIVERED", label: "Delivered", icon: Check },
];

export default function OrderStatusStepper({ status }) {
  const activeIndex = Math.max(0, steps.findIndex((step) => step.value === status));
  return (
    <div className="grid gap-0 sm:grid-cols-5">
      {steps.map((step, index) => {
        const Icon = step.icon || ChefHat;
        const active = index <= activeIndex;
        return (
          <div key={step.value} className="relative flex gap-4 pb-6 sm:block sm:pb-0 sm:text-center">
            {index < steps.length - 1 && <span className={`absolute left-5 top-10 h-[calc(100%-2.5rem)] w-0.5 sm:left-[calc(50%+20px)] sm:top-5 sm:h-0.5 sm:w-[calc(100%-40px)] ${index < activeIndex ? "bg-leaf" : "bg-ink/10"}`} />}
            <span className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full sm:mx-auto ${active ? "bg-leaf text-white" : "bg-ink/8 text-ink/30"}`}><Icon size={18} /></span>
            <div><p className={`mt-2 text-sm font-bold ${active ? "text-ink" : "text-ink/35"}`}>{step.label}</p>{index === activeIndex && <p className="mt-1 text-xs text-leaf">Current status</p>}</div>
          </div>
        );
      })}
    </div>
  );
}
