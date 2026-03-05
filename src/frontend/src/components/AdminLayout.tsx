import { useIsCallerAdmin } from "@/hooks/useAdminQueries";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  BarChart3,
  Calendar,
  ChevronRight,
  Leaf,
  Loader2,
  Package,
  ShieldAlert,
  ShoppingCart,
  Tag,
  Truck,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

const ADMIN_LINKS = [
  { to: "/admin", label: "Dashboard", icon: BarChart3, exact: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart, exact: false },
  { to: "/admin/customers", label: "Customers", icon: Users, exact: false },
  {
    to: "/admin/subscriptions",
    label: "Subscriptions",
    icon: Calendar,
    exact: false,
  },
  {
    to: "/admin/inventory",
    label: "Inventory",
    icon: Package,
    exact: false,
  },
  { to: "/admin/coupons", label: "Coupons", icon: Tag, exact: false },
  { to: "/admin/delivery", label: "Delivery", icon: Truck, exact: false },
];

export default function AdminLayout() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: isAdmin, isLoading: isCheckingAdmin } = useIsCallerAdmin();
  const location = useLocation();

  const isActive = (link: { to: string; exact: boolean }) =>
    link.exact
      ? location.pathname === link.to
      : location.pathname.startsWith(link.to);

  if (isInitializing || isCheckingAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div
          className="flex flex-col items-center gap-3"
          data-ocid="admin.loading_state"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading admin panel…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full text-center"
          data-ocid="admin.error_state"
        >
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {!isAuthenticated
              ? "Please log in with an admin account to access this area."
              : "You do not have permission to access the admin panel."}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium text-sm"
            data-ocid="admin.home.link"
          >
            <Leaf className="h-4 w-4" />
            Back to Salad Khatora
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 flex-col border-r border-border bg-white flex-shrink-0">
        <div className="flex-1 py-4 px-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-3">
            Admin Panel
          </p>
          <nav className="space-y-0.5">
            {ADMIN_LINKS.map((link) => {
              const Icon = link.icon;
              const active = isActive(link);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  data-ocid="admin.nav.link"
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                    active
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 flex-shrink-0 ${active ? "text-white" : "group-hover:text-foreground"}`}
                  />
                  <span className="flex-1 truncate">{link.label}</span>
                  {active && (
                    <ChevronRight className="h-3.5 w-3.5 text-white/70" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="px-4 py-4 border-t border-border">
          <p className="text-[10px] text-muted-foreground">
            Logged in as admin
          </p>
          <p className="text-xs font-medium text-foreground truncate mt-0.5">
            {identity?.getPrincipal().toString().slice(0, 20)}…
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-border px-1 py-1 flex items-center justify-around">
        {ADMIN_LINKS.slice(0, 6).map((link) => {
          const Icon = link.icon;
          const active = isActive(link);
          return (
            <Link
              key={link.to}
              to={link.to}
              data-ocid="admin.nav.link"
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all text-[10px] font-medium ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`}
              />
              <span className="truncate">{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
