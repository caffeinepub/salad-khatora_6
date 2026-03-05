import { SubscriptionPlan, SubscriptionStatus } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAllSubscriptions } from "@/hooks/useAdminQueries";
import { CalendarCheck } from "lucide-react";
import { motion } from "motion/react";

function formatDate(ts: bigint) {
  return new Date(Number(ts / 1_000_000n)).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function truncatePrincipal(p: { toString(): string }) {
  const s = p.toString();
  return s.length > 20 ? `${s.slice(0, 16)}…${s.slice(-6)}` : s;
}

const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  [SubscriptionPlan.weekly]: "Weekly (6 salads)",
  [SubscriptionPlan.monthly]: "Monthly (24 salads)",
};

export default function AdminSubscriptions() {
  const { data: subscriptions, isLoading } = useAllSubscriptions();

  const activeCount =
    subscriptions?.filter((s) => s.status === SubscriptionStatus.active)
      .length ?? 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">
            Subscriptions
          </h1>
          <p className="text-muted-foreground text-sm">
            All customer subscription plans
          </p>
        </div>
        <div className="flex items-center gap-2 bg-purple-50 text-purple-700 rounded-lg px-4 py-2">
          <CalendarCheck className="h-4 w-4" />
          <span className="font-semibold text-sm">{activeCount} active</span>
        </div>
      </motion.div>

      {isLoading ? (
        <div
          className="space-y-2"
          data-ocid="admin.subscriptions.loading_state"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <Skeleton key={n} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : !subscriptions || subscriptions.length === 0 ? (
        <div
          className="text-center py-20 text-muted-foreground"
          data-ocid="admin.subscriptions.empty_state"
        >
          <CalendarCheck className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-lg font-medium">No subscriptions yet</p>
          <p className="text-sm mt-1">
            Subscriptions will appear once customers subscribe
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  ID
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Customer
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Plan
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Start Date
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub, i) => {
                const isActive = sub.status === SubscriptionStatus.active;
                return (
                  <TableRow
                    key={sub.id.toString()}
                    className="hover:bg-muted/20 transition-colors"
                    data-ocid={`admin.subscriptions.row.${i + 1}`}
                  >
                    <TableCell className="font-mono text-xs font-semibold text-foreground">
                      #{sub.id.toString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {truncatePrincipal(sub.userId)}
                    </TableCell>
                    <TableCell className="text-sm text-foreground font-medium">
                      {PLAN_LABELS[sub.plan] ?? sub.plan}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(sub.startDate)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`border text-xs font-semibold px-2 py-0.5 ${
                          isActive
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-red-50 border-red-200 text-red-700"
                        }`}
                      >
                        {isActive ? "Active" : "Cancelled"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
