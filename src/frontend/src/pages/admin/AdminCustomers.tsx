import type {
  AdminUserRecord,
  Order,
  Subscription,
  UserProfile,
} from "@/backend";
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
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
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
  useAdminCreateUser,
  useAdminDeleteUser,
  useAdminUpdateUser,
  useAllOrders,
  useAllSubscriptions,
  useAllUsers,
} from "@/hooks/useAdminQueries";
import { Principal } from "@icp-sdk/core/principal";
import {
  CalendarDays,
  CheckCircle2,
  Eye,
  Loader2,
  Pencil,
  Plus,
  ShoppingBag,
  Trash2,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncatePrincipal(p: string) {
  return p.length > 22 ? `${p.slice(0, 10)}…${p.slice(-8)}` : p;
}

function calcBmi(weight: number, height: number): number {
  if (!weight || !height) return 0;
  const h = height / 100;
  return Math.round((weight / (h * h)) * 10) / 10;
}

function formatDate(ns: bigint) {
  return new Date(Number(ns / 1_000_000n)).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusColor(status: string) {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "confirmed":
      return "bg-blue-100 text-blue-700";
    case "preparing":
      return "bg-orange-100 text-orange-700";
    case "outForDelivery":
      return "bg-purple-100 text-purple-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

// ─── Form types ───────────────────────────────────────────────────────────────

interface CustomerFormState {
  principalId: string;
  name: string;
  mobileNumber: string;
  email: string;
  address: string;
  height: string;
  weight: string;
  age: string;
  gender: string;
  dietaryPreferences: string;
  dietaryRestrictions: string;
}

const EMPTY_FORM: CustomerFormState = {
  principalId: "",
  name: "",
  mobileNumber: "",
  email: "",
  address: "",
  height: "",
  weight: "",
  age: "",
  gender: "",
  dietaryPreferences: "",
  dietaryRestrictions: "",
};

function profileToForm(record: AdminUserRecord): CustomerFormState {
  const p = record.profile;
  return {
    principalId: record.principal.toString(),
    name: p.name,
    mobileNumber: p.mobileNumber ?? "",
    email: p.email ?? "",
    address: p.address ?? "",
    height: String(p.height || ""),
    weight: String(p.weight || ""),
    age: String(Number(p.age) || ""),
    gender: p.gender ?? "",
    dietaryPreferences: p.dietaryPreferences ?? "",
    dietaryRestrictions: p.dietaryRestrictions ?? "",
  };
}

function formToProfile(form: CustomerFormState): UserProfile {
  const weight = Number.parseFloat(form.weight) || 0;
  const height = Number.parseFloat(form.height) || 0;
  const age = Number.parseInt(form.age) || 0;
  const bmiVal = calcBmi(weight, height);
  const bmi = bmiVal > 0 ? bmiVal : undefined;
  const idealWeight = weight && height ? 22 * (height / 100) ** 2 : undefined;

  let dailyCalories: bigint | undefined = undefined;
  if (bmi !== undefined) {
    let cals: number;
    if (bmi < 18.5) cals = 2200;
    else if (bmi < 25) cals = 2000;
    else if (bmi < 30) cals = 1800;
    else cals = 1500;
    dailyCalories = BigInt(cals);
  }

  return {
    name: form.name.trim(),
    mobileNumber: form.mobileNumber.trim(),
    email: form.email.trim() || undefined,
    address: form.address.trim() || undefined,
    height: height || undefined,
    weight: weight || undefined,
    age: age ? BigInt(age) : undefined,
    gender: form.gender || undefined,
    bmi,
    idealWeight,
    dailyCalories,
    dietaryPreferences: form.dietaryPreferences.trim() || undefined,
    dietaryRestrictions: form.dietaryRestrictions.trim() || undefined,
  };
}

// ─── CustomerForm ─────────────────────────────────────────────────────────────

interface CustomerFormProps {
  form: CustomerFormState;
  onChange: (f: CustomerFormState) => void;
  isEditing: boolean;
  errors: Partial<Record<keyof CustomerFormState, string>>;
}

function CustomerForm({
  form,
  onChange,
  isEditing,
  errors,
}: CustomerFormProps) {
  const set =
    (key: keyof CustomerFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...form, [key]: e.target.value });

  const bmi = useMemo(
    () =>
      calcBmi(
        Number.parseFloat(form.weight) || 0,
        Number.parseFloat(form.height) || 0,
      ),
    [form.weight, form.height],
  );

  return (
    <div className="grid grid-cols-1 gap-4 py-2">
      {!isEditing && (
        <div className="space-y-1.5">
          <Label htmlFor="cf-principal">
            Principal ID <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cf-principal"
            placeholder="aaaaa-bbbbb-ccccc-ddddd-eee"
            value={form.principalId}
            onChange={set("principalId")}
            className={errors.principalId ? "border-destructive" : ""}
            data-ocid="admin.customers.form.principal_input"
          />
          {errors.principalId && (
            <p className="text-xs text-destructive">{errors.principalId}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="cf-name">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cf-name"
            placeholder="Full name"
            value={form.name}
            onChange={set("name")}
            className={errors.name ? "border-destructive" : ""}
            data-ocid="admin.customers.form.name_input"
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cf-email">Email</Label>
          <Input
            id="cf-email"
            type="email"
            placeholder="customer@email.com"
            value={form.email}
            onChange={set("email")}
            className={errors.email ? "border-destructive" : ""}
            data-ocid="admin.customers.form.email_input"
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="cf-mobileNumber">Mobile Number</Label>
          <Input
            id="cf-mobileNumber"
            placeholder="+91 98765 43210"
            value={form.mobileNumber}
            onChange={set("mobileNumber")}
            data-ocid="admin.customers.form.mobile_number_input"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cf-gender">Gender</Label>
          <Select
            value={form.gender}
            onValueChange={(v) => onChange({ ...form, gender: v })}
          >
            <SelectTrigger
              id="cf-gender"
              data-ocid="admin.customers.form.gender_select"
            >
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer_not_to_say">
                Prefer not to say
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cf-address">Address</Label>
        <Textarea
          id="cf-address"
          placeholder="Flat, Street, Area, City"
          rows={2}
          value={form.address}
          onChange={set("address")}
          data-ocid="admin.customers.form.address_input"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="cf-height">Height (cm)</Label>
          <Input
            id="cf-height"
            type="number"
            min={0}
            placeholder="170"
            value={form.height}
            onChange={set("height")}
            data-ocid="admin.customers.form.height_input"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cf-weight">Weight (kg)</Label>
          <Input
            id="cf-weight"
            type="number"
            min={0}
            placeholder="65"
            value={form.weight}
            onChange={set("weight")}
            data-ocid="admin.customers.form.weight_input"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cf-age">Age</Label>
          <Input
            id="cf-age"
            type="number"
            min={0}
            placeholder="28"
            value={form.age}
            onChange={set("age")}
            data-ocid="admin.customers.form.age_input"
          />
        </div>
      </div>

      {bmi > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm">
          <span className="font-medium text-primary">BMI:</span>
          <span className="font-bold text-primary">{bmi}</span>
          <span className="text-muted-foreground text-xs">
            {bmi < 18.5
              ? "(Underweight)"
              : bmi < 25
                ? "(Normal)"
                : bmi < 30
                  ? "(Overweight)"
                  : "(Obese)"}
          </span>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="cf-diet-pref">Dietary Preferences</Label>
        <Textarea
          id="cf-diet-pref"
          placeholder="e.g. Vegetarian, Vegan, High protein..."
          rows={2}
          value={form.dietaryPreferences}
          onChange={set("dietaryPreferences")}
          data-ocid="admin.customers.form.dietary_preferences_input"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cf-diet-rest">Dietary Restrictions</Label>
        <Textarea
          id="cf-diet-rest"
          placeholder="e.g. Gluten-free, Nut allergy..."
          rows={2}
          value={form.dietaryRestrictions}
          onChange={set("dietaryRestrictions")}
          data-ocid="admin.customers.form.dietary_restrictions_input"
        />
      </div>
    </div>
  );
}

// ─── ViewSheet ────────────────────────────────────────────────────────────────

interface ViewSheetProps {
  record: AdminUserRecord;
  orders: Order[];
  subscriptions: Subscription[];
  open: boolean;
  onClose: () => void;
}

function ViewSheet({
  record,
  orders,
  subscriptions,
  open,
  onClose,
}: ViewSheetProps) {
  const principalStr = record.principal.toString();
  const p = record.profile;

  const customerOrders = useMemo(
    () => orders.filter((o) => o.userId.toString() === principalStr),
    [orders, principalStr],
  );

  const customerSubs = useMemo(
    () => subscriptions.filter((s) => s.userId.toString() === principalStr),
    [subscriptions, principalStr],
  );

  const bmi = calcBmi(p.weight ?? 0, p.height ?? 0);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        className="w-full sm:max-w-xl p-0"
        data-ocid="admin.customers.view.sheet"
      >
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {/* Header */}
            <SheetHeader className="space-y-1 pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <SheetTitle className="text-xl font-bold">
                    {p.name}
                  </SheetTitle>
                  <SheetDescription className="text-xs font-mono">
                    {truncatePrincipal(principalStr)}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <Separator />

            {/* Profile Details */}
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Profile
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Email", value: p.email ?? "—" },
                  { label: "Mobile", value: p.mobileNumber ?? "—" },
                  { label: "Gender", value: p.gender ?? "—" },
                  { label: "Age", value: p.age ? `${Number(p.age)} yrs` : "—" },
                  { label: "Height", value: p.height ? `${p.height} cm` : "—" },
                  { label: "Weight", value: p.weight ? `${p.weight} kg` : "—" },
                  { label: "BMI", value: bmi > 0 ? String(bmi) : "—" },
                  {
                    label: "Daily Calories",
                    value: p.dailyCalories
                      ? `${Number(p.dailyCalories)} kcal`
                      : "—",
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg bg-muted/40 px-3 py-2">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              {p.address && (
                <div className="mt-3 rounded-lg bg-muted/40 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm font-medium text-foreground">
                    {p.address}
                  </p>
                </div>
              )}
              {p.dietaryPreferences && (
                <div className="mt-3 rounded-lg bg-muted/40 px-3 py-2">
                  <p className="text-xs text-muted-foreground">
                    Dietary Preferences
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {p.dietaryPreferences}
                  </p>
                </div>
              )}
              {p.dietaryRestrictions && (
                <div className="mt-3 rounded-lg bg-muted/40 px-3 py-2">
                  <p className="text-xs text-muted-foreground">
                    Dietary Restrictions
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {p.dietaryRestrictions}
                  </p>
                </div>
              )}
            </section>

            <Separator />

            {/* Orders */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <ShoppingBag className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Order History ({customerOrders.length})
                </h3>
              </div>
              {customerOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No orders placed yet
                </p>
              ) : (
                <div className="space-y-2">
                  {customerOrders.map((order) => (
                    <div
                      key={String(order.id)}
                      className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Order #{String(order.id)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt)} · {order.items.length}{" "}
                          item
                          {order.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-bold text-primary">
                          ₹{order.totalAmount.toLocaleString("en-IN")}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <Separator />

            {/* Subscriptions */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Subscriptions ({customerSubs.length})
                </h3>
              </div>
              {customerSubs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No subscriptions
                </p>
              ) : (
                <div className="space-y-2">
                  {customerSubs.map((sub) => (
                    <div
                      key={String(sub.id)}
                      className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground capitalize">
                          {sub.plan} Plan
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Started: {formatDate(sub.startDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {sub.status === "active" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                        <Badge
                          variant={
                            sub.status === "active" ? "default" : "destructive"
                          }
                          className="text-xs capitalize"
                        >
                          {sub.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="pt-2 pb-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={onClose}
                data-ocid="admin.customers.view.close_button"
              >
                Close
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminCustomers() {
  const { data: users, isLoading } = useAllUsers();
  const { data: orders = [] } = useAllOrders();
  const { data: subscriptions = [] } = useAllSubscriptions();

  const createUser = useAdminCreateUser();
  const updateUser = useAdminUpdateUser();
  const deleteUser = useAdminDeleteUser();

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<AdminUserRecord | null>(null);
  const [form, setForm] = useState<CustomerFormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof CustomerFormState, string>>
  >({});

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRecord | null>(
    null,
  );

  // View state
  const [viewRecord, setViewRecord] = useState<AdminUserRecord | null>(null);

  // Search
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.profile.name.toLowerCase().includes(q) ||
        (u.profile.email ?? "").toLowerCase().includes(q) ||
        (u.profile.mobileNumber ?? "").includes(q) ||
        u.principal.toString().toLowerCase().includes(q),
    );
  }, [users, search]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!formOpen) {
      setForm(EMPTY_FORM);
      setEditRecord(null);
      setFormErrors({});
    }
  }, [formOpen]);

  function openAdd() {
    setEditRecord(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormOpen(true);
  }

  function openEdit(record: AdminUserRecord) {
    setEditRecord(record);
    setForm(profileToForm(record));
    setFormErrors({});
    setFormOpen(true);
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof CustomerFormState, string>> = {};
    if (!editRecord && !form.principalId.trim())
      errs.principalId = "Principal ID is required";
    if (!form.name.trim()) errs.name = "Name is required";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Invalid email format";

    if (!editRecord && form.principalId.trim()) {
      try {
        Principal.fromText(form.principalId.trim());
      } catch {
        errs.principalId = "Invalid Principal ID format";
      }
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    const profile = formToProfile(form);

    try {
      if (editRecord) {
        await updateUser.mutateAsync({ user: editRecord.principal, profile });
        toast.success("Customer updated successfully");
      } else {
        const principal = Principal.fromText(form.principalId.trim());
        await createUser.mutateAsync({ user: principal, profile });
        toast.success("Customer added successfully");
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save customer",
      );
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteUser.mutateAsync(deleteTarget.principal);
      toast.success("Customer deleted");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete customer",
      );
    } finally {
      setDeleteTarget(null);
    }
  }

  const isPending = createUser.isPending || updateUser.isPending;

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
            Customers
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage all registered customers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-primary/10 text-primary rounded-lg px-4 py-2">
            <Users className="h-4 w-4" />
            <span className="font-semibold text-sm">
              {users?.length ?? 0} total
            </span>
          </div>
          <Button
            onClick={openAdd}
            className="gap-2"
            data-ocid="admin.customers.add_button"
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </motion.div>

      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mb-4"
      >
        <Input
          placeholder="Search by name, email, phone or principal…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
          data-ocid="admin.customers.search_input"
        />
      </motion.div>

      {/* Table */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
            data-ocid="admin.customers.loading_state"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <Skeleton key={n} className="h-14 w-full rounded-lg" />
            ))}
          </motion.div>
        ) : filteredUsers.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20 text-muted-foreground"
            data-ocid="admin.customers.empty_state"
          >
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-lg font-semibold text-foreground">
              {search ? "No customers match your search" : "No customers yet"}
            </p>
            <p className="text-sm mt-1">
              {search
                ? "Try a different search term"
                : "Add a customer to get started"}
            </p>
            {!search && (
              <Button
                onClick={openAdd}
                className="mt-4 gap-2"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
                Add First Customer
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-xl border border-border overflow-hidden shadow-xs"
            data-ocid="admin.customers.table"
          >
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  {[
                    "#",
                    "Name",
                    "Email",
                    "Mobile",
                    "Age",
                    "Gender",
                    "Actions",
                  ].map((h) => (
                    <TableHead
                      key={h}
                      className="font-semibold text-xs uppercase tracking-wide text-muted-foreground"
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((record, i) => {
                  const { profile: p } = record;
                  return (
                    <TableRow
                      key={record.principal.toString()}
                      className="hover:bg-muted/20 transition-colors"
                      data-ocid={`admin.customers.row.${i + 1}`}
                    >
                      <TableCell className="text-sm text-muted-foreground font-medium w-10">
                        {i + 1}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        <div>
                          <p className="text-sm font-semibold">{p.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {truncatePrincipal(record.principal.toString())}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {p.email ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.mobileNumber ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.age ? `${Number(p.age)}` : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground capitalize">
                        {p.gender ?? "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => setViewRecord(record)}
                            data-ocid={`admin.customers.view_button.${i + 1}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => openEdit(record)}
                            data-ocid={`admin.customers.edit_button.${i + 1}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget(record)}
                            data-ocid={`admin.customers.delete_button.${i + 1}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent
          className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          data-ocid="admin.customers.form.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editRecord ? "Edit Customer" : "Add New Customer"}
            </DialogTitle>
            <DialogDescription>
              {editRecord
                ? "Update the customer's profile details."
                : "Fill in the details to create a new customer profile."}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 overflow-auto pr-1">
            <CustomerForm
              form={form}
              onChange={setForm}
              isEditing={!!editRecord}
              errors={formErrors}
            />
          </ScrollArea>

          <DialogFooter className="pt-4 border-t border-border mt-2">
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              data-ocid="admin.customers.form.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              data-ocid="admin.customers.form.submit_button"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isPending
                ? editRecord
                  ? "Saving…"
                  : "Adding…"
                : editRecord
                  ? "Save Changes"
                  : "Add Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="admin.customers.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{deleteTarget?.profile.name}</strong> and all their data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteTarget(null)}
              data-ocid="admin.customers.delete.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteUser.isPending}
              data-ocid="admin.customers.delete.confirm_button"
            >
              {deleteUser.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {deleteUser.isPending ? "Deleting…" : "Delete Customer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Sheet */}
      {viewRecord && (
        <ViewSheet
          record={viewRecord}
          orders={orders}
          subscriptions={subscriptions}
          open={!!viewRecord}
          onClose={() => setViewRecord(null)}
        />
      )}
    </div>
  );
}
