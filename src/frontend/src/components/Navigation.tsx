import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useIsCallerAdmin } from "@/hooks/useAdminQueries";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Leaf,
  LogIn,
  LogOut,
  Menu,
  ShieldCheck,
  ShoppingCart,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import CartSheet from "./CartSheet";

export default function Navigation() {
  const location = useLocation();
  const { itemCount } = useCart();
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isAuthenticated = !!identity;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { data: isAdmin } = useIsCallerAdmin();

  const navLinks = [
    { to: "/", label: "Home", ocid: "nav.home_link", authOnly: false },
    { to: "/menu", label: "Menu", ocid: "nav.menu_link", authOnly: false },
    {
      to: "/orders",
      label: "My Orders",
      ocid: "nav.orders_link",
      authOnly: true,
    },
    {
      to: "/subscriptions",
      label: "Subscriptions",
      ocid: "nav.subscriptions_link",
      authOnly: true,
    },
  ].filter((link) => !link.authOnly || isAuthenticated);

  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-white/90 nav-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-display font-bold text-xl text-primary hover:opacity-80 transition-opacity"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-lg">
              <Leaf className="h-4 w-4" />
            </span>
            <span>Salad Khatora</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-ocid={link.ocid}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                data-ocid="nav.admin.link"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  isActive("/admin")
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart Button */}
            <Button
              variant="outline"
              size="icon"
              className="relative border-border"
              onClick={() => setCartOpen(true)}
              data-ocid="nav.cart_button"
            >
              <ShoppingCart className="h-5 w-5" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary">
                      {itemCount}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            {/* Login/Logout */}
            {isInitializing ? null : isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                onClick={clear}
                className="hidden md:flex gap-2 border-border"
                data-ocid="nav.logout_button"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={login}
                disabled={isLoggingIn}
                className="hidden md:flex gap-2 bg-primary hover:bg-primary/90"
                data-ocid="nav.login_button"
              >
                <LogIn className="h-4 w-4" />
                {isLoggingIn ? "Signing in..." : "Login"}
              </Button>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-border md:hidden bg-white"
            >
              <nav className="flex flex-col gap-1 p-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    data-ocid={link.ocid}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive(link.to)
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated && isAdmin && (
                  <Link
                    to="/admin"
                    data-ocid="nav.admin.link"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive("/admin")
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Admin Panel
                  </Link>
                )}
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      clear();
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent mt-2"
                    data-ocid="nav.logout_button"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      login();
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-primary text-white mt-2"
                    data-ocid="nav.login_button"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </button>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
