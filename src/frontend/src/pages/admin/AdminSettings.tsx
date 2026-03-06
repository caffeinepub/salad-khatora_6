import type { AppSettings } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAppSettings, useSaveAppSettings } from "@/hooks/useAdminQueries";
import {
  Building2,
  DollarSign,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Save,
  Settings2,
  Truck,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const DEFAULT_SETTINGS: AppSettings = {
  businessName: "Salad Khatora",
  whatsappNumber: "7660005766",
  taxEnabled: false,
  taxPercentage: 0,
  deliveryCharge: 0,
  freeDeliveryAbove: 0,
  servicePincodes: [],
};

function SettingsSkeleton() {
  return (
    <div className="space-y-6" data-ocid="admin-settings.loading_state">
      {[1, 2, 3, 4].map((n) => (
        <Card key={n} className="border-border">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-9 w-28 ml-auto" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AdminSettings() {
  const { data: settings, isLoading, isError } = useAppSettings();
  const saveSettings = useSaveAppSettings();

  const [general, setGeneral] = useState({
    businessName: DEFAULT_SETTINGS.businessName,
    whatsappNumber: DEFAULT_SETTINGS.whatsappNumber,
    gstNumber: "",
    businessAddress: "",
  });

  const [tax, setTax] = useState({
    taxEnabled: DEFAULT_SETTINGS.taxEnabled,
    taxPercentage: DEFAULT_SETTINGS.taxPercentage.toString(),
  });

  const [delivery, setDelivery] = useState({
    deliveryCharge: DEFAULT_SETTINGS.deliveryCharge.toString(),
    freeDeliveryAbove: DEFAULT_SETTINGS.freeDeliveryAbove.toString(),
  });

  const [pincodes, setPincodes] = useState<string[]>(
    DEFAULT_SETTINGS.servicePincodes,
  );
  const [newPincode, setNewPincode] = useState("");

  // Load business details (gstNumber, businessAddress) from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sk_business_details");
      if (stored) {
        const parsed = JSON.parse(stored) as {
          gstNumber?: string;
          businessAddress?: string;
        };
        setGeneral((prev) => ({
          ...prev,
          gstNumber: parsed.gstNumber ?? "",
          businessAddress: parsed.businessAddress ?? "",
        }));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Populate from loaded settings
  useEffect(() => {
    if (settings) {
      setGeneral((prev) => ({
        ...prev,
        businessName: settings.businessName || DEFAULT_SETTINGS.businessName,
        whatsappNumber:
          settings.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber,
      }));
      setTax({
        taxEnabled: settings.taxEnabled ?? DEFAULT_SETTINGS.taxEnabled,
        taxPercentage: (settings.taxPercentage ?? 0).toString(),
      });
      setDelivery({
        deliveryCharge: (settings.deliveryCharge ?? 0).toString(),
        freeDeliveryAbove: (settings.freeDeliveryAbove ?? 0).toString(),
      });
      setPincodes(settings.servicePincodes ?? []);
    }
  }, [settings]);

  function buildFullSettings(): AppSettings {
    return {
      businessName: general.businessName,
      whatsappNumber: general.whatsappNumber,
      taxEnabled: tax.taxEnabled,
      taxPercentage: Number.parseFloat(tax.taxPercentage) || 0,
      deliveryCharge: Number.parseFloat(delivery.deliveryCharge) || 0,
      freeDeliveryAbove: Number.parseFloat(delivery.freeDeliveryAbove) || 0,
      servicePincodes: pincodes,
    };
  }

  const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  const gstError =
    general.gstNumber.length > 0 && !GST_REGEX.test(general.gstNumber)
      ? "Invalid GST format. Example: 36BZPPK8184L1Z9"
      : "";

  async function handleSaveGeneral() {
    try {
      await saveSettings.mutateAsync(buildFullSettings());
      // Save GST number and business address to localStorage
      localStorage.setItem(
        "sk_business_details",
        JSON.stringify({
          gstNumber: general.gstNumber,
          businessAddress: general.businessAddress,
        }),
      );
      toast.success("General settings saved");
    } catch {
      toast.error("Failed to save general settings");
    }
  }

  async function handleSaveTax() {
    try {
      await saveSettings.mutateAsync(buildFullSettings());
      toast.success("Tax settings saved");
    } catch {
      toast.error("Failed to save tax settings");
    }
  }

  async function handleSaveDelivery() {
    try {
      await saveSettings.mutateAsync(buildFullSettings());
      toast.success("Delivery settings saved");
    } catch {
      toast.error("Failed to save delivery settings");
    }
  }

  async function handleSavePincodes() {
    try {
      await saveSettings.mutateAsync(buildFullSettings());
      toast.success("Service area settings saved");
    } catch {
      toast.error("Failed to save service area settings");
    }
  }

  function handleAddPincode() {
    const trimmed = newPincode.trim();
    if (!trimmed) return;
    if (pincodes.includes(trimmed)) {
      toast.error("Pincode already exists");
      return;
    }
    setPincodes((prev) => [...prev, trimmed]);
    setNewPincode("");
  }

  function handleRemovePincode(pincode: string) {
    setPincodes((prev) => prev.filter((p) => p !== pincode));
  }

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <SettingsSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[400px]">
        <div
          className="text-center bg-white rounded-2xl border border-border p-10 shadow-sm max-w-md"
          data-ocid="admin-settings.error_state"
        >
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-5">
            <Settings2 className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            Failed to load settings
          </h2>
          <p className="text-muted-foreground text-sm">
            Something went wrong. Please refresh the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings2 className="h-5 w-5 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Settings
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-12">
          Manage your business configuration and preferences
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* ── General Settings ── */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <Building2 className="h-4.5 w-4.5 text-primary h-4 w-4" />
              General Settings
            </CardTitle>
            <CardDescription>
              Basic business information shown to customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-sm font-medium">
                Business Name
              </Label>
              <Input
                id="businessName"
                value={general.businessName}
                onChange={(e) =>
                  setGeneral((prev) => ({
                    ...prev,
                    businessName: e.target.value,
                  }))
                }
                placeholder="Salad Khatora"
                className="border-border"
                data-ocid="admin-settings.business-name.input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsappNumber" className="text-sm font-medium">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  WhatsApp Number
                </span>
              </Label>
              <Input
                id="whatsappNumber"
                value={general.whatsappNumber}
                onChange={(e) =>
                  setGeneral((prev) => ({
                    ...prev,
                    whatsappNumber: e.target.value,
                  }))
                }
                placeholder="7660005766"
                className="border-border"
                data-ocid="admin-settings.whatsapp-number.input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gstNumber" className="text-sm font-medium">
                GST Number
              </Label>
              <Input
                id="gstNumber"
                value={general.gstNumber}
                onChange={(e) =>
                  setGeneral((prev) => ({
                    ...prev,
                    gstNumber: e.target.value.toUpperCase(),
                  }))
                }
                placeholder="36BZPPK8184L1Z9"
                className={`border-border ${gstError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                data-ocid="admin-settings.gst-number.input"
              />
              {gstError && (
                <p className="text-xs text-destructive mt-1">{gstError}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessAddress" className="text-sm font-medium">
                Business Address
              </Label>
              <Textarea
                id="businessAddress"
                value={general.businessAddress}
                onChange={(e) =>
                  setGeneral((prev) => ({
                    ...prev,
                    businessAddress: e.target.value,
                  }))
                }
                placeholder="Plot no 14, Road no 27, Phase 2, Saket Colony, Hyderabad, 500062"
                rows={3}
                className="border-border resize-none"
                data-ocid="admin-settings.business-address.textarea"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSaveGeneral}
                disabled={saveSettings.isPending || !!gstError}
                className="gap-2 bg-primary hover:bg-primary/90"
                data-ocid="admin-settings.general.save_button"
              >
                {saveSettings.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save General
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Tax Settings ── */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <DollarSign className="h-4 w-4 text-primary" />
              Tax Settings
            </CardTitle>
            <CardDescription>
              Configure GST / tax applied to orders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-border p-4 bg-muted/20">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Enable Tax
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Apply GST / tax percentage to all orders
                </p>
              </div>
              <Switch
                checked={tax.taxEnabled}
                onCheckedChange={(checked) =>
                  setTax((prev) => ({ ...prev, taxEnabled: checked }))
                }
                data-ocid="admin-settings.tax-enabled.switch"
              />
            </div>
            {tax.taxEnabled && (
              <div className="space-y-2">
                <Label htmlFor="taxPercentage" className="text-sm font-medium">
                  GST / Tax Percentage (%)
                </Label>
                <Input
                  id="taxPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={tax.taxPercentage}
                  onChange={(e) =>
                    setTax((prev) => ({
                      ...prev,
                      taxPercentage: e.target.value,
                    }))
                  }
                  placeholder="5"
                  className="border-border max-w-xs"
                  data-ocid="admin-settings.tax-percentage.input"
                />
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSaveTax}
                disabled={saveSettings.isPending}
                className="gap-2 bg-primary hover:bg-primary/90"
                data-ocid="admin-settings.tax.save_button"
              >
                {saveSettings.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Tax
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Delivery Settings ── */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <Truck className="h-4 w-4 text-primary" />
              Delivery Settings
            </CardTitle>
            <CardDescription>
              Set delivery charges and free delivery thresholds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryCharge" className="text-sm font-medium">
                  Delivery Charge (₹)
                </Label>
                <Input
                  id="deliveryCharge"
                  type="number"
                  min="0"
                  step="1"
                  value={delivery.deliveryCharge}
                  onChange={(e) =>
                    setDelivery((prev) => ({
                      ...prev,
                      deliveryCharge: e.target.value,
                    }))
                  }
                  placeholder="49"
                  className="border-border"
                  data-ocid="admin-settings.delivery-charge.input"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="freeDeliveryAbove"
                  className="text-sm font-medium"
                >
                  Free Delivery Above (₹)
                </Label>
                <Input
                  id="freeDeliveryAbove"
                  type="number"
                  min="0"
                  step="1"
                  value={delivery.freeDeliveryAbove}
                  onChange={(e) =>
                    setDelivery((prev) => ({
                      ...prev,
                      freeDeliveryAbove: e.target.value,
                    }))
                  }
                  placeholder="500"
                  className="border-border"
                  data-ocid="admin-settings.free-delivery-above.input"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSaveDelivery}
                disabled={saveSettings.isPending}
                className="gap-2 bg-primary hover:bg-primary/90"
                data-ocid="admin-settings.delivery.save_button"
              >
                {saveSettings.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Delivery
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Service Area ── */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <MapPin className="h-4 w-4 text-primary" />
              Service Area Settings
            </CardTitle>
            <CardDescription>
              Define pincodes where orders are accepted. Leave empty to accept
              orders from all areas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add pincode */}
            <div className="flex gap-2">
              <Input
                value={newPincode}
                onChange={(e) => setNewPincode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddPincode();
                  }
                }}
                placeholder="e.g. 400001"
                className="border-border flex-1"
                data-ocid="admin-settings.pincode.input"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddPincode}
                className="gap-1.5 border-border"
                data-ocid="admin-settings.pincode.button"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>

            {/* Pincode list */}
            {pincodes.length === 0 ? (
              <div
                className="text-center py-6 rounded-xl border border-dashed border-border bg-muted/20"
                data-ocid="admin-settings.pincodes.empty_state"
              >
                <MapPin className="h-7 w-7 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No pincodes added. All areas are served.
                </p>
              </div>
            ) : (
              <div
                className="flex flex-wrap gap-2"
                data-ocid="admin-settings.pincodes.list"
              >
                {pincodes.map((pin, i) => (
                  <Badge
                    key={pin}
                    variant="secondary"
                    className="flex items-center gap-1.5 text-sm px-3 py-1.5"
                    data-ocid={`admin-settings.pincodes.item.${i + 1}`}
                  >
                    {pin}
                    <button
                      type="button"
                      onClick={() => handleRemovePincode(pin)}
                      className="hover:text-destructive transition-colors ml-0.5"
                      data-ocid={`admin-settings.pincodes.delete_button.${i + 1}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSavePincodes}
                disabled={saveSettings.isPending}
                className="gap-2 bg-primary hover:bg-primary/90"
                data-ocid="admin-settings.service-area.save_button"
              >
                {saveSettings.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Service Area
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
