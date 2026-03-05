import type { OrderItem } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/context/CartContext";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useAppSettings,
  useApplyCoupon,
  useMyProfile,
  usePlaceOrder,
} from "@/hooks/useQueries";
import { useNavigate } from "@tanstack/react-router";
import {
  Banknote,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Edit2,
  Loader2,
  MapPin,
  Plus,
  QrCode,
  ShoppingBag,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";

// ─── Address type ─────────────────────────────────────────────────────────────

interface SavedAddress {
  id: string;
  label: "Home" | "Office" | "Other";
  fullName: string;
  mobile: string;
  house: string;
  street: string;
  landmark?: string;
  city: string;
  pincode: string;
}

const EMPTY_ADDRESS: Omit<SavedAddress, "id"> = {
  label: "Home",
  fullName: "",
  mobile: "",
  house: "",
  street: "",
  landmark: "",
  city: "",
  pincode: "",
};

function getStorageKey(principal: string) {
  return `sk_addresses_${principal}`;
}

function loadAddresses(principal: string): SavedAddress[] {
  try {
    const raw = localStorage.getItem(getStorageKey(principal));
    if (!raw) return [];
    return JSON.parse(raw) as SavedAddress[];
  } catch {
    return [];
  }
}

function saveAddresses(principal: string, addresses: SavedAddress[]) {
  localStorage.setItem(getStorageKey(principal), JSON.stringify(addresses));
}

// ─── Payment method type ──────────────────────────────────────────────────────

type PaymentMethod = "cod" | "upi" | "online";

// ─── Address form ─────────────────────────────────────────────────────────────

interface AddressFormProps {
  initial?: Partial<SavedAddress>;
  onSave: (addr: Omit<SavedAddress, "id">) => void;
  onCancel: () => void;
}

function AddressForm({ initial, onSave, onCancel }: AddressFormProps) {
  const [form, setForm] = useState<Omit<SavedAddress, "id">>({
    ...EMPTY_ADDRESS,
    ...initial,
  });
  const uid = useId();

  function handleChange(field: keyof Omit<SavedAddress, "id">, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!form.mobile.trim() || form.mobile.trim().length < 10) {
      toast.error("Please enter a valid mobile number");
      return;
    }
    if (!form.house.trim()) {
      toast.error("House / Flat number is required");
      return;
    }
    if (!form.street.trim()) {
      toast.error("Street / Area is required");
      return;
    }
    if (!form.city.trim()) {
      toast.error("City is required");
      return;
    }
    if (!form.pincode.trim()) {
      toast.error("Pincode is required");
      return;
    }
    onSave(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Label */}
      <div className="flex gap-2">
        {(["Home", "Office", "Other"] as const).map((lbl) => (
          <button
            key={lbl}
            type="button"
            onClick={() => handleChange("label", lbl)}
            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
              form.label === lbl
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50"
            }`}
            data-ocid="checkout.address-label.button"
          >
            {lbl}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor={`${uid}-name`} className="text-sm">
            Full Name *
          </Label>
          <Input
            id={`${uid}-name`}
            value={form.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            placeholder="Enter full name"
            data-ocid="checkout.address-name.input"
            autoComplete="name"
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor={`${uid}-mobile`} className="text-sm">
            Mobile Number *
          </Label>
          <Input
            id={`${uid}-mobile`}
            type="tel"
            value={form.mobile}
            onChange={(e) => handleChange("mobile", e.target.value)}
            placeholder="10-digit mobile number"
            data-ocid="checkout.address-mobile.input"
            autoComplete="tel"
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor={`${uid}-house`} className="text-sm">
            House / Flat / Building *
          </Label>
          <Input
            id={`${uid}-house`}
            value={form.house}
            onChange={(e) => handleChange("house", e.target.value)}
            placeholder="Flat no., Building name"
            data-ocid="checkout.address-house.input"
            autoComplete="address-line1"
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor={`${uid}-street`} className="text-sm">
            Street / Area *
          </Label>
          <Input
            id={`${uid}-street`}
            value={form.street}
            onChange={(e) => handleChange("street", e.target.value)}
            placeholder="Street, locality, area"
            data-ocid="checkout.address-street.input"
            autoComplete="address-line2"
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor={`${uid}-landmark`} className="text-sm">
            Landmark{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
          <Input
            id={`${uid}-landmark`}
            value={form.landmark ?? ""}
            onChange={(e) => handleChange("landmark", e.target.value)}
            placeholder="Near school, hospital, etc."
            data-ocid="checkout.address-landmark.input"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${uid}-city`} className="text-sm">
            City *
          </Label>
          <Input
            id={`${uid}-city`}
            value={form.city}
            onChange={(e) => handleChange("city", e.target.value)}
            placeholder="City"
            data-ocid="checkout.address-city.input"
            autoComplete="address-level2"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${uid}-pincode`} className="text-sm">
            Pincode *
          </Label>
          <Input
            id={`${uid}-pincode`}
            value={form.pincode}
            onChange={(e) => handleChange("pincode", e.target.value)}
            placeholder="6-digit pincode"
            data-ocid="checkout.address-pincode.input"
            autoComplete="postal-code"
            maxLength={6}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          data-ocid="checkout.address-form.cancel_button"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-primary hover:bg-primary/90"
          data-ocid="checkout.address-form.save_button"
        >
          Save Address
        </Button>
      </div>
    </form>
  );
}

// ─── Main CheckoutPage ────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total: subtotal, clearCart } = useCart();
  const { identity, login } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? "";
  const isAuthenticated = !!identity;

  // Data hooks
  const { data: appSettings, isLoading: settingsLoading } = useAppSettings();
  const { data: profile } = useMyProfile();
  const placeOrder = usePlaceOrder();
  const applyCouponMutation = useApplyCoupon();

  // Address state
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(
    null,
  );

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string>("");

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  // Notes
  const [notes, setNotes] = useState("");

  // Load addresses from localStorage
  useEffect(() => {
    if (!principalStr) return;
    const stored = loadAddresses(principalStr);

    // If no addresses, pre-fill from profile
    if (stored.length === 0 && profile) {
      const profileAddr: SavedAddress = {
        id: "profile-default",
        label: "Home",
        fullName: profile.name ?? "",
        mobile: profile.mobileNumber ?? "",
        house: "",
        street: profile.address ?? "",
        city: "",
        pincode: "",
      };
      if (profile.address) {
        setAddresses([profileAddr]);
        setSelectedAddressId("profile-default");
      }
    } else {
      setAddresses(stored);
      if (stored.length > 0) {
        setSelectedAddressId(stored[0].id);
      }
    }
  }, [principalStr, profile]);

  // Persist addresses to localStorage whenever they change
  useEffect(() => {
    if (!principalStr || addresses.length === 0) return;
    saveAddresses(principalStr, addresses);
  }, [addresses, principalStr]);

  // ── Derived calculations ──────────────────────────────────────────────────

  const deliveryCharge =
    appSettings?.freeDeliveryAbove && subtotal >= appSettings.freeDeliveryAbove
      ? 0
      : (appSettings?.deliveryCharge ?? 0);

  const taxAmount = appSettings?.taxEnabled
    ? Math.round(subtotal * (appSettings.taxPercentage / 100) * 100) / 100
    : 0;

  const finalTotal = subtotal + deliveryCharge + taxAmount - appliedDiscount;

  // ── Selected address ──────────────────────────────────────────────────────

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  // ── Pincode validation ────────────────────────────────────────────────────

  function isPincodeValid(pincode: string): boolean {
    if (!appSettings?.servicePincodes?.length) return true;
    return appSettings.servicePincodes.includes(pincode);
  }

  // ── Address management ────────────────────────────────────────────────────

  function handleSaveAddress(addrData: Omit<SavedAddress, "id">) {
    if (editingAddress) {
      const updated = addresses.map((a) =>
        a.id === editingAddress.id ? { ...addrData, id: editingAddress.id } : a,
      );
      setAddresses(updated);
      saveAddresses(principalStr, updated);
    } else {
      const newAddr: SavedAddress = {
        ...addrData,
        id: `addr-${Date.now()}`,
      };
      const updated = [...addresses, newAddr];
      setAddresses(updated);
      saveAddresses(principalStr, updated);
      setSelectedAddressId(newAddr.id);
    }
    setShowAddressDialog(false);
    setEditingAddress(null);
  }

  function handleDeleteAddress(id: string) {
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    saveAddresses(principalStr, updated);
    if (selectedAddressId === id) {
      setSelectedAddressId(updated.length > 0 ? updated[0].id : null);
    }
  }

  function openEditAddress(addr: SavedAddress) {
    setEditingAddress(addr);
    setShowAddressDialog(true);
  }

  function openAddAddress() {
    setEditingAddress(null);
    setShowAddressDialog(true);
  }

  // ── Coupon ────────────────────────────────────────────────────────────────

  async function handleApplyCoupon() {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    try {
      const discount = await applyCouponMutation.mutateAsync(
        couponCode.trim().toUpperCase(),
      );
      setAppliedDiscount(discount);
      setAppliedCouponCode(couponCode.trim().toUpperCase());
      toast.success(
        `Coupon applied! You save ₹${discount.toLocaleString("en-IN")}`,
      );
    } catch {
      toast.error("Invalid or expired coupon code");
    }
  }

  function handleRemoveCoupon() {
    setAppliedDiscount(0);
    setAppliedCouponCode("");
    setCouponCode("");
  }

  // ── Place order ───────────────────────────────────────────────────────────

  async function handlePlaceOrder() {
    if (!isAuthenticated) {
      login();
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!selectedAddress) {
      toast.error("Please select or add a delivery address");
      return;
    }

    if (!isPincodeValid(selectedAddress.pincode)) {
      toast.error(
        "Delivery not available in this area. Please use a serviceable pincode.",
      );
      return;
    }

    if (selectedAddress.pincode && !isPincodeValid(selectedAddress.pincode)) {
      toast.error("Delivery not available in this area");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    const orderItems: OrderItem[] = items.map((item) => ({
      menuItemId: item.menuItemId,
      quantity: BigInt(item.quantity),
      unitPrice: Number(item.unitPrice) || 0,
    }));

    const addressNote = JSON.stringify({
      deliveryAddress: {
        fullName: selectedAddress.fullName,
        mobile: selectedAddress.mobile,
        house: selectedAddress.house,
        street: selectedAddress.street,
        landmark: selectedAddress.landmark,
        city: selectedAddress.city,
        pincode: selectedAddress.pincode,
      },
      paymentMethod,
      couponCode: appliedCouponCode || null,
      notes: notes.trim() || null,
    });

    try {
      const orderId = await placeOrder.mutateAsync({
        items: orderItems,
        totalAmount: Math.max(0, finalTotal),
        notes: addressNote,
      });
      clearCart();
      void navigate({
        to: "/order-confirmation",
        search: { orderId: orderId.toString() },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("Cart is empty")) {
        toast.error("Cart is empty. Add items before placing an order.");
      } else if (message.includes("Insufficient stock")) {
        toast.error("Some items are out of stock. Please update your cart.");
      } else if (message.includes("Unauthorized")) {
        toast.error("Please log in to place an order.");
      } else {
        toast.error("Failed to place order. Please try again.");
        console.error("Order error:", message);
      }
    }
  }

  // ── Not authenticated ─────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background py-10">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Login Required
          </h1>
          <p className="text-muted-foreground mb-6">
            Please log in to proceed to checkout.
          </p>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => login()}
            data-ocid="checkout.login.primary_button"
          >
            Login to Continue
          </Button>
        </div>
      </main>
    );
  }

  // ── Empty cart ────────────────────────────────────────────────────────────

  if (items.length === 0 && !placeOrder.isPending) {
    return (
      <main className="min-h-screen bg-background py-10">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Your cart is empty
          </h1>
          <p className="text-muted-foreground mb-6">
            Add some fresh salads to your cart before checking out.
          </p>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => void navigate({ to: "/menu" })}
            data-ocid="checkout.empty.primary_button"
          >
            Browse Menu
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-background pb-32"
      data-ocid="checkout.page"
    >
      {/* Header */}
      <div className="border-b border-border bg-white sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => void navigate({ to: "/menu" })}
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="checkout.back.button"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
          </button>
          <h1 className="font-display text-xl font-bold text-foreground">
            Checkout
          </h1>
          <Badge
            variant="secondary"
            className="ml-auto text-xs bg-primary/10 text-primary"
          >
            {items.length} item{items.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* ── Left column ── */}
        <div className="space-y-5">
          {/* ── STEP 1: Delivery Address ────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card
              className="border-border shadow-sm"
              data-ocid="checkout.address.card"
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between font-display text-base">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Delivery Address
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openAddAddress}
                    className="gap-1.5 text-xs h-8 border-border"
                    data-ocid="checkout.add-address.button"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add New
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {addresses.length === 0 ? (
                  <div
                    className="text-center py-8 rounded-xl border border-dashed border-border bg-muted/20"
                    data-ocid="checkout.addresses.empty_state"
                  >
                    <MapPin className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm font-medium text-muted-foreground">
                      No saved addresses
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Add a delivery address to continue
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 gap-1.5"
                      onClick={openAddAddress}
                      data-ocid="checkout.add-first-address.button"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Address
                    </Button>
                  </div>
                ) : (
                  <RadioGroup
                    value={selectedAddressId ?? ""}
                    onValueChange={setSelectedAddressId}
                    className="space-y-3"
                    data-ocid="checkout.addresses.list"
                  >
                    <AnimatePresence>
                      {addresses.map((addr, i) => {
                        const pincodeValid = isPincodeValid(addr.pincode);
                        return (
                          <motion.div
                            key={addr.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ delay: i * 0.04 }}
                          >
                            <label
                              htmlFor={`addr-${addr.id}`}
                              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                                selectedAddressId === addr.id
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/40 hover:bg-muted/20"
                              } ${!pincodeValid ? "opacity-60" : ""}`}
                              data-ocid={`checkout.address.item.${i + 1}`}
                            >
                              <RadioGroupItem
                                value={addr.id}
                                id={`addr-${addr.id}`}
                                className="mt-0.5"
                                data-ocid={`checkout.address.radio.${i + 1}`}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                    {addr.label}
                                  </span>
                                  <span className="text-sm font-medium text-foreground truncate">
                                    {addr.fullName}
                                  </span>
                                  {!pincodeValid && addr.pincode && (
                                    <Badge
                                      variant="destructive"
                                      className="text-xs py-0"
                                    >
                                      Not serviceable
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {addr.house}, {addr.street}
                                  {addr.landmark ? `, ${addr.landmark}` : ""},{" "}
                                  {addr.city} — {addr.pincode}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  📞 {addr.mobile}
                                </p>
                              </div>
                              <div className="flex gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    openEditAddress(addr);
                                  }}
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                  data-ocid={`checkout.address.edit_button.${i + 1}`}
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleDeleteAddress(addr.id);
                                  }}
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                  data-ocid={`checkout.address.delete_button.${i + 1}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </label>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </RadioGroup>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* ── STEP 5: Coupon ──────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card
              className="border-border shadow-sm"
              data-ocid="checkout.coupon.card"
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 font-display text-base">
                  <Tag className="h-4 w-4 text-primary" />
                  Apply Coupon
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {appliedCouponCode ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-800">
                          {appliedCouponCode} applied
                        </p>
                        <p className="text-xs text-emerald-600">
                          You save ₹{appliedDiscount.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="p-1.5 text-emerald-700 hover:text-destructive transition-colors"
                      data-ocid="checkout.coupon.remove.button"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void handleApplyCoupon();
                        }
                      }}
                      placeholder="Enter coupon code"
                      className="flex-1 uppercase tracking-widest text-sm font-mono"
                      data-ocid="checkout.coupon.input"
                    />
                    <Button
                      variant="outline"
                      onClick={() => void handleApplyCoupon()}
                      disabled={
                        applyCouponMutation.isPending || !couponCode.trim()
                      }
                      className="gap-1.5 border-primary text-primary hover:bg-primary/5"
                      data-ocid="checkout.coupon.apply.button"
                    >
                      {applyCouponMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* ── STEP 6: Payment Method ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card
              className="border-border shadow-sm"
              data-ocid="checkout.payment.card"
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 font-display text-base">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                  className="space-y-3"
                  data-ocid="checkout.payment.list"
                >
                  {/* COD */}
                  <label
                    htmlFor="pay-cod"
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "cod"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-muted/20"
                    }`}
                    data-ocid="checkout.payment.cod.item"
                  >
                    <RadioGroupItem
                      value="cod"
                      id="pay-cod"
                      data-ocid="checkout.payment.cod.radio"
                    />
                    <Banknote className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Cash on Delivery
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Pay when your order arrives
                      </p>
                    </div>
                  </label>

                  {/* UPI */}
                  <div
                    className={`rounded-xl border transition-all ${
                      paymentMethod === "upi"
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <label
                      htmlFor="pay-upi"
                      className="flex items-center gap-3 p-3.5 cursor-pointer"
                      data-ocid="checkout.payment.upi.item"
                    >
                      <RadioGroupItem
                        value="upi"
                        id="pay-upi"
                        data-ocid="checkout.payment.upi.radio"
                      />
                      <QrCode className="h-5 w-5 text-violet-600" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          UPI Payment
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Scan QR code to pay via UPI
                        </p>
                      </div>
                    </label>
                    <AnimatePresence>
                      {paymentMethod === "upi" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3.5 pb-4 flex flex-col items-center gap-3">
                            <Separator />
                            <p className="text-xs text-muted-foreground">
                              Scan the QR code with any UPI app to pay
                            </p>
                            <img
                              src="/assets/generated/upi-qr-placeholder.dim_300x350.png"
                              alt="UPI QR Code for Salad Khatora"
                              className="w-48 h-auto rounded-xl border border-border shadow-sm"
                              data-ocid="checkout.upi.qr.canvas_target"
                            />
                            <div className="bg-muted/40 rounded-lg px-4 py-2 text-center">
                              <p className="text-xs text-muted-foreground">
                                UPI ID
                              </p>
                              <p className="text-sm font-mono font-semibold text-foreground">
                                saladkhatora@upi
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Online Payment (disabled) */}
                  <label
                    htmlFor="pay-online"
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-border opacity-50 cursor-not-allowed"
                    data-ocid="checkout.payment.online.item"
                  >
                    <RadioGroupItem
                      value="online"
                      id="pay-online"
                      disabled
                      data-ocid="checkout.payment.online.radio"
                    />
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        Online Payment
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Cards, Net Banking
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-muted/60 text-muted-foreground"
                    >
                      Coming Soon
                    </Badge>
                  </label>
                </RadioGroup>
              </CardContent>
            </Card>
          </motion.div>

          {/* Special Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border shadow-sm">
              <CardContent className="pt-4 pb-4">
                <label
                  htmlFor="checkout-notes"
                  className="text-sm font-medium text-foreground block mb-2"
                >
                  Special Instructions{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </label>
                <textarea
                  id="checkout-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any dietary needs, delivery instructions, etc."
                  rows={2}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 resize-none bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  data-ocid="checkout.notes.textarea"
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ── Right column: Order Summary ── */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            <Card
              className="border-border shadow-sm"
              data-ocid="checkout.summary.card"
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 font-display text-base">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {/* Items list */}
                <div
                  className="space-y-2.5"
                  data-ocid="checkout.summary.items.list"
                >
                  {items.map((item, i) => (
                    <div
                      key={item.menuItemId.toString()}
                      className="flex items-start justify-between gap-2"
                      data-ocid={`checkout.summary.item.${i + 1}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ₹{item.unitPrice.toLocaleString("en-IN")} ×{" "}
                          {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-foreground shrink-0">
                        ₹
                        {(item.unitPrice * item.quantity).toLocaleString(
                          "en-IN",
                        )}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Price breakdown */}
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground font-medium">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {settingsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Delivery Charge
                        </span>
                        {deliveryCharge === 0 ? (
                          <span className="text-emerald-600 font-semibold text-xs">
                            FREE
                            {appSettings?.freeDeliveryAbove
                              ? ` (above ₹${appSettings.freeDeliveryAbove.toLocaleString("en-IN")})`
                              : ""}
                          </span>
                        ) : (
                          <span className="text-foreground font-medium">
                            ₹{deliveryCharge.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      {appSettings?.taxEnabled && taxAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            GST ({appSettings.taxPercentage}%)
                          </span>
                          <span className="text-foreground font-medium">
                            ₹{taxAmount.toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}

                      {appliedDiscount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-emerald-600 flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            Coupon ({appliedCouponCode})
                          </span>
                          <span className="text-emerald-600 font-semibold">
                            −₹{appliedDiscount.toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  <Separator />

                  {/* Final total */}
                  <div
                    className="flex justify-between items-center py-1"
                    data-ocid="checkout.summary.total.row"
                  >
                    <span className="font-display text-base font-bold text-foreground">
                      Total Payable
                    </span>
                    <span className="font-display text-xl font-bold text-primary">
                      ₹{Math.max(0, finalTotal).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Pincode warning */}
                {selectedAddress?.pincode &&
                  !isPincodeValid(selectedAddress.pincode) && (
                    <div
                      className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 flex items-start gap-2"
                      data-ocid="checkout.pincode.error_state"
                    >
                      <MapPin className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                      <p className="text-xs text-destructive font-medium">
                        Delivery not available in this area. Please select a
                        different address or contact us.
                      </p>
                    </div>
                  )}

                {/* Desktop place order button */}
                <div className="hidden lg:block">
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-5 text-base gap-2 mt-2"
                    onClick={() => void handlePlaceOrder()}
                    disabled={
                      placeOrder.isPending ||
                      items.length === 0 ||
                      (!!selectedAddress?.pincode &&
                        !isPincodeValid(selectedAddress.pincode))
                    }
                    data-ocid="checkout.place-order.primary_button"
                  >
                    {placeOrder.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        Place Order · ₹
                        {Math.max(0, finalTotal).toLocaleString("en-IN")}
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    By placing your order you agree to our terms of service
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* ── Sticky Bottom Bar (mobile + tablet) ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-border shadow-lg px-4 py-3 safe-area-pb">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
            <span>
              {items.length} item{items.length !== 1 ? "s" : ""} · Subtotal ₹
              {subtotal.toLocaleString("en-IN")}
            </span>
            {deliveryCharge === 0 ? (
              <span className="text-emerald-600 font-semibold">
                Free Delivery
              </span>
            ) : (
              <span>Delivery ₹{deliveryCharge.toLocaleString("en-IN")}</span>
            )}
          </div>
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-5 text-base gap-2"
            onClick={() => void handlePlaceOrder()}
            disabled={
              placeOrder.isPending ||
              items.length === 0 ||
              (!!selectedAddress?.pincode &&
                !isPincodeValid(selectedAddress.pincode))
            }
            data-ocid="checkout.place-order-mobile.primary_button"
          >
            {placeOrder.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Placing Order...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Place Order · ₹{Math.max(0, finalTotal).toLocaleString("en-IN")}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Address Dialog ── */}
      <Dialog
        open={showAddressDialog}
        onOpenChange={(open) => {
          setShowAddressDialog(open);
          if (!open) setEditingAddress(null);
        }}
      >
        <DialogContent
          className="max-w-md max-h-[90vh] overflow-y-auto"
          data-ocid="checkout.address.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              {editingAddress ? "Edit Address" : "Add New Address"}
            </DialogTitle>
          </DialogHeader>
          <AddressForm
            initial={editingAddress ?? undefined}
            onSave={handleSaveAddress}
            onCancel={() => {
              setShowAddressDialog(false);
              setEditingAddress(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}
