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
  useBowlSizes,
  useCreateBowlSize,
  useDeleteBowlSize,
  useToggleBowlSizeStatus,
  useUpdateBowlSize,
} from "@/hooks/useAdminQueries";
import type { BowlSize } from "@/types/bowl";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const EMPTY_FORM = {
  name: "",
  basePriceRs: "",
  baseWeightG: "",
  maxVegetables: "",
  maxProteins: "",
  maxDressings: "",
  isActive: true,
};

export default function AdminBowlSizes() {
  const { data: sizes, isLoading } = useBowlSizes();
  const createSize = useCreateBowlSize();
  const updateSize = useUpdateBowlSize();
  const toggleStatus = useToggleBowlSizeStatus();
  const deleteSize = useDeleteBowlSize();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BowlSize | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BowlSize | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  function field(key: keyof typeof form, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function openAdd() {
    setEditingItem(null);
    setForm({ ...EMPTY_FORM });
    setIsFormOpen(true);
  }

  function openEdit(item: BowlSize) {
    setEditingItem(item);
    setForm({
      name: item.name,
      basePriceRs: item.basePriceRs.toString(),
      baseWeightG: Number(item.baseWeightG).toString(),
      maxVegetables: Number(item.maxVegetables).toString(),
      maxProteins: Number(item.maxProteins).toString(),
      maxDressings: Number(item.maxDressings).toString(),
      isActive: item.isActive,
    });
    setIsFormOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    if (!form.basePriceRs || !form.baseWeightG) {
      toast.error("Price and weight are required.");
      return;
    }
    try {
      if (editingItem) {
        await updateSize.mutateAsync({
          id: editingItem.id,
          name: form.name.trim(),
          basePriceRs: Number(form.basePriceRs),
          baseWeightG: BigInt(form.baseWeightG),
          maxVegetables: BigInt(form.maxVegetables || 3),
          maxProteins: BigInt(form.maxProteins || 1),
          maxDressings: BigInt(form.maxDressings || 1),
        });
        toast.success("Bowl size updated.");
      } else {
        await createSize.mutateAsync({
          name: form.name.trim(),
          basePriceRs: Number(form.basePriceRs),
          baseWeightG: BigInt(form.baseWeightG),
          maxVegetables: BigInt(form.maxVegetables || 3),
          maxProteins: BigInt(form.maxProteins || 1),
          maxDressings: BigInt(form.maxDressings || 1),
        });
        toast.success("Bowl size created.");
      }
      setIsFormOpen(false);
    } catch (err) {
      toast.error(`Failed to save bowl size: ${String(err)}`);
    }
  }

  async function handleToggle(item: BowlSize) {
    try {
      await toggleStatus.mutateAsync(item.id);
      toast.success(
        `${item.name} ${item.isActive ? "deactivated" : "activated"}.`,
      );
    } catch (err) {
      toast.error(`Failed to toggle: ${String(err)}`);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteSize.mutateAsync(deleteTarget.id);
      toast.success(`${deleteTarget.name} deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(`Failed to delete: ${String(err)}`);
    }
  }

  const isSaving = createSize.isPending || updateSize.isPending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bowl Sizes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure bowl size options, pricing, and ingredient limits.
          </p>
        </div>
        <Button onClick={openAdd} data-ocid="bowl_sizes.open_modal_button">
          <Plus className="h-4 w-4 mr-2" />
          Add Bowl Size
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2" data-ocid="bowl_sizes.loading_state">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : !sizes?.length ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="bowl_sizes.empty_state"
        >
          No bowl sizes yet. Click "Add Bowl Size" to create one.
        </div>
      ) : (
        <div
          className="border rounded-xl overflow-hidden"
          data-ocid="bowl_sizes.table"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Base Weight</TableHead>
                <TableHead>Max Veg</TableHead>
                <TableHead>Max Protein</TableHead>
                <TableHead>Max Dressing</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(sizes as BowlSize[]).map((item, idx) => (
                <TableRow
                  key={item.id.toString()}
                  data-ocid={`bowl_sizes.item.${idx + 1}`}
                >
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>₹{item.basePriceRs}</TableCell>
                  <TableCell>{Number(item.baseWeightG)}g</TableCell>
                  <TableCell>{Number(item.maxVegetables)}</TableCell>
                  <TableCell>{Number(item.maxProteins)}</TableCell>
                  <TableCell>{Number(item.maxDressings)}</TableCell>
                  <TableCell>
                    <Switch
                      checked={item.isActive}
                      onCheckedChange={() => handleToggle(item)}
                      data-ocid={`bowl_sizes.switch.${idx + 1}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEdit(item)}
                        data-ocid={`bowl_sizes.edit_button.${idx + 1}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => setDeleteTarget(item)}
                        data-ocid={`bowl_sizes.delete_button.${idx + 1}`}
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
        <DialogContent className="max-w-md" data-ocid="bowl_sizes.dialog">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Bowl Size" : "Add Bowl Size"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="bs-name">Size Name *</Label>
              <Input
                id="bs-name"
                value={form.name}
                onChange={(e) => field("name", e.target.value)}
                placeholder="e.g. Regular, Large"
                data-ocid="bowl_sizes.input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="bs-price">Base Price (₹) *</Label>
                <Input
                  id="bs-price"
                  type="number"
                  min="0"
                  value={form.basePriceRs}
                  onChange={(e) => field("basePriceRs", e.target.value)}
                  placeholder="149"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="bs-weight">Base Weight (g) *</Label>
                <Input
                  id="bs-weight"
                  type="number"
                  min="0"
                  value={form.baseWeightG}
                  onChange={(e) => field("baseWeightG", e.target.value)}
                  placeholder="250"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="bs-maxveg">Max Vegetables</Label>
                <Input
                  id="bs-maxveg"
                  type="number"
                  min="0"
                  value={form.maxVegetables}
                  onChange={(e) => field("maxVegetables", e.target.value)}
                  placeholder="3"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="bs-maxpro">Max Proteins</Label>
                <Input
                  id="bs-maxpro"
                  type="number"
                  min="0"
                  value={form.maxProteins}
                  onChange={(e) => field("maxProteins", e.target.value)}
                  placeholder="1"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="bs-maxdre">Max Dressings</Label>
                <Input
                  id="bs-maxdre"
                  type="number"
                  min="0"
                  value={form.maxDressings}
                  onChange={(e) => field("maxDressings", e.target.value)}
                  placeholder="1"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="bs-active"
                checked={form.isActive}
                onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
                data-ocid="bowl_sizes.switch"
              />
              <Label htmlFor="bs-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              data-ocid="bowl_sizes.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              data-ocid="bowl_sizes.save_button"
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
        <AlertDialogContent data-ocid="bowl_sizes.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bowl Size</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="bowl_sizes.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
              data-ocid="bowl_sizes.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
