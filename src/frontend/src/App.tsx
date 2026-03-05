import AdminLayout from "@/components/AdminLayout";
import Navigation from "@/components/Navigation";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/context/CartContext";
import KioskPage from "@/pages/KioskPage";
import LandingPage from "@/pages/LandingPage";
import MenuPage from "@/pages/MenuPage";
import OrdersPage from "@/pages/OrdersPage";
import ProfilePage from "@/pages/ProfilePage";
import SubscriptionsPage from "@/pages/SubscriptionsPage";
import AdminCoupons from "@/pages/admin/AdminCoupons";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminDelivery from "@/pages/admin/AdminDelivery";
import AdminInventory from "@/pages/admin/AdminInventory";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminSubscriptions from "@/pages/admin/AdminSubscriptions";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

// Root layout (customer-facing)
const rootRoute = createRootRoute({
  component: () => (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <Navigation />
        <Outlet />
        <WhatsAppButton />
        <Toaster richColors position="top-right" />
      </div>
    </CartProvider>
  ),
});

// Customer Routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const menuRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/menu",
  component: MenuPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders",
  component: OrdersPage,
});

const subscriptionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/subscriptions",
  component: SubscriptionsPage,
});

const kioskRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/kiosk",
  component: KioskPage,
});

// Admin layout route (nested under root)
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminLayout,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/",
  component: AdminDashboard,
});

const adminOrdersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/orders",
  component: AdminOrders,
});

const adminCustomersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/customers",
  component: AdminCustomers,
});

const adminSubscriptionsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/subscriptions",
  component: AdminSubscriptions,
});

const adminInventoryRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/inventory",
  component: AdminInventory,
});

const adminCouponsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/coupons",
  component: AdminCoupons,
});

const adminDeliveryRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/delivery",
  component: AdminDelivery,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  menuRoute,
  profileRoute,
  ordersRoute,
  subscriptionsRoute,
  kioskRoute,
  adminLayoutRoute.addChildren([
    adminDashboardRoute,
    adminOrdersRoute,
    adminCustomersRoute,
    adminSubscriptionsRoute,
    adminInventoryRoute,
    adminCouponsRoute,
    adminDeliveryRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
