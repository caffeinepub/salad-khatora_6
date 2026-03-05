import { SubscriptionPlan, SubscriptionStatus } from "@/backend";
import type { Subscription } from "@/backend";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  useAdminCancelSubscription,
  useAdminCreateSubscription,
  useAdminDeleteSubscription,
  useAdminExtendSubscription,
  useAdminPauseSubscription,
  useAdminUpdateSubscription,
  useAllSubscriptions,
  useAllUsers,
} from "@/hooks/useAdminQueries";
import {
  CalendarCheck,
  CalendarPlus,
  Loader2,
  PauseCircle,
  Pencil,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(ts: bigint) {
  return new Date(Number(ts / 1_000_000n)).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function dateStringToNs(dateStr: string): bigint {
  return BigInt(new Date(dateStr).getTime()) * 1_000_000n;
}

function nsToDateString(ns: bigint): string {
  const date = new Date(Number(ns / 1_000_000n));
  return date.toISOString().split("T")[0];
}

function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

function addDaysString(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

// ─── Form state ───────────────────────────────────────────────────────────────

interface SubFormState {
  userId: string;
  plan: SubscriptionPlan;
  totalSalads: string;
  remainingSalads: string;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
}

function defaultForm(): SubFormState {
  return {
    userId: "",
    plan: SubscriptionPlan.weekly,
    totalSalads: "6",
    remainingSalads: "6",
    startDate: todayString(),
    endDate: addDaysString(7),
    status: SubscriptionStatus.active,
  };
}

interface ExtendFormState {
  newEndDate: string;
  additionalSalads: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminSubscriptions() {
  const { data: subscriptions, isLoading } = useAllSubscriptions();
  const { data: users } = useAllUsers();

  const createSub = useAdminCreateSubscription();
  const updateSub = useAdminUpdateSubscription();
  const pauseSub = useAdminPauseSubscription();
  const extendSub = useAdminExtendSubscription();
  const cancelSub = useAdminCancelSubscription();
  const deleteSub = useAdminDeleteSubscription();

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [form, setForm] = useState<SubFormState>(defaultForm());

  const [extendOpen, setExtendOpen] = useState(false);
  const [extendTarget, setExtendTarget] = useState<Subscription | null>(null);
  const [extendForm, setExtendForm] = useState<ExtendFormState>({
    newEndDate: "",
    additionalSalads: "0",
  });

  const [deleteTarget, setDeleteTarget] = useState<bigint | null>(null);
  const [cancelTarget, setCancelTarget] = useState<bigint | null>(null);

  // Customer name map
  const customerNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const u of users ?? []) {
      map[u.principal.toString()] = u.profile.name;
    }
    return map;
  }, [users]);

  function getCustomerName(userId: { toString(): string }) {
    const name = customerNameMap[userId.toString()];
    if (name) return name;
    const s = userId.toString();
    return s.length > 16 ? `${s.slice(0, 12)}…${s.slice(-4)}` : s;
  }

  const activeCount =
    subscriptions?.filter((s) => s.status === SubscriptionStatus.active)
      .length ?? 0;

  // ─── Form helpers ────────────────────────────────────────────────────────

  function openCreate() {
    setEditingId(null);
    setForm(defaultForm());
    setFormOpen(true);
  }

  function openEdit(sub: Subscription) {
    setEditingId(sub.id);
    setForm({
      userId: sub.userId.toString(),
      plan: sub.plan,
      totalSalads: sub.totalSalads.toString(),
      remainingSalads: sub.remainingSalads.toString(),
      startDate: nsToDateString(sub.startDate),
      endDate: nsToDateString(sub.endDate),
      status: sub.status,
    });
    setFormOpen(true);
  }

  function handlePlanChange(plan: SubscriptionPlan) {
    const salads = plan === SubscriptionPlan.weekly ? "6" : "24";
    const days = plan === SubscriptionPlan.weekly ? 7 : 30;
    setForm((prev) => ({
      ...prev,
      plan,
      totalSalads: salads,
      remainingSalads: salads,
      endDate: editingId === null ? addDaysString(days) : prev.endDate,
    }));
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.userId) {
      toast.error("Please select a customer.");
      return;
    }

    try {
      const { Principal } = await import("@icp-sdk/core/principal");
      const userId = Principal.fromText(form.userId);

      if (editingId === null) {
        await createSub.mutateAsync({
          userId,
          plan: form.plan,
          totalSalads: BigInt(form.totalSalads),
          remainingSalads: BigInt(form.remainingSalads),
          startDate: dateStringToNs(form.startDate),
          endDate: dateStringToNs(form.endDate),
          status: form.status,
        });
        toast.success("Subscription created successfully.");
      } else {
        await updateSub.mutateAsync({
          id: editingId,
          plan: form.plan,
          totalSalads: BigInt(form.totalSalads),
          remainingSalads: BigInt(form.remainingSalads),
          startDate: dateStringToNs(form.startDate),
          endDate: dateStringToNs(form.endDate),
          status: form.status,
        });
        toast.success("Subscription updated successfully.");
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  // ─── Pause ───────────────────────────────────────────────────────────────

  async function handlePause(id: bigint) {
    try {
      await pauseSub.mutateAsync(id);
      toast.success("Subscription paused.");
    } catch {
      toast.error("Failed to pause subscription.");
    }
  }

  // ─── Extend ──────────────────────────────────────────────────────────────

  function openExtend(sub: Subscription) {
    setExtendTarget(sub);
    setExtendForm({
      newEndDate: nsToDateString(sub.endDate),
      additionalSalads: "0",
    });
    setExtendOpen(true);
  }

  async function handleExtendSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!extendTarget) return;
    try {
      await extendSub.mutateAsync({
        id: extendTarget.id,
        newEndDate: dateStringToNs(extendForm.newEndDate),
        additionalSalads: BigInt(extendForm.additionalSalads),
      });
      toast.success("Subscription extended.");
      setExtendOpen(false);
    } catch {
      toast.error("Failed to extend subscription.");
    }
  }

  // ─── Cancel ──────────────────────────────────────────────────────────────

  async function handleCancelConfirm() {
    if (cancelTarget === null) return;
    try {
      await cancelSub.mutateAsync(cancelTarget);
      toast.success("Subscription cancelled.");
    } catch {
      toast.error("Failed to cancel subscription.");
    } finally {
      setCancelTarget(null);
    }
  }

  // ─── Delete ──────────────────────────────────────────────────────────────

  async function handleDeleteConfirm() {
    if (deleteTarget === null) return;
    try {
      await deleteSub.mutateAsync(deleteTarget);
      toast.success("Subscription deleted.");
    } catch {
      toast.error("Failed to delete subscription.");
    } finally {
      setDeleteTarget(null);
    }
  }

  const isFormBusy = createSub.isPending || updateSub.isPending;

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">
            Subscriptions
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage customer subscription plans
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-lg px-4 py-2 border border-emerald-200">
            <CalendarCheck className="h-4 w-4" />
            <span className="font-semibold text-sm">{activeCount} active</span>
          </div>
          <Button
            onClick={openCreate}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            data-ocid="admin.subscriptions.create_button"
          >
            <Plus className="h-4 w-4" />
            Create Subscription
          </Button>
        </div>
      </motion.div>

      {/* Table / States */}
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
          className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-xl"
          data-ocid="admin.subscriptions.empty_state"
        >
          <CalendarCheck className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-lg font-medium">No subscriptions yet</p>
          <p className="text-sm mt-1 mb-4">
            Create a subscription for a customer to get started.
          </p>
          <Button
            onClick={openCreate}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Subscription
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card rounded-xl border border-border overflow-hidden"
          data-ocid="admin.subscriptions.table"
        >
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground w-10">
                    #
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Customer
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Plan Type
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Salads
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Start Date
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    End Date
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub, i) => {
                  const isActive = sub.status === SubscriptionStatus.active;
                  const isPaused = sub.status === SubscriptionStatus.paused;
                  const isCancelled =
                    sub.status === SubscriptionStatus.cancelled;

                  return (
                    <TableRow
                      key={sub.id.toString()}
                      className="hover:bg-muted/20 transition-colors"
                      data-ocid={`admin.subscriptions.row.${i + 1}`}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {i + 1}
                      </TableCell>
                      <TableCell className="font-medium text-sm text-foreground">
                        {getCustomerName(sub.userId)}
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {sub.plan === SubscriptionPlan.weekly
                          ? "Weekly (6 salads)"
                          : "Monthly (24 salads)"}
                      </TableCell>
                      <TableCell className="text-sm font-mono text-foreground">
                        {sub.remainingSalads.toString()} /{" "}
                        {sub.totalSalads.toString()}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(sub.startDate)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(sub.endDate)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`border text-xs font-semibold px-2 py-0.5 ${
                            isActive
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : isPaused
                                ? "bg-amber-50 border-amber-200 text-amber-700"
                                : "bg-red-50 border-red-200 text-red-700"
                          }`}
                        >
                          {isActive
                            ? "Active"
                            : isPaused
                              ? "Paused"
                              : "Cancelled"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => openEdit(sub)}
                            title="Edit subscription"
                            data-ocid={`admin.subscriptions.edit_button.${i + 1}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>

                          {/* Pause (only if active) */}
                          {isActive && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              onClick={() => handlePause(sub.id)}
                              disabled={pauseSub.isPending}
                              title="Pause subscription"
                              data-ocid={`admin.subscriptions.pause_button.${i + 1}`}
                            >
                              {pauseSub.isPending ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <PauseCircle className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          )}

                          {/* Extend */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => openExtend(sub)}
                            title="Extend subscription"
                            data-ocid={`admin.subscriptions.extend_button.${i + 1}`}
                          >
                            <CalendarPlus className="h-3.5 w-3.5" />
                          </Button>

                          {/* Cancel (only if not already cancelled) */}
                          {!isCancelled && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              onClick={() => setCancelTarget(sub.id)}
                              title="Cancel subscription"
                              data-ocid={`admin.subscriptions.cancel_button.${i + 1}`}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          )}

                          {/* Delete */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(sub.id)}
                            title="Delete subscription"
                            data-ocid={`admin.subscriptions.delete_button.${i + 1}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </motion.div>
      )}

      {/* ─── Create / Edit Dialog ────────────────────────────────────────────── */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent
          className="sm:max-w-lg"
          data-ocid="admin.subscriptions.form.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingId === null ? "Create Subscription" : "Edit Subscription"}
            </DialogTitle>
            <DialogDescription>
              {editingId === null
                ? "Set up a new subscription for a customer."
                : "Update the subscription details below."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 mt-2">
            {/* Customer */}
            <div className="space-y-1.5">
              <Label htmlFor="sub-customer">Customer</Label>
              <Select
                value={form.userId}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, userId: v }))
                }
                disabled={editingId !== null}
              >
                <SelectTrigger
                  id="sub-customer"
                  data-ocid="admin.subscriptions.form.customer_select"
                >
                  <SelectValue placeholder="Select a customer…" />
                </SelectTrigger>
                <SelectContent>
                  {(users ?? []).map((u) => (
                    <SelectItem
                      key={u.principal.toString()}
                      value={u.principal.toString()}
                    >
                      {u.profile.name} —{" "}
                      <span className="font-mono text-xs text-muted-foreground">
                        {u.principal.toString().slice(0, 10)}…
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Plan Type */}
            <div className="space-y-1.5">
              <Label htmlFor="sub-plan">Plan Type</Label>
              <Select
                value={form.plan}
                onValueChange={(v) => handlePlanChange(v as SubscriptionPlan)}
              >
                <SelectTrigger
                  id="sub-plan"
                  data-ocid="admin.subscriptions.form.plan_select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SubscriptionPlan.weekly}>
                    Weekly (6 salads)
                  </SelectItem>
                  <SelectItem value={SubscriptionPlan.monthly}>
                    Monthly (24 salads)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Total & Remaining Salads */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sub-total-salads">Total Salads</Label>
                <Input
                  id="sub-total-salads"
                  type="number"
                  min={1}
                  value={form.totalSalads}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      totalSalads: e.target.value,
                    }))
                  }
                  data-ocid="admin.subscriptions.form.total_salads_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sub-remaining-salads">Remaining Salads</Label>
                <Input
                  id="sub-remaining-salads"
                  type="number"
                  min={0}
                  value={form.remainingSalads}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      remainingSalads: e.target.value,
                    }))
                  }
                  data-ocid="admin.subscriptions.form.remaining_salads_input"
                />
              </div>
            </div>

            {/* Start & End Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sub-start-date">Start Date</Label>
                <Input
                  id="sub-start-date"
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  data-ocid="admin.subscriptions.form.start_date_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sub-end-date">End Date</Label>
                <Input
                  id="sub-end-date"
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  data-ocid="admin.subscriptions.form.end_date_input"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label htmlFor="sub-status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((prev) => ({
                    ...prev,
                    status: v as SubscriptionStatus,
                  }))
                }
              >
                <SelectTrigger
                  id="sub-status"
                  data-ocid="admin.subscriptions.form.status_select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SubscriptionStatus.active}>
                    Active
                  </SelectItem>
                  <SelectItem value={SubscriptionStatus.paused}>
                    Paused
                  </SelectItem>
                  <SelectItem value={SubscriptionStatus.cancelled}>
                    Cancelled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                data-ocid="admin.subscriptions.form.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isFormBusy}
                className="gap-2"
                data-ocid="admin.subscriptions.form.submit_button"
              >
                {isFormBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId === null ? "Create" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Extend Dialog ───────────────────────────────────────────────────── */}
      <Dialog open={extendOpen} onOpenChange={setExtendOpen}>
        <DialogContent
          className="sm:max-w-sm"
          data-ocid="admin.subscriptions.extend.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Extend Subscription
            </DialogTitle>
            <DialogDescription>
              {extendTarget && (
                <>
                  Current end date:{" "}
                  <strong>{formatDate(extendTarget.endDate)}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleExtendSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="extend-end-date">New End Date</Label>
              <Input
                id="extend-end-date"
                type="date"
                value={extendForm.newEndDate}
                onChange={(e) =>
                  setExtendForm((prev) => ({
                    ...prev,
                    newEndDate: e.target.value,
                  }))
                }
                data-ocid="admin.subscriptions.extend.end_date_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="extend-additional-salads">
                Additional Salads
              </Label>
              <Input
                id="extend-additional-salads"
                type="number"
                min={0}
                value={extendForm.additionalSalads}
                onChange={(e) =>
                  setExtendForm((prev) => ({
                    ...prev,
                    additionalSalads: e.target.value,
                  }))
                }
                data-ocid="admin.subscriptions.extend.additional_salads_input"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setExtendOpen(false)}
                data-ocid="admin.subscriptions.extend.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={extendSub.isPending}
                className="gap-2"
                data-ocid="admin.subscriptions.extend.submit_button"
              >
                {extendSub.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Extend
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Cancel Confirmation ─────────────────────────────────────────────── */}
      <AlertDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => !open && setCancelTarget(null)}
      >
        <AlertDialogContent data-ocid="admin.subscriptions.cancel_confirm.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the subscription as cancelled. The customer will
              lose access to their remaining salads.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.subscriptions.cancel_confirm.cancel_button">
              Keep Subscription
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-orange-600 hover:bg-orange-700 text-white"
              data-ocid="admin.subscriptions.cancel_confirm.confirm_button"
            >
              {cancelSub.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Delete Confirmation ─────────────────────────────────────────────── */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="admin.subscriptions.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The subscription record will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.subscriptions.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              data-ocid="admin.subscriptions.delete.confirm_button"
            >
              {deleteSub.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
