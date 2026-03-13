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
  useAllSubscriptionPlanTemplates,
  useCreateSubscriptionPlanTemplate,
  useDeleteSubscriptionPlanTemplate,
  useToggleSubscriptionPlanTemplateStatus,
  useUpdateSubscriptionPlanTemplate,
} from "@/hooks/useAdminQueries";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Local types (mirror backend.d.ts) ────────────────────────────────────────

export enum DurationType {
  weekly = "weekly",
  monthly = "monthly",
}

export enum DeliveryFrequency {
  daily = "daily",
  weekly = "weekly",
}

export interface SubscriptionPlanTemplate {
  id: bigint;
  name: string;
  durationType: DurationType;
  saladCount: number;
  price: number;
  deliveryFrequency: DeliveryFrequency;
  features: string[];
  badge?: string;
  active: boolean;
}

// ─── Form state ───────────────────────────────────────────────────────────────

interface PlanForm {
  name: string;
  durationType: DurationType;
  saladCount: string;
  price: string;
  deliveryFrequency: DeliveryFrequency;
  badge: string;
  features: string[];
  active: boolean;
}

const emptyForm = (): PlanForm => ({
  name: "",
  durationType: DurationType.weekly,
  saladCount: "",
  price: "",
  deliveryFrequency: DeliveryFrequency.daily,
  badge: "",
  features: [],
  active: true,
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminSubscriptionPlans() {
  const { data: plans, isLoading, isError } = useAllSubscriptionPlanTemplates();
  const createMutation = useCreateSubscriptionPlanTemplate();
  const updateMutation = useUpdateSubscriptionPlanTemplate();
  const deleteMutation = useDeleteSubscriptionPlanTemplate();
  const toggleMutation = useToggleSubscriptionPlanTemplateStatus();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] =
    useState<SubscriptionPlanTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<SubscriptionPlanTemplate | null>(null);
  const [form, setForm] = useState<PlanForm>(emptyForm());
  const [featureInput, setFeatureInput] = useState("");

  function openCreate() {
    setEditingPlan(null);
    setForm(emptyForm());
    setFeatureInput("");
    setDialogOpen(true);
  }

  function openEdit(plan: SubscriptionPlanTemplate) {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      durationType: plan.durationType,
      saladCount: String(Number(plan.saladCount)),
      price: String(plan.price),
      deliveryFrequency: plan.deliveryFrequency,
      badge: plan.badge ?? "",
      features: [...plan.features],
      active: plan.active,
    });
    setFeatureInput("");
    setDialogOpen(true);
  }

  function addFeature() {
    const trimmed = featureInput.trim();
    if (!trimmed) return;
    setForm((prev) => ({ ...prev, features: [...prev.features, trimmed] }));
    setFeatureInput("");
  }

  function removeFeature(idx: number) {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx),
    }));
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Plan name is required");
      return;
    }
    const saladCount = Number.parseInt(form.saladCount, 10);
    if (Number.isNaN(saladCount) || saladCount < 1) {
      toast.error("Enter valid salad count");
      return;
    }
    const price = Number.parseFloat(form.price);
    if (Number.isNaN(price) || price < 0) {
      toast.error("Enter valid price");
      return;
    }

    const badge = form.badge.trim() || null;

    if (editingPlan) {
      await updateMutation.mutateAsync({
        id: editingPlan.id,
        name: form.name.trim(),
        durationType: form.durationType,
        saladCount: BigInt(saladCount),
        price,
        deliveryFrequency: form.deliveryFrequency,
        features: form.features,
        badge,
        active: form.active,
      });
      toast.success("Plan updated successfully");
    } else {
      await createMutation.mutateAsync({
        name: form.name.trim(),
        durationType: form.durationType,
        saladCount: BigInt(saladCount),
        price,
        deliveryFrequency: form.deliveryFrequency,
        features: form.features,
        badge,
      });
      toast.success("Plan created successfully");
    }
    setDialogOpen(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    toast.success("Plan deleted");
    setDeleteTarget(null);
  }

  async function handleToggle(plan: SubscriptionPlanTemplate) {
    await toggleMutation.mutateAsync(plan.id);
    toast.success(plan.active ? "Plan deactivated" : "Plan activated");
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">
            Subscription Plans
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage plan templates shown on the customer subscriptions page.
          </p>
        </div>
        <Button
          onClick={openCreate}
          data-ocid="plans.primary_button"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Plan
        </Button>
      </motion.div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3" data-ocid="plans.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div
          className="text-center py-12 text-destructive"
          data-ocid="plans.error_state"
        >
          Failed to load subscription plans.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && plans?.length === 0 && (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="plans.empty_state"
        >
          <p className="text-lg font-medium mb-1">No subscription plans yet</p>
          <p className="text-sm">
            Click "Add Plan" to create your first plan template.
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && plans && plans.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl border border-border shadow-sm overflow-hidden"
          data-ocid="plans.table"
        >
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Salads</TableHead>
                  <TableHead>Price (Rs)</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Badge</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan, idx) => (
                  <TableRow
                    key={String(plan.id)}
                    data-ocid={`plans.item.${idx + 1}`}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell className="capitalize">
                      {plan.durationType}
                    </TableCell>
                    <TableCell>{String(plan.saladCount)}</TableCell>
                    <TableCell>
                      Rs {plan.price.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="capitalize">
                      {plan.deliveryFrequency}
                    </TableCell>
                    <TableCell>
                      {plan.badge ? (
                        <Badge variant="secondary" className="text-xs">
                          {plan.badge}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={plan.active}
                        onCheckedChange={() => void handleToggle(plan)}
                        disabled={toggleMutation.isPending}
                        data-ocid={`plans.switch.${idx + 1}`}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(plan)}
                          data-ocid={`plans.edit_button.${idx + 1}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(plan)}
                          data-ocid={`plans.delete_button.${idx + 1}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </motion.div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" data-ocid="plans.dialog">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? "Edit Plan" : "Create Subscription Plan"}
            </DialogTitle>
            <DialogDescription>
              {editingPlan
                ? "Update the details of this subscription plan."
                : "Fill in the details to create a new plan template."}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-2">
            <div className="space-y-4 py-2">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="plan-name">Plan Name</Label>
                <Input
                  id="plan-name"
                  placeholder="e.g. Weekly Weight Loss Plan"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  data-ocid="plans.input"
                />
              </div>

              {/* Duration & Delivery row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Duration Type</Label>
                  <Select
                    value={form.durationType}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        durationType: v as DurationType,
                      }))
                    }
                  >
                    <SelectTrigger data-ocid="plans.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DurationType.weekly}>
                        Weekly
                      </SelectItem>
                      <SelectItem value={DurationType.monthly}>
                        Monthly
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Delivery Frequency</Label>
                  <Select
                    value={form.deliveryFrequency}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        deliveryFrequency: v as DeliveryFrequency,
                      }))
                    }
                  >
                    <SelectTrigger data-ocid="plans.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DeliveryFrequency.daily}>
                        Daily
                      </SelectItem>
                      <SelectItem value={DeliveryFrequency.weekly}>
                        Weekly
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Salads & Price row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="plan-salads">Number of Salads</Label>
                  <Input
                    id="plan-salads"
                    type="number"
                    min="1"
                    placeholder="7"
                    value={form.saladCount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, saladCount: e.target.value }))
                    }
                    data-ocid="plans.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="plan-price">Price (Rs)</Label>
                  <Input
                    id="plan-price"
                    type="number"
                    min="0"
                    placeholder="999"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                    data-ocid="plans.input"
                  />
                </div>
              </div>

              {/* Badge */}
              <div className="space-y-1.5">
                <Label htmlFor="plan-badge">Plan Badge (optional)</Label>
                <Input
                  id="plan-badge"
                  placeholder="Popular"
                  value={form.badge}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, badge: e.target.value }))
                  }
                  data-ocid="plans.input"
                />
              </div>

              {/* Features */}
              <div className="space-y-2">
                <Label>Features</Label>
                {/* Existing chips */}
                {form.features.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.features.map((feat, i) => (
                      <span
                        key={feat}
                        className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full text-xs px-2.5 py-1"
                      >
                        {feat}
                        <button
                          type="button"
                          onClick={() => removeFeature(i)}
                          className="hover:text-destructive transition-colors"
                          data-ocid="plans.delete_button"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {/* Add feature input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. 7 salads per week"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addFeature();
                      }
                    }}
                    data-ocid="plans.input"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={addFeature}
                    data-ocid="plans.secondary_button"
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Active toggle (edit mode only) */}
              {editingPlan && (
                <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium">Active</p>
                    <p className="text-xs text-muted-foreground">
                      Visible to customers
                    </p>
                  </div>
                  <Switch
                    checked={form.active}
                    onCheckedChange={(v) =>
                      setForm((f) => ({ ...f, active: v }))
                    }
                    data-ocid="plans.switch"
                  />
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="plans.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleSave()}
              disabled={isSaving}
              data-ocid="plans.submit_button"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving
                ? "Saving…"
                : editingPlan
                  ? "Save Changes"
                  : "Create Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent data-ocid="plans.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="plans.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => void handleDelete()}
              data-ocid="plans.confirm_button"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
