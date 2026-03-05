import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAllOrders } from "@/hooks/useAdminQueries";
import { Users } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";

function truncatePrincipal(p: { toString(): string }) {
  const s = p.toString();
  return s.length > 20 ? `${s.slice(0, 16)}…${s.slice(-6)}` : s;
}

export default function AdminCustomers() {
  const { data: orders, isLoading } = useAllOrders();

  const customers = useMemo(() => {
    if (!orders) return [];
    const map = new Map<
      string,
      { principal: string; orderCount: number; totalSpent: number }
    >();

    for (const order of orders) {
      const key = order.userId.toString();
      const existing = map.get(key);
      if (existing) {
        existing.orderCount += 1;
        existing.totalSpent += order.totalAmount;
      } else {
        map.set(key, {
          principal: key,
          orderCount: 1,
          totalSpent: order.totalAmount,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">
            Customers
          </h1>
          <p className="text-muted-foreground text-sm">
            Customers derived from order history
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 text-primary rounded-lg px-4 py-2">
          <Users className="h-4 w-4" />
          <span className="font-semibold text-sm">
            {customers.length} total
          </span>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="space-y-2" data-ocid="admin.customers.loading_state">
          {[1, 2, 3, 4, 5].map((n) => (
            <Skeleton key={n} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div
          className="text-center py-20 text-muted-foreground"
          data-ocid="admin.customers.empty_state"
        >
          <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-lg font-medium">No customers yet</p>
          <p className="text-sm mt-1">
            Customers will appear after orders are placed
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  #
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Principal ID
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Total Orders
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Total Spent
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Avg. Order Value
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer, i) => (
                <TableRow
                  key={customer.principal}
                  className="hover:bg-muted/20 transition-colors"
                  data-ocid={`admin.customers.row.${i + 1}`}
                >
                  <TableCell className="text-sm text-muted-foreground font-medium">
                    {i + 1}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-foreground">
                    {truncatePrincipal({ toString: () => customer.principal })}
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-foreground">
                    {customer.orderCount}
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-primary">
                    PKR {customer.totalSpent.toLocaleString("en-PK")}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    PKR{" "}
                    {Math.round(
                      customer.totalSpent / customer.orderCount,
                    ).toLocaleString("en-PK")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
