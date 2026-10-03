import { AlertTriangle, Home, Package, RefreshCw } from "lucide-react";
import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { Button } from "./ui";

export default function RouteErrorBoundary() {
  const error = useRouteError();

  let title = "Something went off the boil";
  let message = "An unexpected error occurred while loading this page. Please try refreshing.";
  let statusText = null;

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = "Page not found";
      message = "We couldn't find the page or resource you're looking for.";
    } else if (error.status === 403) {
      title = "Access restricted";
      message = "You don't have permission to access this page.";
    } else if (error.status === 401) {
      title = "Authentication required";
      message = "Please sign in to access this page.";
    } else {
      title = `Error ${error.status}`;
      message = error.statusText || message;
    }
    statusText = `${error.status} ${error.statusText || ""}`.trim();
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="noise flex min-h-[70vh] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg rounded-3xl border border-ink/8 bg-white p-8 text-center shadow-[0_12px_40px_rgba(23,35,29,.08)]">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-orange-100 text-tangerine">
          <AlertTriangle size={28} />
        </div>
        {statusText && (
          <span className="mb-2 inline-block rounded-full bg-ink/5 px-3 py-1 font-mono text-xs font-bold text-ink/60">
            {statusText}
          </span>
        )}
        <h1 className="font-display text-3xl font-extrabold text-ink">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/60">{message}</p>

        {error?.stack && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-xs font-semibold text-ink/40 hover:text-ink">
              View technical error details
            </summary>
            <pre className="mt-2 max-h-40 overflow-auto rounded-xl bg-ink/5 p-3 text-[11px] text-ink/70">
              {error.stack}
            </pre>
          </details>
        )}

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button onClick={() => window.location.reload()} variant="primary">
            <RefreshCw size={16} /> Reload page
          </Button>
          <Link to="/orders">
            <Button variant="secondary">
              <Package size={16} /> My Orders
            </Button>
          </Link>
          <Link to="/">
            <Button variant="ghost">
              <Home size={16} /> Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
