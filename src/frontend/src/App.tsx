import AdminLayout from "@/components/AdminLayout";
import FloatingReviewButton from "@/components/FloatingReviewButton";
import Navigation from "@/components/Navigation";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/context/CartContext";
import CheckoutPage from "@/pages/CheckoutPage";
import KioskPage from "@/pages/KioskPage";
import LandingPage from "@/pages/LandingPage";
import MenuPage from "@/pages/MenuPage";
import OrderConfirmationPage from "@/pages/OrderConfirmationPage";
import OrdersPage from "@/pages/OrdersPage";
import ProfilePage from "@/pages/ProfilePage";
import ReviewsPage from "@/pages/ReviewsPage";
import SubscriptionsPage from "@/pages/SubscriptionsPage";
import AdminBowlSizes from "@/pages/admin/AdminBowlSizes";
import AdminCoupons from "@/pages/admin/AdminCoupons";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminDelivery from "@/pages/admin/AdminDelivery";
import AdminIngredients from "@/pages/admin/AdminIngredients";
import AdminInventory from "@/pages/admin/AdminInventory";
import AdminMenu from "@/pages/admin/AdminMenu";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminReviews from "@/pages/admin/AdminReviews";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminSubscriptionPlans from "@/pages/admin/AdminSubscriptionPlans";
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
        <FloatingReviewButton />
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

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  component: CheckoutPage,
});

const orderConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/order-confirmation",
  component: OrderConfirmationPage,
});

const reviewsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reviews",
  component: ReviewsPage,
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

const adminSubscriptionPlansRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/subscription-plans",
  component: AdminSubscriptionPlans,
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

const adminMenuRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/menu",
  component: AdminMenu,
});

const adminSettingsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/settings",
  component: AdminSettings,
});

const adminReviewsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/reviews",
  component: AdminReviews,
});

const adminIngredientsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/ingredients",
  component: AdminIngredients,
});

const adminBowlSizesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/bowl-sizes",
  component: AdminBowlSizes,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  menuRoute,
  profileRoute,
  ordersRoute,
  subscriptionsRoute,
  kioskRoute,
  checkoutRoute,
  orderConfirmationRoute,
  reviewsRoute,
  adminLayoutRoute.addChildren([
    adminDashboardRoute,
    adminOrdersRoute,
    adminCustomersRoute,
    adminSubscriptionsRoute,
    adminSubscriptionPlansRoute,
    adminInventoryRoute,
    adminCouponsRoute,
    adminDeliveryRoute,
    adminMenuRoute,
    adminReviewsRoute,
    adminSettingsRoute,
    adminIngredientsRoute,
    adminBowlSizesRoute,
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
