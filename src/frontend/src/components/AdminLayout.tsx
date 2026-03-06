import { useIsCallerAdmin } from "@/hooks/useAdminQueries";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useQueryClient } from "@tanstack/react-query";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  BarChart3,
  Calendar,
  Check,
  ChevronRight,
  Copy,
  Leaf,
  Loader2,
  Package,
  RefreshCw,
  Settings2,
  ShieldAlert,
  ShoppingCart,
  Tag,
  Truck,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

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
  {
    to: "/admin/menu",
    label: "Menu Management",
    icon: UtensilsCrossed,
    exact: false,
  },
  {
    to: "/admin/settings",
    label: "Settings",
    icon: Settings2,
    exact: false,
  },
];

export default function AdminLayout() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const {
    data: isAdmin,
    isLoading: isCheckingAdmin,
    isFetching: isRefetchingAdmin,
  } = useIsCallerAdmin();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  // Also check localStorage cache for immediate display
  const currentPrincipal = identity?.getPrincipal().toString() ?? "";
  const cachedAdmins: string[] = (() => {
    try {
      const stored = localStorage.getItem("sk_admin_principals");
      return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
      return [];
    }
  })();
  const isCachedAdmin =
    isAuthenticated && cachedAdmins.includes(currentPrincipal);

  // Show loader while initializing identity OR while performing first-time
  // admin check AND we have no cached result to fall back to.
  const isStillChecking =
    isInitializing ||
    (isCheckingAdmin && !isCachedAdmin) ||
    // Also keep showing the loader while the actor is being set up
    // (isAdmin is undefined means the query hasn't resolved yet)
    (isAuthenticated &&
      isAdmin === undefined &&
      isRefetchingAdmin &&
      !isCachedAdmin);

  const isActive = (link: { to: string; exact: boolean }) =>
    link.exact
      ? location.pathname === link.to
      : location.pathname.startsWith(link.to);

  if (isStillChecking) {
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

  // Deny access only when we have a definitive answer (not just undefined)
  // OR when cached result is also absent.
  if (!isAuthenticated || (isAdmin === false && !isCachedAdmin)) {
    // Not logged in at all — show simple "please log in" screen
    if (!isAuthenticated) {
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
              Please log in with an admin account to access this area.
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

    // Logged in but NOT admin — show helpful setup instructions
    const myPrincipal = identity?.getPrincipal().toString() ?? "";

    function handleCopyPrincipal() {
      void navigator.clipboard.writeText(myPrincipal).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }

    function handleRefreshAdminCheck() {
      void queryClient.invalidateQueries({
        queryKey: ["isCallerAdmin", myPrincipal],
      });
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
          data-ocid="admin.error_state"
        >
          <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
            <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
              <ShieldAlert className="h-7 w-7 text-amber-500" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2 text-center">
              Admin Setup Required
            </h2>
            <p className="text-muted-foreground text-sm mb-6 text-center">
              You are logged in but have not been granted admin access yet.
              Share your principal with an existing admin or follow the setup
              steps below.
            </p>

            {/* Principal display */}
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Your Principal ID
              </p>
              <div className="flex items-center gap-2 bg-muted/30 border border-border rounded-lg px-3 py-2">
                <code className="text-xs font-mono text-foreground flex-1 break-all">
                  {myPrincipal}
                </code>
                <button
                  type="button"
                  onClick={handleCopyPrincipal}
                  className="flex-shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors"
                  data-ocid="admin.setup.copy_button"
                  title="Copy principal"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {/* Setup steps */}
            <div className="bg-muted/20 rounded-xl border border-border p-4 mb-5 space-y-3 text-sm">
              <p className="font-semibold text-foreground text-xs uppercase tracking-wide">
                How to get admin access
              </p>
              <div className="space-y-2 text-muted-foreground text-xs">
                <p>
                  <span className="font-semibold text-foreground">
                    Option 1 — First-time setup:
                  </span>{" "}
                  If no admin has been set up yet, log out and log back in as
                  the very first user. The app will automatically assign you the
                  admin role.
                </p>
                <p>
                  <span className="font-semibold text-foreground">
                    Option 2 — Existing admin:
                  </span>{" "}
                  Ask an existing admin to call{" "}
                  <code className="bg-muted px-1 py-0.5 rounded font-mono">
                    assignCallerUserRole
                  </code>{" "}
                  with your principal above and the{" "}
                  <code className="bg-muted px-1 py-0.5 rounded font-mono">
                    #admin
                  </code>{" "}
                  role.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleRefreshAdminCheck}
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors"
                data-ocid="admin.setup.refresh_button"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh — Check Admin Status
              </button>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground font-medium text-sm py-2 transition-colors"
                data-ocid="admin.home.link"
              >
                <Leaf className="h-4 w-4 text-primary" />
                Back to Salad Khatora
              </Link>
            </div>
          </div>
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
