import type { IngredientItem } from "@/backend";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAddIngredient,
  useAllIngredients,
  useDeleteIngredient,
  useUpdateIngredient,
} from "@/hooks/useAdminQueries";
import {
  AlertTriangle,
  Loader2,
  Package,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

type IngredientForm = {
  name: string;
  stockQuantity: string;
  unit: string;
  costPerUnit: string;
  reorderLevel: string;
};

const EMPTY_FORM: IngredientForm = {
  name: "",
  stockQuantity: "",
  unit: "",
  costPerUnit: "",
  reorderLevel: "",
};

export default function AdminInventory() {
  const { data: ingredients, isLoading } = useAllIngredients();
  const addIngredient = useAddIngredient();
  const updateIngredient = useUpdateIngredient();
  const deleteIngredient = useDeleteIngredient();

  const [modal, setModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    item: IngredientItem | null;
  }>({ open: false, mode: "add", item: null });

  const [form, setForm] = useState<IngredientForm>(EMPTY_FORM);

  function openAdd() {
    setForm(EMPTY_FORM);
    setModal({ open: true, mode: "add", item: null });
  }

  function openEdit(item: IngredientItem) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyItem = item as any;
    setForm({
      name: item.name,
      stockQuantity: (
        anyItem.stockQuantity ??
        anyItem.quantity ??
        BigInt(0)
      ).toString(),
      unit: item.unit,
      costPerUnit: (
        anyItem.costPerUnit ??
        anyItem.pricePerUnit ??
        0
      ).toString(),
      reorderLevel: (
        anyItem.reorderLevel ??
        anyItem.lowStockThreshold ??
        BigInt(0)
      ).toString(),
    });
    setModal({ open: true, mode: "edit", item });
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ingredientData: IngredientItem = {
      id:
        modal.mode === "edit" && modal.item
          ? modal.item.id
          : BigInt(Date.now()),
      name: form.name.trim(),
      stockQuantity: BigInt(Math.round(Number(form.stockQuantity))),
      unit: form.unit.trim(),
      costPerUnit: Number(form.costPerUnit),
      reorderLevel: BigInt(Math.round(Number(form.reorderLevel))),
      // Legacy fields for backward compat with old backend.ts
      quantity: BigInt(Math.round(Number(form.stockQuantity))),
      pricePerUnit: Number(form.costPerUnit),
      lowStockThreshold: BigInt(Math.round(Number(form.reorderLevel))),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any as IngredientItem;

    if (modal.mode === "add") {
      addIngredient.mutate(ingredientData, {
        onSuccess: () => {
          toast.success("Ingredient added successfully");
          setModal({ open: false, mode: "add", item: null });
        },
        onError: () => toast.error("Failed to add ingredient"),
      });
    } else {
      updateIngredient.mutate(ingredientData, {
        onSuccess: () => {
          toast.success("Ingredient updated successfully");
          setModal({ open: false, mode: "add", item: null });
        },
        onError: () => toast.error("Failed to update ingredient"),
      });
    }
  }

  function handleDelete(id: bigint) {
    deleteIngredient.mutate(id, {
      onSuccess: () => toast.success("Ingredient deleted"),
      onError: () => toast.error("Failed to delete ingredient"),
    });
  }

  const isPending = addIngredient.isPending || updateIngredient.isPending;
  const lowStockCount =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ingredients?.filter((i) => {
      const anyI = i as any;
      const qty = anyI.stockQuantity ?? anyI.quantity ?? BigInt(0);
      const threshold =
        anyI.reorderLevel ?? anyI.lowStockThreshold ?? BigInt(0);
      return qty <= threshold;
    }).length ?? 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">
            Inventory
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage salad ingredients and stock levels
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lowStockCount > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-3 py-2 text-xs font-medium">
              <AlertTriangle className="h-3.5 w-3.5" />
              {lowStockCount} low stock
            </div>
          )}
          <Button
            onClick={openAdd}
            className="bg-primary hover:bg-primary/90 gap-2"
            data-ocid="admin.inventory.add.button"
          >
            <Plus className="h-4 w-4" />
            Add Ingredient
          </Button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="space-y-2" data-ocid="admin.inventory.loading_state">
          {[1, 2, 3, 4, 5].map((n) => (
            <Skeleton key={n} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : !ingredients || ingredients.length === 0 ? (
        <div
          className="text-center py-20 text-muted-foreground"
          data-ocid="admin.inventory.empty_state"
        >
          <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-lg font-medium">No ingredients yet</p>
          <p className="text-sm mt-1">
            Add your first ingredient to get started
          </p>
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
                  Quantity
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Unit
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Price/Unit (₹)
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Low Stock At
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
              {ingredients.map((item, i) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const anyItem = item as any;
                const stockQty =
                  anyItem.stockQuantity ?? anyItem.quantity ?? BigInt(0);
                const reorderLvl =
                  anyItem.reorderLevel ??
                  anyItem.lowStockThreshold ??
                  BigInt(0);
                const costUnit =
                  anyItem.costPerUnit ?? anyItem.pricePerUnit ?? 0;
                const isLowStock = stockQty <= reorderLvl;
                return (
                  <TableRow
                    key={item.id.toString()}
                    className="hover:bg-muted/20 transition-colors"
                    data-ocid={`admin.inventory.row.${i + 1}`}
                  >
                    <TableCell className="font-medium text-sm text-foreground">
                      {item.name}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {stockQty.toString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.unit}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      ₹{Number(costUnit).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {reorderLvl.toString()}
                    </TableCell>
                    <TableCell>
                      {isLowStock ? (
                        <Badge className="bg-red-50 border-red-200 text-red-700 border text-xs font-semibold flex items-center gap-1 w-fit">
                          <AlertTriangle className="h-3 w-3" />
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-50 border-emerald-200 text-emerald-700 border text-xs font-semibold">
                          In Stock
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => openEdit(item)}
                          data-ocid="admin.inventory.edit.button"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDelete(item.id)}
                          disabled={deleteIngredient.isPending}
                          data-ocid="admin.inventory.delete.button"
                        >
                          {deleteIngredient.isPending &&
                          deleteIngredient.variables === item.id ? (
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
        <DialogContent className="max-w-md" data-ocid="admin.inventory.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              {modal.mode === "add" ? "Add Ingredient" : "Edit Ingredient"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="e.g. Romaine Lettuce"
                required
                data-ocid="admin.form.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="stockQuantity" className="text-sm font-medium">
                  Quantity
                </Label>
                <Input
                  id="stockQuantity"
                  name="stockQuantity"
                  type="number"
                  min="0"
                  value={form.stockQuantity}
                  onChange={handleFormChange}
                  placeholder="0"
                  required
                  data-ocid="admin.form.input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit" className="text-sm font-medium">
                  Unit
                </Label>
                <Input
                  id="unit"
                  name="unit"
                  value={form.unit}
                  onChange={handleFormChange}
                  placeholder="kg / pcs / grams"
                  required
                  data-ocid="admin.form.input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="costPerUnit" className="text-sm font-medium">
                  Cost/Unit (₹)
                </Label>
                <Input
                  id="costPerUnit"
                  name="costPerUnit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.costPerUnit}
                  onChange={handleFormChange}
                  placeholder="0.00"
                  required
                  data-ocid="admin.form.input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorderLevel" className="text-sm font-medium">
                  Reorder Level
                </Label>
                <Input
                  id="reorderLevel"
                  name="reorderLevel"
                  type="number"
                  min="0"
                  value={form.reorderLevel}
                  onChange={handleFormChange}
                  placeholder="10"
                  required
                  data-ocid="admin.form.input"
                />
              </div>
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
                  "Add Ingredient"
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
