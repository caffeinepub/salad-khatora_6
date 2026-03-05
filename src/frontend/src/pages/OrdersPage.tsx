import { OrderStatus } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useMyOrders } from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  ChefHat,
  Clock,
  Leaf,
  Loader2,
  LogIn,
  Package,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";

// Status progression order (excluding cancelled)
const STATUS_STEPS: OrderStatus[] = [
  OrderStatus.pending,
  OrderStatus.confirmed,
  OrderStatus.preparing,
  OrderStatus.outForDelivery,
  OrderStatus.delivered,
];

const STATUS_META: Record<
  OrderStatus,
  { label: string; Icon: React.ElementType }
> = {
  [OrderStatus.pending]: { label: "Pending", Icon: Clock },
  [OrderStatus.confirmed]: { label: "Confirmed", Icon: CheckCircle2 },
  [OrderStatus.preparing]: { label: "Preparing", Icon: ChefHat },
  [OrderStatus.outForDelivery]: { label: "Out for Delivery", Icon: Truck },
  [OrderStatus.delivered]: { label: "Delivered", Icon: Package },
  [OrderStatus.cancelled]: { label: "Cancelled", Icon: XCircle },
};

function StatusStepper({
  status,
  index,
}: {
  status: OrderStatus;
  index: number;
}) {
  if (status === OrderStatus.cancelled) {
    return (
      <div
        className="flex items-center gap-2 py-3"
        data-ocid={`orders.status_tracker.${index + 1}`}
      >
        <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-full px-3 py-1.5">
          <XCircle className="h-3.5 w-3.5 text-red-600" />
          <span className="text-xs font-semibold text-red-700">Cancelled</span>
        </div>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(status);

  return (
    <div className="py-3" data-ocid={`orders.status_tracker.${index + 1}`}>
      <div className="flex items-center gap-0">
        {STATUS_STEPS.map((step, stepIdx) => {
          const StepIcon = STATUS_META[step].Icon;
          const isDone = stepIdx < currentStepIndex;
          const isCurrent = stepIdx === currentStepIndex;
          const _isUpcoming = stepIdx > currentStepIndex;
          const isLast = stepIdx === STATUS_STEPS.length - 1;

          return (
            <div key={step} className="flex items-center flex-1 min-w-0">
              {/* Step node */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isDone
                      ? "bg-green-200 text-green-700"
                      : isCurrent
                        ? "bg-primary text-white shadow-md shadow-primary/30"
                        : "bg-muted text-muted-foreground/50"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <StepIcon
                      className={`h-3.5 w-3.5 ${isCurrent ? "text-white" : ""}`}
                    />
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1 font-medium whitespace-nowrap transition-colors duration-300 ${
                    isDone
                      ? "text-green-700"
                      : isCurrent
                        ? "text-primary font-semibold"
                        : "text-muted-foreground/50"
                  }`}
                >
                  {STATUS_META[step].label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-1 mb-4 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isDone ? "bg-green-300 w-full" : "bg-muted w-full"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const STATUS_BADGE: Record<OrderStatus, { label: string; className: string }> =
  {
    [OrderStatus.pending]: {
      label: "Pending",
      className: "bg-amber-50 border-amber-200 text-amber-700",
    },
    [OrderStatus.confirmed]: {
      label: "Confirmed",
      className: "bg-blue-50 border-blue-200 text-blue-700",
    },
    [OrderStatus.preparing]: {
      label: "Preparing",
      className: "bg-orange-50 border-orange-200 text-orange-700",
    },
    [OrderStatus.outForDelivery]: {
      label: "Out for Delivery",
      className: "bg-violet-50 border-violet-200 text-violet-700",
    },
    [OrderStatus.delivered]: {
      label: "Delivered",
      className: "bg-emerald-50 border-emerald-200 text-emerald-700",
    },
    [OrderStatus.cancelled]: {
      label: "Cancelled",
      className: "bg-red-50 border-red-200 text-red-700",
    },
  };

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp / BigInt(1_000_000));
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

function OrderSkeleton() {
  return (
    <div className="space-y-4">
      {["sk1", "sk2", "sk3"].map((sk) => (
        <div
          key={sk}
          className="rounded-2xl border border-border p-6 space-y-4"
        >
          <div className="flex justify-between items-start">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-48" />
          {/* Stepper skeleton */}
          <div className="flex items-center gap-1 py-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="flex items-center flex-1">
                <Skeleton className="h-7 w-7 rounded-full flex-shrink-0" />
                {n < 5 && <Skeleton className="flex-1 h-0.5 mx-1" />}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: orders, isLoading, refetch } = useMyOrders();

  // Real-time polling every 5 seconds
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      void refetchRef.current();
    }, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isAuthenticated && !isInitializing) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card className="text-center border-border shadow-md">
            <CardContent className="pt-10 pb-8 px-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                Sign in to view orders
              </h2>
              <p className="text-muted-foreground mb-8 text-sm">
                Your order history is tied to your account. Please log in to
                view past orders.
              </p>
              <Button
                onClick={login}
                disabled={isLoggingIn}
                className="w-full bg-primary hover:bg-primary/90 gap-2"
                data-ocid="nav.login_button"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Login to continue
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="outline" className="border-primary/30 text-primary">
              Order history
            </Badge>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-green-500"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
              />
              Live tracking
            </div>
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">
            My Orders
          </h1>
          <p className="text-muted-foreground">
            Track your past and current orders — updates every 5 seconds
          </p>
        </motion.div>

        {isLoading ? (
          <div data-ocid="orders.loading_state">
            <OrderSkeleton />
          </div>
        ) : !orders || orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-6"
            data-ocid="orders.empty_state"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-primary/40" />
            </div>
            <div className="text-center">
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                No orders yet
              </h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                You haven't placed any orders yet. Browse our fresh menu and
                place your first order!
              </p>
            </div>
            <Button asChild className="bg-primary hover:bg-primary/90 gap-2">
              <Link to="/menu">
                <Leaf className="h-4 w-4" />
                Browse Menu
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4" data-ocid="orders.list">
            {orders.map((order, i) => {
              const statusMeta =
                STATUS_BADGE[order.status] ?? STATUS_BADGE[OrderStatus.pending];
              const StatusIcon = STATUS_META[order.status]?.Icon ?? Clock;
              const itemCount = order.items.reduce(
                (sum, item) => sum + Number(item.quantity),
                0,
              );

              return (
                <motion.article
                  key={order.id.toString()}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-2xl border border-border p-6 card-hover"
                  data-ocid={`orders.item.${i + 1}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-display font-bold text-foreground text-lg">
                        Order #{order.id.toString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <Badge
                      className={`${statusMeta.className} border flex items-center gap-1.5 font-semibold text-xs px-3 py-1 flex-shrink-0`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {statusMeta.label}
                    </Badge>
                  </div>

                  {/* Visual Status Stepper */}
                  <div className="bg-muted/40 rounded-xl px-4 mb-4">
                    <StatusStepper status={order.status} index={i} />
                  </div>

                  {/* Items summary */}
                  <div className="bg-muted/50 rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Items ({itemCount} total)
                    </p>
                    <div className="space-y-1.5">
                      {order.items.map((item, j) => (
                        <div
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          key={`${(item as any).saladId?.toString() ?? (item as any).menuItemId?.toString() ?? j}-${j}`}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-foreground">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {item.quantity.toString()}x item #
                            {(
                              (item as any).saladId ?? (item as any).menuItemId
                            )?.toString()}
                          </span>
                          <span className="text-muted-foreground">
                            PKR{" "}
                            {(
                              item.unitPrice * Number(item.quantity)
                            ).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                    {order.notes && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-semibold">Note:</span>{" "}
                          {order.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ShoppingBag className="h-4 w-4" />
                      {itemCount} item{itemCount > 1 ? "s" : ""}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-display font-bold text-xl text-primary">
                        PKR {order.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
