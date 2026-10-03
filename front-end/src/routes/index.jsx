import { createBrowserRouter } from "react-router-dom";
import AppShell from "../components/AppShell";
import StaffShell from "../components/StaffShell";
import { DeliveryHome, PartnerShell, RestaurantHome } from "../pages/PartnerHomePages";
import AdminDashboard from "../pages/AdminDashboard";
import RestaurantRegisterPage from "../pages/RestaurantSignup";
import RiderDashboard from "../pages/RiderDashboard";
import RestaurantDashboard from "../pages/RestaurantDashboard";
import DeliveryRegisterPage from "../pages/DeliverySignup";
import { AdminLoginPage, DeliveryLoginPage, LoginPage, RegisterPage, RestaurantLoginPage } from "../pages/AuthPages";
import { CartPage, CheckoutPage, FavoritesPage, OrdersPage, TrackingPage } from "../pages/CustomerPages";
import { HelpPage, OffersPage } from "../pages/CustomerExtras";
import ProfilePage from "../pages/ProfilePage";
import HomePage from "../pages/HomePage";
import AboutPage from "../pages/AboutPage";
import ExplodedView from "../components/ExplodedView";
import NotFoundPage from "../pages/NotFoundPage";
import { RestaurantDetailPage, RestaurantsPage } from "../pages/RestaurantPages";
import RouteErrorBoundary from "../components/RouteErrorBoundary";
import {
  AdminGuestRoute,
  AdminRoute,
  CustomerGuestRoute,
  CustomerRoute,
  DeliveryGuestRoute,
  DeliveryRoute,
  LockedProfileRoute,
  OwnerGuestRoute,
  OwnerRoute,
  ProtectedRoute,
} from "./guards";

export const router = createBrowserRouter([
  // Customer Auth (Sign in & Sign up)
  {
    Component: CustomerGuestRoute,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "/login", Component: LoginPage },
      { path: "/register", Component: RegisterPage },
    ],
  },
  // Restaurant Partner Auth (Sign in & Sign up)
  {
    Component: OwnerGuestRoute,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "/restaurant/login", Component: RestaurantLoginPage },
      { path: "/restaurant/signup", Component: RestaurantRegisterPage },
    ],
  },
  // Delivery Partner Auth (Sign in & Sign up)
  {
    Component: DeliveryGuestRoute,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "/delivery/login", Component: DeliveryLoginPage },
      { path: "/delivery/signup", Component: DeliveryRegisterPage },
    ],
  },
  // Admin Auth (Sign in)
  {
    Component: AdminGuestRoute,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "/admin/login", Component: AdminLoginPage },
    ],
  },
  // Public partner informational pages
  {
    Component: PartnerShell,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "/restaurant", Component: RestaurantHome },
      { path: "/deliver", Component: DeliveryHome },
    ],
  },
  // Restaurant Partner Portal (Dashboard at /owner)
  {
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        Component: OwnerRoute,
        children: [
          {
            Component: StaffShell,
            children: [{ path: "owner", Component: RestaurantDashboard }],
          },
        ],
      },
    ],
  },
  // Delivery Partner Portal (Dashboard at /delivery)
  {
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        Component: DeliveryRoute,
        children: [
          {
            Component: StaffShell,
            children: [{ path: "delivery", Component: RiderDashboard }],
          },
        ],
      },
    ],
  },
  // Admin Portal (Dashboard at /admin)
  {
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        Component: AdminRoute,
        children: [
          {
            Component: StaffShell,
            children: [{ path: "admin", Component: AdminDashboard }],
          },
        ],
      },
    ],
  },
  // Main Storefront & Customer routes
  {
    path: "/",
    Component: AppShell,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, Component: HomePage },
      { path: "explodedview", Component: ExplodedView },
      { path: "restaurants", Component: RestaurantsPage },
      { path: "restaurants/:id", Component: RestaurantDetailPage },
      { path: "cart", Component: CartPage },
      { path: "favorites", Component: FavoritesPage },
      { path: "offers", Component: OffersPage },
      { path: "about", Component: AboutPage },
      { path: "help", Component: HelpPage },
      {
        Component: ProtectedRoute,
        children: [
          {
            Component: CustomerRoute,
            children: [
              { path: "checkout", Component: CheckoutPage },
              { path: "orders", Component: OrdersPage },
              { path: "orders/:id", Component: TrackingPage, errorElement: <RouteErrorBoundary /> },
              {
                Component: LockedProfileRoute,
                children: [{ path: "profile", Component: ProfilePage }],
              },
            ],
          },
        ],
      },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
