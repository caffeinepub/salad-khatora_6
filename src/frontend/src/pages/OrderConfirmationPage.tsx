import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { CheckCircle2, Clock, ShoppingBag, Star } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { orderId?: string };
  const orderId = search.orderId ?? "";
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const t = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <main
      className="min-h-screen bg-background flex items-start justify-center py-12 px-4"
      data-ocid="order-confirmation.page"
    >
      {/* Confetti dots */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {(
            [
              "c0",
              "c1",
              "c2",
              "c3",
              "c4",
              "c5",
              "c6",
              "c7",
              "c8",
              "c9",
              "c10",
              "c11",
              "c12",
              "c13",
              "c14",
              "c15",
              "c16",
              "c17",
            ] as const
          ).map((id, i) => (
            <motion.div
              key={id}
              className="absolute w-2.5 h-2.5 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-10px",
                backgroundColor: [
                  "#22c55e",
                  "#16a34a",
                  "#86efac",
                  "#fbbf24",
                  "#f59e0b",
                  "#34d399",
                ][i % 6],
              }}
              initial={{ y: -20, opacity: 1 }}
              animate={{
                y:
                  typeof window !== "undefined" ? window.innerHeight + 40 : 900,
                opacity: 0,
                rotate: Math.random() * 360,
                x: (Math.random() - 0.5) * 200,
              }}
              transition={{
                duration: 2.5 + Math.random() * 1.5,
                delay: Math.random() * 0.8,
                ease: "easeIn",
              }}
            />
          ))}
        </div>
      )}

      <div className="w-full max-w-md">
        {/* Success card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
          data-ocid="order-confirmation.card"
        >
          {/* Green header */}
          <div className="bg-gradient-to-br from-primary to-primary/80 px-6 pt-8 pb-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.15,
              }}
              className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle2 className="h-10 w-10 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display text-2xl font-bold text-white mb-1"
            >
              Order Placed Successfully!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/80 text-sm"
            >
              Your fresh salad is on its way 🥗
            </motion.p>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* Order ID */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-muted/40 rounded-xl p-4 text-center"
              data-ocid="order-confirmation.order-id.card"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">
                Order ID
              </p>
              <p className="font-mono text-2xl font-bold text-foreground">
                #{orderId || "—"}
              </p>
            </motion.div>

            <Separator />

            {/* Estimated delivery */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 p-3.5 bg-amber-50 rounded-xl border border-amber-100"
              data-ocid="order-confirmation.eta.card"
            >
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Clock className="h-4.5 w-4.5 text-amber-600 h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  Estimated Delivery Time
                </p>
                <p className="text-xs text-amber-700 mt-0.5">45 – 60 minutes</p>
              </div>
            </motion.div>

            {/* Tips / next steps */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="space-y-2.5"
            >
              {[
                "You'll receive a confirmation once your order is confirmed by our team.",
                "Track your order status in the Orders tab of your profile.",
                "Our delivery partner will contact you before arrival.",
              ].map((tip) => (
                <div key={tip} className="flex items-start gap-2.5">
                  <Star className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {tip}
                  </p>
                </div>
              ))}
            </motion.div>

            <Separator />

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-2"
            >
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold gap-2"
                onClick={() => void navigate({ to: "/menu" })}
                data-ocid="order-confirmation.continue-shopping.primary_button"
              >
                <ShoppingBag className="h-4 w-4" />
                Continue Shopping
              </Button>
              <Button
                variant="outline"
                className="w-full border-border gap-2"
                onClick={() => void navigate({ to: "/orders" })}
                data-ocid="order-confirmation.view-orders.secondary_button"
              >
                View My Orders
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer branding */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </div>
    </main>
  );
}
