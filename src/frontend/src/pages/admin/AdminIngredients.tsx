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
  useAllIngredients,
  useBowlIngredients,
  useCreateBowlIngredient,
  useDeleteBowlIngredient,
  useToggleBowlIngredientStatus,
  useUpdateBowlIngredient,
} from "@/hooks/useAdminQueries";
import type { BowlIngredient } from "@/types/bowl";
import {
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const CATEGORY_COLORS: Record<string, string> = {
  base: "bg-green-100 text-green-800",
  vegetable: "bg-emerald-100 text-emerald-800",
  protein: "bg-orange-100 text-orange-800",
  dressing: "bg-blue-100 text-blue-800",
};

const CATEGORY_LABELS: Record<string, string> = {
  base: "Base",
  vegetable: "Vegetable",
  protein: "Protein",
  dressing: "Dressing",
};

const EMPTY_FORM = {
  name: "",
  category: "base" as "base" | "vegetable" | "protein" | "dressing",
  priceRs: "",
  weightG: "",
  calories: "",
  inventoryItemId: "",
  isActive: true,
};

async function compressImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const maxWidth = 800;
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

export default function AdminIngredients() {
  const { data: ingredients, isLoading } = useBowlIngredients();
  const { data: inventoryItems } = useAllIngredients();
  const createIngredient = useCreateBowlIngredient();
  const updateIngredient = useUpdateBowlIngredient();
  const toggleStatus = useToggleBowlIngredientStatus();
  const deleteIngredient = useDeleteBowlIngredient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BowlIngredient | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BowlIngredient | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [imagePreview, setImagePreview] = useState("");
  const [imagePending, setImagePending] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openAdd() {
    setEditingItem(null);
    setForm({ ...EMPTY_FORM });
    setImagePreview("");
    setImagePending(null);
    setImageError("");
    setIsFormOpen(true);
  }

  function openEdit(item: BowlIngredient) {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category,
      priceRs: item.priceRs.toString(),
      weightG: Number(item.weightG).toString(),
      calories: Number(item.calories).toString(),
      inventoryItemId: item.inventoryItemId
        ? item.inventoryItemId.toString()
        : "",
      isActive: item.isActive,
    });
    setImagePreview(item.imageData ?? "");
    setImagePending(null);
    setImageError("");
    setIsFormOpen(true);
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError("");
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setImageError("Only JPG, PNG, WEBP allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError("Max file size is 2MB.");
      return;
    }
    try {
      const b64 = await compressImageToBase64(file);
      setImagePending(b64);
      setImagePreview(b64);
    } catch {
      setImageError("Failed to process image.");
    }
  }

  function clearImage() {
    setImagePending(null);
    setImagePreview("");
    setImageError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    if (!form.priceRs || !form.weightG || !form.calories) {
      toast.error("Price, weight, and calories are required.");
      return;
    }
    const inventoryItemId = form.inventoryItemId
      ? BigInt(form.inventoryItemId)
      : null;
    const imageData =
      imagePending !== null ? imagePending : (editingItem?.imageData ?? null);

    try {
      if (editingItem) {
        await updateIngredient.mutateAsync({
          id: editingItem.id,
          name: form.name.trim(),
          category: form.category,
          priceRs: Number(form.priceRs),
          weightG: BigInt(form.weightG),
          calories: BigInt(form.calories),
          inventoryItemId,
          imageData,
        });
        toast.success("Ingredient updated.");
      } else {
        await createIngredient.mutateAsync({
          name: form.name.trim(),
          category: form.category,
          priceRs: Number(form.priceRs),
          weightG: BigInt(form.weightG),
          calories: BigInt(form.calories),
          inventoryItemId,
          imageData,
        });
        toast.success("Ingredient created.");
      }
      setIsFormOpen(false);
    } catch (err) {
      toast.error(`Failed to save ingredient: ${String(err)}`);
    }
  }

  async function handleToggle(item: BowlIngredient) {
    try {
      await toggleStatus.mutateAsync(item.id);
      toast.success(
        `${item.name} ${item.isActive ? "deactivated" : "activated"}.`,
      );
    } catch (err) {
      toast.error(`Failed to toggle status: ${String(err)}`);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteIngredient.mutateAsync(deleteTarget.id);
      toast.success(`${deleteTarget.name} deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(`Failed to delete: ${String(err)}`);
    }
  }

  const isSaving = createIngredient.isPending || updateIngredient.isPending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Bowl Ingredients
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage ingredients available in the Build Your Bowl feature.
          </p>
        </div>
        <Button onClick={openAdd} data-ocid="ingredients.open_modal_button">
          <Plus className="h-4 w-4 mr-2" />
          Add Ingredient
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2" data-ocid="ingredients.loading_state">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : !ingredients?.length ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="ingredients.empty_state"
        >
          No ingredients yet. Click "Add Ingredient" to get started.
        </div>
      ) : (
        <div
          className="border rounded-xl overflow-hidden"
          data-ocid="ingredients.table"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Calories</TableHead>
                <TableHead>Inventory Item</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(ingredients as BowlIngredient[]).map((item, idx) => (
                <TableRow
                  key={item.id.toString()}
                  data-ocid={`ingredients.item.${idx + 1}`}
                >
                  <TableCell>
                    {item.imageData ? (
                      <img
                        src={item.imageData}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge className={CATEGORY_COLORS[item.category] ?? ""}>
                      {CATEGORY_LABELS[item.category] ?? item.category}
                    </Badge>
                  </TableCell>
                  <TableCell>₹{item.priceRs}</TableCell>
                  <TableCell>{Number(item.weightG)}g</TableCell>
                  <TableCell>{Number(item.calories)} kcal</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.inventoryItemId
                      ? (inventoryItems?.find(
                          (inv) => inv.id === item.inventoryItemId,
                        )?.name ?? `ID:${item.inventoryItemId}`)
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={item.isActive}
                      onCheckedChange={() => handleToggle(item)}
                      data-ocid={`ingredients.switch.${idx + 1}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEdit(item)}
                        data-ocid={`ingredients.edit_button.${idx + 1}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => setDeleteTarget(item)}
                        data-ocid={`ingredients.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg" data-ocid="ingredients.dialog">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Ingredient" : "Add Ingredient"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="ing-name">Name *</Label>
              <Input
                id="ing-name"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Brown Rice"
                data-ocid="ingredients.input"
              />
            </div>

            <div className="space-y-1">
              <Label>Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, category: v as typeof p.category }))
                }
              >
                <SelectTrigger data-ocid="ingredients.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="base">Base</SelectItem>
                  <SelectItem value="vegetable">Vegetable</SelectItem>
                  <SelectItem value="protein">Protein</SelectItem>
                  <SelectItem value="dressing">Dressing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="ing-price">Price (₹) *</Label>
                <Input
                  id="ing-price"
                  type="number"
                  min="0"
                  value={form.priceRs}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, priceRs: e.target.value }))
                  }
                  placeholder="40"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ing-weight">Weight (g) *</Label>
                <Input
                  id="ing-weight"
                  type="number"
                  min="0"
                  value={form.weightG}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, weightG: e.target.value }))
                  }
                  placeholder="120"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ing-calories">Calories *</Label>
                <Input
                  id="ing-calories"
                  type="number"
                  min="0"
                  value={form.calories}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, calories: e.target.value }))
                  }
                  placeholder="130"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Inventory Item Mapping</Label>
              <Select
                value={form.inventoryItemId || "none"}
                onValueChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    inventoryItemId: v === "none" ? "" : v,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {inventoryItems?.map((inv) => (
                    <SelectItem
                      key={inv.id.toString()}
                      value={inv.id.toString()}
                    >
                      {inv.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Image (optional)</Label>
              {imagePreview ? (
                <div className="relative w-24 h-24">
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-24 h-24 rounded-lg object-cover border"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 w-full border-2 border-dashed border-border rounded-xl p-6 text-muted-foreground hover:border-primary/50 transition-colors"
                  data-ocid="ingredients.dropzone"
                >
                  <Upload className="h-6 w-6" />
                  <span className="text-sm">
                    Click to upload (JPG/PNG/WEBP, max 2MB)
                  </span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageChange}
              />
              {imageError && (
                <p className="text-destructive text-sm">{imageError}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="ing-active"
                checked={form.isActive}
                onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
                data-ocid="ingredients.switch"
              />
              <Label htmlFor="ing-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              data-ocid="ingredients.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              data-ocid="ingredients.save_button"
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="ingredients.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ingredient</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="ingredients.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
              data-ocid="ingredients.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
