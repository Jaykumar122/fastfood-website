import { AlertTriangle, Inbox } from "lucide-react";
import { Button } from "./ui";

export function PageSkeleton({ cards = 6 }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-ink/8 bg-white">
          <div className="h-44 animate-pulse bg-ink/8" />
          <div className="space-y-3 p-5"><div className="h-5 w-2/3 animate-pulse rounded bg-ink/8" /><div className="h-4 w-full animate-pulse rounded bg-ink/8" /></div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title = "Nothing here yet", message = "New items will appear here.", action }) {
  return (
    <div className="rounded-3xl border border-dashed border-ink/20 bg-white/60 px-6 py-14 text-center">
      <Inbox className="mx-auto mb-4 text-tangerine" size={38} />
      <h3 className="font-display text-xl font-bold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink/55">{message}</p>
      {action}
    </div>
  );
}

export function ErrorState({ onRetry }) {
  return (
    <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center">
      <AlertTriangle className="mx-auto mb-3 text-red-600" />
      <h3 className="font-display text-xl font-bold">Something went off the boil</h3>
      <p className="mt-2 text-sm text-ink/55">We couldn’t load this right now. Please try again.</p>
      {onRetry && <Button className="mt-5" variant="secondary" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
