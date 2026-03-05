import type { Coupon } from "@/backend";
import { CouponDiscountType } from "@/backend";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useAddCoupon,
  useAllCoupons,
  useDeleteCoupon,
  useUpdateCoupon,
} from "@/hooks/useAdminQueries";
import { Loader2, Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

type CouponForm = {
  code: string;
  discountType: CouponDiscountType;
  discountValue: string;
  expiryDate: string;
  usageLimit: string;
};

const EMPTY_FORM: CouponForm = {
  code: "",
  discountType: CouponDiscountType.fixed,
  discountValue: "",
  expiryDate: "",
  usageLimit: "",
};

function formatDate(ts: bigint) {
  return new Date(Number(ts / 1_000_000n)).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function tsToDateInputValue(ts: bigint): string {
  const d = new Date(Number(ts / 1_000_000n));
  return d.toISOString().split("T")[0];
}

export default function AdminCoupons() {
  const { data: coupons, isLoading } = useAllCoupons();
  const addCoupon = useAddCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [modal, setModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    item: Coupon | null;
  }>({ open: false, mode: "add", item: null });

  const [form, setForm] = useState<CouponForm>(EMPTY_FORM);

  function openAdd() {
    setForm(EMPTY_FORM);
    setModal({ open: true, mode: "add", item: null });
  }

  function openEdit(item: Coupon) {
    setForm({
      code: item.code,
      discountType: item.discountType,
      discountValue: item.discountValue.toString(),
      expiryDate: tsToDateInputValue(item.expiryDate),
      usageLimit: item.usageLimit.toString(),
    });
    setModal({ open: true, mode: "edit", item });
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const expiryTs = BigInt(new Date(form.expiryDate).getTime()) * 1_000_000n;
    const couponData: Coupon = {
      id:
        modal.mode === "edit" && modal.item
          ? modal.item.id
          : BigInt(Date.now()),
      code: form.code.trim().toUpperCase(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      expiryDate: expiryTs,
      usageLimit: BigInt(Math.round(Number(form.usageLimit))),
      usedCount:
        modal.mode === "edit" && modal.item ? modal.item.usedCount : BigInt(0),
      active: true,
    };

    if (modal.mode === "add") {
      addCoupon.mutate(couponData, {
        onSuccess: () => {
          toast.success("Coupon added successfully");
          setModal({ open: false, mode: "add", item: null });
        },
        onError: () => toast.error("Failed to add coupon"),
      });
    } else {
      updateCoupon.mutate(couponData, {
        onSuccess: () => {
          toast.success("Coupon updated successfully");
          setModal({ open: false, mode: "add", item: null });
        },
        onError: () => toast.error("Failed to update coupon"),
      });
    }
  }

  function handleDelete(id: bigint) {
    deleteCoupon.mutate(id, {
      onSuccess: () => toast.success("Coupon deleted"),
      onError: () => toast.error("Failed to delete coupon"),
    });
  }

  const isPending = addCoupon.isPending || updateCoupon.isPending;
  const activeCoupons = coupons?.filter((c) => c.active).length ?? 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">
            Coupons
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage discount codes and promotions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-lg px-3 py-2 text-xs font-medium">
            <Tag className="h-3.5 w-3.5" />
            {activeCoupons} active
          </div>
          <Button
            onClick={openAdd}
            className="bg-primary hover:bg-primary/90 gap-2"
            data-ocid="admin.coupons.add.button"
          >
            <Plus className="h-4 w-4" />
            Add Coupon
          </Button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="space-y-2" data-ocid="admin.coupons.loading_state">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : !coupons || coupons.length === 0 ? (
        <div
          className="text-center py-20 text-muted-foreground"
          data-ocid="admin.coupons.empty_state"
        >
          <Tag className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-lg font-medium">No coupons yet</p>
          <p className="text-sm mt-1">Create your first discount coupon</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Code
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Type
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Value
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Expiry
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Usage
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
              {coupons.map((coupon, i) => {
                const isExpired =
                  coupon.expiryDate < BigInt(Date.now()) * 1_000_000n;
                const isMaxUsed = coupon.usedCount >= coupon.usageLimit;

                return (
                  <TableRow
                    key={coupon.id.toString()}
                    className="hover:bg-muted/20 transition-colors"
                    data-ocid={`admin.coupons.row.${i + 1}`}
                  >
                    <TableCell className="font-mono font-bold text-sm text-foreground">
                      {coupon.code}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`border text-xs font-semibold ${
                          coupon.discountType === CouponDiscountType.fixed
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : "bg-violet-50 border-violet-200 text-violet-700"
                        }`}
                      >
                        {coupon.discountType === CouponDiscountType.fixed
                          ? "Fixed"
                          : "Percentage"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-foreground">
                      {coupon.discountType === CouponDiscountType.fixed
                        ? `₹${coupon.discountValue}`
                        : `${coupon.discountValue}%`}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(coupon.expiryDate)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {coupon.usedCount.toString()} /{" "}
                      {coupon.usageLimit.toString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`border text-xs font-semibold ${
                          coupon.active && !isExpired && !isMaxUsed
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-red-50 border-red-200 text-red-700"
                        }`}
                      >
                        {isExpired
                          ? "Expired"
                          : isMaxUsed
                            ? "Limit Reached"
                            : coupon.active
                              ? "Active"
                              : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => openEdit(coupon)}
                          data-ocid="admin.coupons.edit.button"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDelete(coupon.id)}
                          disabled={deleteCoupon.isPending}
                          data-ocid="admin.coupons.delete.button"
                        >
                          {deleteCoupon.isPending &&
                          deleteCoupon.variables === coupon.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
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

      {/* Add/Edit Modal */}
      <Dialog
        open={modal.open}
        onOpenChange={(open) => setModal({ open, mode: "add", item: null })}
      >
        <DialogContent className="max-w-md" data-ocid="admin.coupons.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              {modal.mode === "add" ? "Add Coupon" : "Edit Coupon"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium">
                Coupon Code
              </Label>
              <Input
                id="code"
                name="code"
                value={form.code}
                onChange={handleFormChange}
                placeholder="e.g. SAVE20"
                required
                data-ocid="admin.form.input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Discount Type</Label>
              <Select
                value={form.discountType}
                onValueChange={(v) =>
                  setForm((prev) => ({
                    ...prev,
                    discountType: v as CouponDiscountType,
                  }))
                }
              >
                <SelectTrigger data-ocid="admin.form.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CouponDiscountType.fixed}>
                    Fixed Amount (₹)
                  </SelectItem>
                  <SelectItem value={CouponDiscountType.percentage}>
                    Percentage (%)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="discountValue" className="text-sm font-medium">
                  {form.discountType === CouponDiscountType.fixed
                    ? "Discount Amount (₹)"
                    : "Discount (%)"}
                </Label>
                <Input
                  id="discountValue"
                  name="discountValue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discountValue}
                  onChange={handleFormChange}
                  placeholder={
                    form.discountType === CouponDiscountType.fixed ? "50" : "10"
                  }
                  required
                  data-ocid="admin.form.input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usageLimit" className="text-sm font-medium">
                  Usage Limit
                </Label>
                <Input
                  id="usageLimit"
                  name="usageLimit"
                  type="number"
                  min="1"
                  value={form.usageLimit}
                  onChange={handleFormChange}
                  placeholder="100"
                  required
                  data-ocid="admin.form.input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate" className="text-sm font-medium">
                Expiry Date
              </Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                type="date"
                value={form.expiryDate}
                onChange={handleFormChange}
                required
                data-ocid="admin.form.input"
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
                  "Add Coupon"
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
