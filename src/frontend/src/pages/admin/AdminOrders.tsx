import { OrderStatus } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAllDeliveryRiders,
  useAllOrderDeliveries,
  useAllOrders,
  useAssignRiderToOrder,
  useUpdateOrderStatus,
} from "@/hooks/useAdminQueries";
import { Eye, Loader2, MapPin, RefreshCw, Truck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: OrderStatus.pending, label: "Pending" },
  { value: OrderStatus.confirmed, label: "Confirmed" },
  { value: OrderStatus.preparing, label: "Preparing" },
  { value: OrderStatus.outForDelivery, label: "Out for Delivery" },
  { value: OrderStatus.delivered, label: "Delivered" },
  { value: OrderStatus.cancelled, label: "Cancelled" },
];

const STATUS_BADGE: Record<OrderStatus, string> = {
  [OrderStatus.pending]: "bg-amber-50 border-amber-200 text-amber-700",
  [OrderStatus.confirmed]: "bg-blue-50 border-blue-200 text-blue-700",
  [OrderStatus.preparing]: "bg-orange-50 border-orange-200 text-orange-700",
  [OrderStatus.outForDelivery]:
    "bg-violet-50 border-violet-200 text-violet-700",
  [OrderStatus.delivered]: "bg-emerald-50 border-emerald-200 text-emerald-700",
  [OrderStatus.cancelled]: "bg-red-50 border-red-200 text-red-700",
};

function formatDate(ts: bigint) {
  return new Date(Number(ts / 1_000_000n)).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function truncatePrincipal(p: { toString(): string }) {
  const s = p.toString();
  return s.length > 12 ? `${s.slice(0, 8)}…${s.slice(-4)}` : s;
}

interface ParsedOrderNotes {
  deliveryAddress?: {
    fullName?: string;
    mobile?: string;
    house?: string;
    street?: string;
    landmark?: string;
    city?: string;
    pincode?: string;
  };
  paymentMethod?: string;
  couponCode?: string | null;
  notes?: string | null;
}

function parseOrderNotes(notes?: string): ParsedOrderNotes | null {
  if (!notes) return null;
  try {
    return JSON.parse(notes) as ParsedOrderNotes;
  } catch {
    return null;
  }
}

export default function AdminOrders() {
  const { data: orders, isLoading, refetch, isFetching } = useAllOrders();
  const { data: deliveries } = useAllOrderDeliveries();
  const { data: riders } = useAllDeliveryRiders();
  const updateStatus = useUpdateOrderStatus();
  const assignRider = useAssignRiderToOrder();

  const [assignModal, setAssignModal] = useState<{
    open: boolean;
    orderId: bigint | null;
  }>({ open: false, orderId: null });
  const [selectedRider, setSelectedRider] = useState<string>("");

  // View details modal state
  const [viewModal, setViewModal] = useState<{
    open: boolean;
    orderId: bigint | null;
  }>({ open: false, orderId: null });

  const viewOrder = viewModal.orderId
    ? orders?.find((o) => o.id === viewModal.orderId)
    : null;

  function getAssignedRiderName(orderId: bigint): string | null {
    const delivery = deliveries?.find((d) => d.orderId === orderId);
    if (!delivery) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyDelivery = delivery as any;
    const partner = anyDelivery.deliveryPartner;
    if (partner) return partner;
    // Fall back to rider lookup for old schema
    if (anyDelivery.riderId) {
      const rider = riders?.find((r) => r.id === anyDelivery.riderId);
      return rider?.name ?? null;
    }
    return null;
  }

  function handleStatusChange(orderId: bigint, value: string) {
    const status = value as OrderStatus;
    updateStatus.mutate(
      { orderId, status },
      {
        onSuccess: () => toast.success("Order status updated"),
        onError: () => toast.error("Failed to update status"),
      },
    );
  }

  function openAssignModal(orderId: bigint) {
    setAssignModal({ open: true, orderId });
    setSelectedRider("");
  }

  function openViewModal(orderId: bigint) {
    setViewModal({ open: true, orderId });
  }

  function handleAssignRider() {
    if (!assignModal.orderId || !selectedRider) return;
    assignRider.mutate(
      { orderId: assignModal.orderId, riderId: BigInt(selectedRider) },
      {
        onSuccess: () => {
          toast.success("Rider assigned successfully");
          setAssignModal({ open: false, orderId: null });
        },
        onError: () => toast.error("Failed to assign rider"),
      },
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">
            Orders
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage and update all customer orders
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="space-y-2" data-ocid="admin.orders.loading_state">
          {[1, 2, 3, 4, 5].map((n) => (
            <Skeleton key={n} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div
          className="text-center py-20 text-muted-foreground"
          data-ocid="admin.orders.empty_state"
        >
          <p className="text-lg font-medium">No orders yet</p>
          <p className="text-sm mt-1">Orders will appear here when placed</p>
        </div>
      ) : (
        <div
          className="bg-white rounded-xl border border-border overflow-hidden"
          data-ocid="admin.orders.table"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Order ID
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Customer
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Items
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Amount
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Date
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Rider
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order, i) => {
                const statusClass =
                  STATUS_BADGE[order.status] ??
                  STATUS_BADGE[OrderStatus.pending];
                const itemCount = order.items.reduce(
                  (s, item) => s + Number(item.quantity),
                  0,
                );
                const assignedRider = getAssignedRiderName(order.id);
                const statusLabel =
                  STATUS_OPTIONS.find((s) => s.value === order.status)?.label ??
                  order.status;

                return (
                  <TableRow
                    key={order.id.toString()}
                    className="hover:bg-muted/20 transition-colors"
                    data-ocid={`admin.orders.row.${i + 1}`}
                  >
                    <TableCell className="font-mono text-xs font-semibold text-foreground">
                      #{order.id.toString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {truncatePrincipal(order.userId)}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {itemCount} item{itemCount !== 1 ? "s" : ""}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-foreground">
                      ₹{order.totalAmount.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {assignedRider ? (
                        <span className="font-medium text-foreground">
                          {assignedRider}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${statusClass} border text-xs font-semibold px-2 py-0.5`}
                      >
                        {statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          value={order.status}
                          onValueChange={(v) => handleStatusChange(order.id, v)}
                        >
                          <SelectTrigger
                            className="h-8 w-36 text-xs border-border"
                            data-ocid="admin.orders.status.select"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem
                                key={opt.value}
                                value={opt.value}
                                className="text-xs"
                              >
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 text-xs border-border"
                          onClick={() => openAssignModal(order.id)}
                          data-ocid="admin.orders.assign.button"
                        >
                          <Truck className="h-3 w-3" />
                          Rider
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 text-xs border-border"
                          onClick={() => openViewModal(order.id)}
                          data-ocid="admin.orders.view.button"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Assign Rider Modal */}
      <Dialog
        open={assignModal.open}
        onOpenChange={(open) => setAssignModal({ open, orderId: null })}
      >
        <DialogContent className="max-w-sm" data-ocid="admin.orders.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              Assign Delivery Rider
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {!riders || riders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No riders available. Add riders in Delivery management.
              </p>
            ) : (
              <div className="space-y-2">
                {riders.map((rider) => (
                  <label
                    key={rider.id.toString()}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedRider === rider.id.toString()
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="rider"
                      value={rider.id.toString()}
                      checked={selectedRider === rider.id.toString()}
                      onChange={(e) => setSelectedRider(e.target.value)}
                      className="accent-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {rider.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {rider.phone}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium ${rider.available ? "text-emerald-600" : "text-muted-foreground"}`}
                    >
                      {rider.available ? "Available" : "Busy"}
                    </span>
                  </label>
                ))}
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setAssignModal({ open: false, orderId: null })}
                data-ocid="admin.form.cancel_button"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={!selectedRider || assignRider.isPending}
                onClick={handleAssignRider}
                data-ocid="admin.form.submit_button"
              >
                {assignRider.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Assign Rider"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Order Details Modal */}
      <Dialog
        open={viewModal.open}
        onOpenChange={(open) => setViewModal({ open, orderId: null })}
      >
        <DialogContent
          className="max-w-lg"
          data-ocid="admin.orders.view.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              Order #{viewOrder?.id.toString() ?? "—"}
            </DialogTitle>
          </DialogHeader>
          {viewOrder ? (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 pr-2">
                {/* Status + Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/30 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">
                      Status
                    </p>
                    <Badge
                      className={`${
                        STATUS_BADGE[viewOrder.status] ??
                        STATUS_BADGE[OrderStatus.pending]
                      } border text-xs font-semibold`}
                    >
                      {STATUS_OPTIONS.find((s) => s.value === viewOrder.status)
                        ?.label ?? viewOrder.status}
                    </Badge>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">
                      Date
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {formatDate(viewOrder.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Customer */}
                <div className="bg-muted/30 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">
                    Customer Principal
                  </p>
                  <p className="font-mono text-xs text-foreground break-all">
                    {viewOrder.userId.toString()}
                  </p>
                </div>

                {/* Items */}
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">
                    Items
                  </p>
                  <div className="space-y-2">
                    {viewOrder.items.map((item) => (
                      <div
                        key={item.menuItemId.toString()}
                        className="flex justify-between items-center py-1.5 px-3 bg-muted/20 rounded-lg text-sm"
                      >
                        <span className="text-foreground font-medium">
                          Item #{item.menuItemId.toString()}
                        </span>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <span>×{item.quantity.toString()}</span>
                          <span className="font-semibold text-foreground">
                            ₹
                            {(
                              item.unitPrice * Number(item.quantity)
                            ).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="font-display text-sm font-bold text-foreground">
                    Total Amount
                  </span>
                  <span className="font-display text-lg font-bold text-primary">
                    ₹{viewOrder.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Delivery address + payment from notes */}
                {(() => {
                  const parsed = parseOrderNotes(viewOrder.notes);
                  if (!parsed) return null;
                  return (
                    <>
                      {parsed.paymentMethod && (
                        <div className="bg-muted/30 rounded-xl p-3">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">
                            Payment Method
                          </p>
                          <p className="text-sm font-medium text-foreground capitalize">
                            {parsed.paymentMethod === "cod"
                              ? "Cash on Delivery"
                              : parsed.paymentMethod === "upi"
                                ? "UPI Payment"
                                : parsed.paymentMethod}
                          </p>
                        </div>
                      )}

                      {parsed.deliveryAddress && (
                        <div className="bg-muted/30 rounded-xl p-3">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Delivery Address
                          </p>
                          <div className="text-sm text-foreground space-y-0.5">
                            {parsed.deliveryAddress.fullName && (
                              <p className="font-medium">
                                {parsed.deliveryAddress.fullName}
                              </p>
                            )}
                            {parsed.deliveryAddress.mobile && (
                              <p className="text-muted-foreground">
                                📞 {parsed.deliveryAddress.mobile}
                              </p>
                            )}
                            <p className="text-muted-foreground">
                              {[
                                parsed.deliveryAddress.house,
                                parsed.deliveryAddress.street,
                                parsed.deliveryAddress.landmark,
                                parsed.deliveryAddress.city,
                                parsed.deliveryAddress.pincode,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          </div>
                        </div>
                      )}

                      {parsed.couponCode && (
                        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">
                            Coupon Applied
                          </p>
                          <p className="text-sm font-mono font-semibold text-emerald-700">
                            {parsed.couponCode}
                          </p>
                        </div>
                      )}

                      {parsed.notes && (
                        <div className="bg-muted/30 rounded-xl p-3">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">
                            Special Instructions
                          </p>
                          <p className="text-sm text-foreground">
                            {parsed.notes}
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}

                {/* Raw notes fallback */}
                {viewOrder.notes && !parseOrderNotes(viewOrder.notes) && (
                  <div className="bg-muted/30 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">
                      Notes
                    </p>
                    <p className="text-sm text-foreground">{viewOrder.notes}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              Order not found.
            </p>
          )}
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => setViewModal({ open: false, orderId: null })}
              data-ocid="admin.orders.view.close_button"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
