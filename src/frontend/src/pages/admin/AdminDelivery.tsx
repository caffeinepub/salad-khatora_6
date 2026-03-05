import type { DeliveryRider } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAddDeliveryRider,
  useAllDeliveryRiders,
  useAllOrderDeliveries,
  useUpdateDeliveryRider,
} from "@/hooks/useAdminQueries";
import { useAllOrders } from "@/hooks/useAdminQueries";
import { Loader2, Pencil, Plus, Truck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

type RiderForm = {
  name: string;
  phone: string;
  available: boolean;
};

const EMPTY_FORM: RiderForm = { name: "", phone: "", available: true };

function formatDate(ts: bigint | undefined) {
  if (ts === undefined) return "—";
  return new Date(Number(ts / 1_000_000n)).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminDelivery() {
  const { data: riders, isLoading: ridersLoading } = useAllDeliveryRiders();
  const { data: deliveries, isLoading: deliveriesLoading } =
    useAllOrderDeliveries();
  const { data: orders } = useAllOrders();
  const addRider = useAddDeliveryRider();
  const updateRider = useUpdateDeliveryRider();

  const [modal, setModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    item: DeliveryRider | null;
  }>({ open: false, mode: "add", item: null });

  const [form, setForm] = useState<RiderForm>(EMPTY_FORM);

  function openAdd() {
    setForm(EMPTY_FORM);
    setModal({ open: true, mode: "add", item: null });
  }

  function openEdit(item: DeliveryRider) {
    setForm({
      name: item.name,
      phone: item.phone,
      available: item.available,
    });
    setModal({ open: true, mode: "edit", item });
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const riderData: DeliveryRider = {
      id:
        modal.mode === "edit" && modal.item
          ? modal.item.id
          : BigInt(Date.now()),
      name: form.name.trim(),
      phone: form.phone.trim(),
      available: form.available,
    };

    if (modal.mode === "add") {
      addRider.mutate(riderData, {
        onSuccess: () => {
          toast.success("Rider added successfully");
          setModal({ open: false, mode: "add", item: null });
        },
        onError: () => toast.error("Failed to add rider"),
      });
    } else {
      updateRider.mutate(riderData, {
        onSuccess: () => {
          toast.success("Rider updated successfully");
          setModal({ open: false, mode: "add", item: null });
        },
        onError: () => toast.error("Failed to update rider"),
      });
    }
  }

  function getRiderName(riderId: bigint | undefined): string {
    if (riderId === undefined) return "—";
    return riders?.find((r) => r.id === riderId)?.name ?? "Unknown";
  }

  function getOrderAmount(orderId: bigint): string {
    const order = orders?.find((o) => o.id === orderId);
    return order ? `PKR ${order.totalAmount.toLocaleString()}` : "—";
  }

  const isPending = addRider.isPending || updateRider.isPending;
  const availableCount = riders?.filter((r) => r.available).length ?? 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
      {/* Riders Section */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-1">
              Delivery Management
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage riders and track delivery assignments
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-lg px-3 py-2 text-xs font-medium">
              <Truck className="h-3.5 w-3.5" />
              {availableCount} available
            </div>
            <Button
              onClick={openAdd}
              className="bg-primary hover:bg-primary/90 gap-2"
              data-ocid="admin.delivery.add_rider.button"
            >
              <Plus className="h-4 w-4" />
              Add Rider
            </Button>
          </div>
        </motion.div>

        {ridersLoading ? (
          <div className="space-y-2" data-ocid="admin.delivery.loading_state">
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : !riders || riders.length === 0 ? (
          <div
            className="text-center py-16 text-muted-foreground bg-white rounded-xl border border-border"
            data-ocid="admin.delivery.empty_state"
          >
            <Truck className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-lg font-medium">No riders yet</p>
            <p className="text-sm mt-1">Add your first delivery rider</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Name
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Phone
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
                {riders.map((rider, i) => (
                  <TableRow
                    key={rider.id.toString()}
                    className="hover:bg-muted/20 transition-colors"
                    data-ocid={`admin.delivery.row.${i + 1}`}
                  >
                    <TableCell className="font-medium text-sm text-foreground">
                      {rider.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {rider.phone}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`border text-xs font-semibold ${
                          rider.available
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-amber-50 border-amber-200 text-amber-700"
                        }`}
                      >
                        {rider.available ? "Available" : "Busy"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => openEdit(rider)}
                        data-ocid="admin.delivery.assign.button"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Deliveries Section */}
      <div>
        <h2 className="font-display text-xl font-bold text-foreground mb-4">
          Order Assignments
        </h2>
        {deliveriesLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : !deliveries || deliveries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-white rounded-xl border border-border">
            <p className="text-sm font-medium">No delivery assignments yet</p>
            <p className="text-xs mt-1">
              Assign riders to orders from the Orders page
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Order ID
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Order Amount
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Assigned Rider
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Assigned At
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map((delivery, i) => (
                  <TableRow
                    key={delivery.orderId.toString()}
                    className="hover:bg-muted/20 transition-colors"
                    data-ocid={`admin.delivery.assignments.row.${i + 1}`}
                  >
                    <TableCell className="font-mono text-xs font-semibold text-foreground">
                      #{delivery.orderId.toString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {getOrderAmount(delivery.orderId)}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-foreground">
                      {getRiderName(delivery.riderId)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(delivery.assignedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add/Edit Rider Modal */}
      <Dialog
        open={modal.open}
        onOpenChange={(open) => setModal({ open, mode: "add", item: null })}
      >
        <DialogContent className="max-w-sm" data-ocid="admin.delivery.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              {modal.mode === "add" ? "Add Rider" : "Edit Rider"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="e.g. Ahmed Ali"
                required
                data-ocid="admin.form.input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleFormChange}
                placeholder="+92 300 1234567"
                required
                data-ocid="admin.form.input"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Available</p>
                <p className="text-xs text-muted-foreground">
                  Toggle rider availability
                </p>
              </div>
              <Switch
                checked={form.available}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, available: checked }))
                }
                data-ocid="admin.form.switch"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() =>
                  setModal({ open: false, mode: "add", item: null })
                }
                data-ocid="admin.form.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={isPending}
                data-ocid="admin.form.submit_button"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : modal.mode === "add" ? (
                  "Add Rider"
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
