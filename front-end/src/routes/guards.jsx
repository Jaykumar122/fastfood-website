import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { loginPathForPath } from "../pages/AuthPages";
import { useAuthStore } from "../store/authStore";

/**
 * Checks whether the JWT token is expired or malformed.
 */
export function isTokenExpired(token) {
  if (!token || typeof token !== "string") return true;
  if (token.startsWith("mock-jwt-")) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

/**
 * Guard that only allows authenticated users with a valid non-expired token.
 */
export function ProtectedRoute() {
  const { token, user, logout } = useAuthStore();
  const location = useLocation();

  const isValid = Boolean(token && user && !isTokenExpired(token));

  useEffect(() => {
    if (!isValid && (token || user)) {
      logout();
    }
  }, [isValid, token, user, logout]);

  if (!isValid) {
    const targetLogin = loginPathForPath(location.pathname);
    return <Navigate to={targetLogin} state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}

/**
 * Guard for portal login/signup pages.
 * If the user is ALREADY authenticated with the matching portal role,
 * they are redirected to that portal's dashboard with replace: true.
 * If they are not authenticated or authenticated with a different role,
 * they are allowed to view the login/signup page.
 */
export function PortalGuestRoute({ portalRole, homePath }) {
  const { token, user, logout } = useAuthStore();
  const isValid = Boolean(token && user && !isTokenExpired(token));

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      logout();
    }
  }, [token, logout]);

  if (isValid && user?.role === portalRole) {
    return <Navigate to={homePath} state={{ allowedNav: true }} replace />;
  }

  return <Outlet />;
}

export function CustomerGuestRoute() {
  return <PortalGuestRoute portalRole="CUSTOMER" homePath="/" />;
}

export function OwnerGuestRoute() {
  return <PortalGuestRoute portalRole="RESTAURANT_OWNER" homePath="/owner" />;
}

export function DeliveryGuestRoute() {
  return <PortalGuestRoute portalRole="DELIVERY_PARTNER" homePath="/delivery" />;
}

export function AdminGuestRoute() {
  return <PortalGuestRoute portalRole="ADMIN" homePath="/admin" />;
}

/**
 * Legacy GuestRoute for generic guest-only handling if needed.
 */
export function GuestRoute() {
  const { token, user, logout } = useAuthStore();
  const isValid = Boolean(token && user && !isTokenExpired(token));

  useEffect(() => {
    if (!isValid && (token || user)) {
      logout();
    }
  }, [isValid, token, user, logout]);

  if (isValid) {
    const home =
      {
        RESTAURANT_OWNER: "/owner",
        DELIVERY_PARTNER: "/delivery",
        ADMIN: "/admin",
        CUSTOMER: "/",
      }[user?.role] || "/";
    return <Navigate to={home} state={{ allowedNav: true }} replace />;
  }

  return <Outlet />;
}

export function RoleRoute({ roles, fallbackLogin }) {
  const { token, user, logout } = useAuthStore();
  const location = useLocation();

  const isValid = Boolean(token && user && !isTokenExpired(token) && roles.includes(user?.role));

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      logout();
    }
  }, [token, logout]);

  // If not authenticated with the required role, redirect to its dedicated portal login
  if (!isValid) {
    const target = fallbackLogin || loginPathForPath(location.pathname);
    return <Navigate to={target} state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}

export function OwnerRoute() {
  return <RoleRoute roles={["RESTAURANT_OWNER"]} fallbackLogin="/restaurant/login" />;
}

export function DeliveryRoute() {
  return <RoleRoute roles={["DELIVERY_PARTNER"]} fallbackLogin="/delivery/login" />;
}

export function AdminRoute() {
  return <RoleRoute roles={["ADMIN"]} fallbackLogin="/admin/login" />;
}

export function CustomerRoute() {
  return <RoleRoute roles={["CUSTOMER"]} fallbackLogin="/login" />;
}

/**
 * Guard for Profile page:
 * 1. Requires an authenticated CUSTOMER user.
 * 2. If unauthenticated, redirects to customer /login.
 * 3. Locks out direct address bar URL typing (redirects to http://localhost:8443).
 * 4. Only allows navigation initiated via in-app links (state.allowedNav).
 */
export function LockedProfileRoute() {
  const { token, user, logout } = useAuthStore();
  const location = useLocation();

  const isValid = Boolean(token && user && !isTokenExpired(token) && user?.role === "CUSTOMER");

  useEffect(() => {
    if (!isValid && (token || user)) {
      logout();
    }
  }, [isValid, token, user, logout]);

  // If not authenticated as customer, redirect to customer login
  if (!isValid) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If directly typed into the browser URL bar (no in-app navigation state), lock and redirect to home
  if (!location.state?.allowedNav) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
