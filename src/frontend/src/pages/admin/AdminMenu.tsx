import type { MenuItem, SaladIngredient } from "@/backend";
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
  DialogFooter,
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
import { Separator } from "@/components/ui/separator";
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
import { Textarea } from "@/components/ui/textarea";
import {
  useAddMenuItem,
  useAllIngredients,
  useAllMenuItems,
  useDeleteMenuItem,
  useGetSaladIngredients,
  useSetSaladIngredients,
  useToggleAvailability,
  useUpdateMenuItem,
} from "@/hooks/useAdminQueries";
import {
  Leaf,
  Loader2,
  Pencil,
  Plus,
  Power,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type MenuForm = {
  name: string;
  description: string;
  category: string;
  price: string;
  calories: string;
  protein: string;
  imageUrl: string;
  available: boolean;
};

type IngredientRow = {
  key: string;
  ingredientId: string;
  quantity: string;
};

const EMPTY_FORM: MenuForm = {
  name: "",
  description: "",
  category: "",
  price: "",
  calories: "",
  protein: "",
  imageUrl: "",
  available: true,
};

function itemToForm(item: MenuItem): MenuForm {
  return {
    name: item.name,
    description: item.description,
    category: item.category,
    price: item.price.toString(),
    calories: item.calories.toString(),
    protein: item.protein.toString(),
    imageUrl: item.imageUrl ?? "",
    available: item.available,
  };
}

export default function AdminMenu() {
  const { data: items, isLoading } = useAllMenuItems();
  const { data: allIngredients } = useAllIngredients();
  const addMenuItem = useAddMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();
  const toggleAvailability = useToggleAvailability();
  const setSaladIngredients = useSetSaladIngredients();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<MenuForm>(EMPTY_FORM);
  const [ingredientRows, setIngredientRows] = useState<IngredientRow[]>([]);

  // Fetch existing salad ingredients when editing
  const { data: existingSaladIngredients, isLoading: isLoadingIngredients } =
    useGetSaladIngredients(editingItem?.id ?? null);

  // Pre-populate ingredientRows when editing and data is available
  useEffect(() => {
    if (editingItem && existingSaladIngredients) {
      setIngredientRows(
        existingSaladIngredients.map((si) => ({
          key: `${si.saladId.toString()}-${si.ingredientId.toString()}`,
          ingredientId: si.ingredientId.toString(),
          quantity: si.quantityRequired.toString(),
        })),
      );
    }
  }, [editingItem, existingSaladIngredients]);

  function openAdd() {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setIngredientRows([]);
    setIsFormOpen(true);
  }

  function openEdit(item: MenuItem) {
    setEditingItem(item);
    setForm(itemToForm(item));
    setIngredientRows([]); // will be populated by useEffect once data loads
    setIsFormOpen(true);
  }

  function handleFieldChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function addIngredientRow() {
    setIngredientRows((prev) => [
      ...prev,
      { key: `new-${Date.now()}`, ingredientId: "", quantity: "" },
    ]);
  }

  function removeIngredientRow(index: number) {
    setIngredientRows((prev) => prev.filter((_, i) => i !== index));
  }

  function updateIngredientRow(
    index: number,
    field: keyof IngredientRow,
    value: string,
  ) {
    setIngredientRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const menuItem: MenuItem = {
      id: editingItem ? editingItem.id : BigInt(Date.now()),
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      calories: BigInt(Math.round(Number(form.calories))),
      protein: BigInt(Math.round(Number(form.protein))),
      imageUrl: form.imageUrl.trim() || undefined,
      available: form.available,
    };

    const validIngredientRows = ingredientRows.filter(
      (row) => row.ingredientId !== "" && row.quantity !== "",
    );

    const ingredientList: SaladIngredient[] = validIngredientRows.map(
      (row) => ({
        saladId: menuItem.id,
        ingredientId: BigInt(row.ingredientId),
        quantityRequired: BigInt(Math.round(Number(row.quantity))),
      }),
    );

    if (editingItem) {
      updateMenuItem.mutate(menuItem, {
        onSuccess: async () => {
          // Save ingredient mappings
          try {
            await setSaladIngredients.mutateAsync({
              saladId: menuItem.id,
              ingredientList,
            });
          } catch {
            // ingredient save failure is non-blocking
          }
          toast.success("Menu item updated");
          setIsFormOpen(false);
        },
        onError: (err) => toast.error(`Failed to update: ${err.message}`),
      });
    } else {
      addMenuItem.mutate(menuItem, {
        onSuccess: async () => {
          try {
            await setSaladIngredients.mutateAsync({
              saladId: menuItem.id,
              ingredientList,
            });
          } catch {
            // ingredient save failure is non-blocking
          }
          toast.success("Menu item added");
          setIsFormOpen(false);
        },
        onError: (err) => toast.error(`Failed to add: ${err.message}`),
      });
    }
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteMenuItem.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Menu item deleted");
        setDeleteTarget(null);
      },
      onError: (err) => toast.error(`Failed to delete: ${err.message}`),
    });
  }

  function handleToggle(item: MenuItem) {
    toggleAvailability.mutate(item.id, {
      onSuccess: () => toast.success("Status updated"),
      onError: (err) => toast.error(`Failed to toggle: ${err.message}`),
    });
  }

  const isPending =
    addMenuItem.isPending ||
    updateMenuItem.isPending ||
    setSaladIngredients.isPending;

  return (
    <div className="p-6 max-w-7xl mx-auto" data-ocid="admin.menu.page">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">
            Menu Management
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your salad menu items — add, edit, or toggle availability
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="bg-primary hover:bg-primary/90 gap-2"
          data-ocid="admin.menu.add_button"
        >
          <Plus className="h-4 w-4" />
          Add Menu Item
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="space-y-2" data-ocid="admin.menu.loading_state">
          {[1, 2, 3, 4, 5].map((n) => (
            <Skeleton key={n} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : !items || items.length === 0 ? (
        <div
          className="text-center py-24 text-muted-foreground"
          data-ocid="admin.menu.empty_state"
        >
          <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-lg font-medium">No menu items yet</p>
          <p className="text-sm mt-1 mb-5">
            Add your first salad to get started
          </p>
          <Button
            onClick={openAdd}
            variant="outline"
            className="gap-2"
            data-ocid="admin.menu.add_button"
          >
            <Plus className="h-4 w-4" />
            Add Menu Item
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <Table data-ocid="admin.menu.table">
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground w-16">
                  Image
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Name
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Category
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Calories
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Protein
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Price (₹)
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
              {items.map((item, i) => (
                <TableRow
                  key={item.id.toString()}
                  className="hover:bg-muted/20 transition-colors"
                  data-ocid={`admin.menu.item.${i + 1}`}
                >
                  {/* Image */}
                  <TableCell>
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover border border-border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center border border-border">
                        <Leaf className="h-4 w-4 text-muted-foreground/50" />
                      </div>
                    )}
                  </TableCell>

                  {/* Name + description */}
                  <TableCell>
                    <p className="font-medium text-sm text-foreground">
                      {item.name}
                    </p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                        {item.description}
                      </p>
                    )}
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="text-xs font-medium capitalize"
                    >
                      {item.category}
                    </Badge>
                  </TableCell>

                  {/* Calories */}
                  <TableCell className="text-sm text-foreground">
                    {item.calories.toString()} kcal
                  </TableCell>

                  {/* Protein */}
                  <TableCell className="text-sm text-foreground">
                    {item.protein.toString()} g
                  </TableCell>

                  {/* Price */}
                  <TableCell className="text-sm font-semibold text-foreground">
                    ₹{Number(item.price).toLocaleString("en-IN")}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {item.available ? (
                      <Badge className="bg-emerald-50 border-emerald-200 text-emerald-700 border text-xs font-semibold">
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-50 border-gray-200 text-gray-500 border text-xs font-semibold">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {/* Toggle availability */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 transition-colors ${
                          item.available
                            ? "hover:bg-amber-50 hover:text-amber-600 text-emerald-600"
                            : "hover:bg-emerald-50 hover:text-emerald-600 text-gray-400"
                        }`}
                        onClick={() => handleToggle(item)}
                        title={item.available ? "Deactivate" : "Activate"}
                        data-ocid={`admin.menu.toggle.${i + 1}`}
                      >
                        {toggleAvailability.isPending &&
                        toggleAvailability.variables === item.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Power className="h-3.5 w-3.5" />
                        )}
                      </Button>

                      {/* Edit */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => openEdit(item)}
                        title="Edit"
                        data-ocid={`admin.menu.edit_button.${i + 1}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        onClick={() => setDeleteTarget(item)}
                        title="Delete"
                        data-ocid={`admin.menu.delete_button.${i + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) setIsFormOpen(false);
        }}
      >
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          data-ocid="admin.menu.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              {editingItem ? "Edit Menu Item" : "Add Menu Item"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Salad Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Salad Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleFieldChange}
                placeholder="e.g. Caesar Garden Salad"
                required
                data-ocid="admin.menu.name.input"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleFieldChange}
                placeholder="Brief description of the salad…"
                rows={3}
                data-ocid="admin.menu.description.textarea"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Category <span className="text-destructive">*</span>
              </Label>
              <Input
                id="category"
                name="category"
                value={form.category}
                onChange={handleFieldChange}
                placeholder="e.g. Classic, Protein, Vegan"
                required
                data-ocid="admin.menu.category.input"
              />
            </div>

            {/* Price + Calories row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium">
                  Price (₹) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleFieldChange}
                  placeholder="0.00"
                  required
                  data-ocid="admin.menu.price.input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="calories" className="text-sm font-medium">
                  Calories (kcal) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="calories"
                  name="calories"
                  type="number"
                  min="0"
                  value={form.calories}
                  onChange={handleFieldChange}
                  placeholder="0"
                  required
                  data-ocid="admin.menu.calories.input"
                />
              </div>
            </div>

            {/* Protein */}
            <div className="space-y-2">
              <Label htmlFor="protein" className="text-sm font-medium">
                Protein (g) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="protein"
                name="protein"
                type="number"
                min="0"
                value={form.protein}
                onChange={handleFieldChange}
                placeholder="0"
                required
                data-ocid="admin.menu.protein.input"
              />
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="text-sm font-medium">
                Image URL
              </Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleFieldChange}
                placeholder="https://... or paste an image URL"
                data-ocid="admin.menu.image_url.input"
              />
              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="mt-2 w-20 h-20 rounded-lg object-cover border border-border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3 py-1">
              <Switch
                id="available"
                checked={form.available}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, available: checked }))
                }
                data-ocid="admin.menu.active.switch"
              />
              <Label
                htmlFor="available"
                className="text-sm font-medium cursor-pointer"
              >
                Active
              </Label>
            </div>

            {/* ── Ingredients Section ── */}
            <Separator />
            <div
              className="space-y-3"
              data-ocid="admin.menu.ingredients.section"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Ingredients
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Link inventory ingredients and specify quantity per serving
                  </p>
                </div>
              </div>

              {/* Loading state when editing and ingredients are still fetching */}
              {editingItem && isLoadingIngredients ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full rounded-md" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              ) : ingredientRows.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-muted/20 py-5 text-center">
                  <Leaf className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">
                    No ingredients linked yet
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {ingredientRows.map((row, i) => {
                    const selectedIngredient = allIngredients?.find(
                      (ing) => ing.id.toString() === row.ingredientId,
                    );
                    const unitLabel = selectedIngredient?.unit ?? "";

                    return (
                      <div
                        key={row.key}
                        className="flex items-end gap-2 p-2 rounded-lg bg-muted/20 border border-border"
                      >
                        {/* Ingredient select */}
                        <div className="flex-1 space-y-1.5">
                          <Label className="text-xs text-muted-foreground">
                            Ingredient
                          </Label>
                          <Select
                            value={row.ingredientId}
                            onValueChange={(val) =>
                              updateIngredientRow(i, "ingredientId", val)
                            }
                          >
                            <SelectTrigger
                              data-ocid={`admin.menu.ingredient.select.${i + 1}`}
                              className="h-8 text-xs"
                            >
                              <SelectValue placeholder="Select ingredient…" />
                            </SelectTrigger>
                            <SelectContent>
                              {allIngredients && allIngredients.length > 0 ? (
                                allIngredients.map((ing) => (
                                  <SelectItem
                                    key={ing.id.toString()}
                                    value={ing.id.toString()}
                                    className="text-xs"
                                  >
                                    {ing.name} ({ing.unit})
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="__none__" disabled>
                                  No ingredients in inventory
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Quantity input */}
                        <div className="w-28 space-y-1.5">
                          <Label className="text-xs text-muted-foreground">
                            Qty{unitLabel ? ` (${unitLabel})` : ""}
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            value={row.quantity}
                            onChange={(e) =>
                              updateIngredientRow(i, "quantity", e.target.value)
                            }
                            placeholder="0"
                            className="h-8 text-xs"
                            data-ocid={`admin.menu.ingredient.quantity.${i + 1}`}
                          />
                        </div>

                        {/* Remove button */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                          onClick={() => removeIngredientRow(i)}
                          title="Remove ingredient"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Ingredient row button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-1.5 text-xs h-8 border-dashed"
                onClick={addIngredientRow}
                data-ocid="admin.menu.ingredient.add_button"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Ingredient
              </Button>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                data-ocid="admin.menu.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 min-w-[120px]"
                disabled={isPending}
                data-ocid="admin.menu.submit_button"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingItem ? (
                  "Save Changes"
                ) : (
                  "Add Item"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent data-ocid="admin.menu.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete Menu Item
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}
              &rdquo;? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.menu.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="admin.menu.delete.confirm_button"
            >
              {deleteMenuItem.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
