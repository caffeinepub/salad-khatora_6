import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats } from "@/hooks/useAdminQueries";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarCheck,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

function StatSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          className="rounded-xl border border-border bg-white p-5 space-y-3"
        >
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>
      ))}
    </div>
  );
}

const STAT_CONFIG = [
  {
    key: "todayOrders",
    label: "Today's Orders",
    icon: ShoppingCart,
    color: "bg-blue-50 text-blue-600",
    valueColor: "text-blue-700",
    format: (v: bigint | number) => v.toString(),
  },
  {
    key: "totalRevenue",
    label: "Total Revenue",
    icon: TrendingUp,
    color: "bg-emerald-50 text-emerald-600",
    valueColor: "text-emerald-700",
    format: (v: bigint | number) => `₹${Number(v).toLocaleString("en-IN")}`,
  },
  {
    key: "activeSubscriptions",
    label: "Active Subscriptions",
    icon: CalendarCheck,
    color: "bg-purple-50 text-purple-600",
    valueColor: "text-purple-700",
    format: (v: bigint | number) => v.toString(),
  },
  {
    key: "totalCustomers",
    label: "Total Customers",
    icon: Users,
    color: "bg-amber-50 text-amber-600",
    valueColor: "text-amber-700",
    format: (v: bigint | number) => v.toString(),
  },
  {
    key: "lowStockIngredients",
    label: "Low Stock Items",
    icon: AlertTriangle,
    color: "bg-red-50 text-red-600",
    valueColor: "text-red-700",
    format: (v: bigint | number) => v.toString(),
  },
];

export default function AdminDashboard() {
  const { data: stats, isLoading, isError } = useDashboardStats();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl font-bold text-foreground mb-1">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm">
          Overview of your Salad Khatora business
        </p>
      </motion.div>

      {isLoading ? (
        <div data-ocid="admin.dashboard.loading_state">
          <StatSkeleton />
        </div>
      ) : isError ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="admin.dashboard.error_state"
        >
          <p>Failed to load dashboard stats. Please try again.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {STAT_CONFIG.map((cfg, i) => {
            const Icon = cfg.icon;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rawVal = (stats as any)?.[cfg.key] ?? BigInt(0);
            const displayVal = cfg.format(rawVal);

            return (
              <motion.div
                key={cfg.key}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card
                  className="border-border bg-white hover:shadow-md transition-shadow duration-200"
                  data-ocid="admin.dashboard.card"
                >
                  <CardContent className="p-5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 ${cfg.color}`}
                    >
                      <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                    </div>
                    <p
                      className={`font-display text-2xl font-bold ${cfg.valueColor} mb-1`}
                    >
                      {displayVal}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground font-medium">
                        {cfg.label}
                      </p>
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Quick info */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-xl border border-border p-5"
        >
          <h2 className="font-display font-semibold text-foreground text-base mb-4">
            Quick Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs mb-1">
                Revenue per Customer
              </p>
              <p className="font-bold text-foreground">
                ₹
                {stats.totalCustomers > 0
                  ? Math.round(
                      stats.totalRevenue / Number(stats.totalCustomers),
                    ).toLocaleString("en-IN")
                  : "0"}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs mb-1">
                Subscription Rate
              </p>
              <p className="font-bold text-foreground">
                {stats.totalCustomers > 0
                  ? (
                      (Number(stats.activeSubscriptions) /
                        Number(stats.totalCustomers)) *
                      100
                    ).toFixed(1)
                  : "0"}
                %
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs mb-1">
                Today's Activity
              </p>
              <p className="font-bold text-foreground">
                {stats.todayOrders.toString()} orders placed
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
