import type { UserProfile } from "@/backend";
import { OrderStatus } from "@/backend";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useMyOrders, useMyProfile, useSaveProfile } from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Calendar,
  Clock,
  Flame,
  Leaf,
  Loader2,
  LogIn,
  Mail,
  MapPin,
  Phone,
  Ruler,
  ShoppingBag,
  TrendingUp,
  User,
  Utensils,
  Weight,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ORDER_STATUS_BADGE: Record<string, { label: string; className: string }> =
  {
    [OrderStatus.pending]: {
      label: "Pending",
      className: "bg-amber-50 border-amber-200 text-amber-700",
    },
    [OrderStatus.confirmed]: {
      label: "Confirmed",
      className: "bg-blue-50 border-blue-200 text-blue-700",
    },
    [OrderStatus.preparing]: {
      label: "Preparing",
      className: "bg-orange-50 border-orange-200 text-orange-700",
    },
    [OrderStatus.outForDelivery]: {
      label: "Out for Delivery",
      className: "bg-violet-50 border-violet-200 text-violet-700",
    },
    [OrderStatus.delivered]: {
      label: "Delivered",
      className: "bg-emerald-50 border-emerald-200 text-emerald-700",
    },
    [OrderStatus.cancelled]: {
      label: "Cancelled",
      className: "bg-red-50 border-red-200 text-red-700",
    },
  };

interface BMIInfo {
  value: number;
  label: string;
  color: string;
  bg: string;
  description: string;
  range: number;
}

function computeBMI(weight: number, heightCm: number): number | null {
  if (!weight || !heightCm || heightCm <= 0) return null;
  const hm = heightCm / 100;
  return weight / (hm * hm);
}

function getBMIInfo(bmi: number): BMIInfo {
  if (bmi < 18.5)
    return {
      value: bmi,
      label: "Underweight",
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-200",
      description:
        "Consider increasing your caloric intake with nutrient-rich foods.",
      range: (bmi / 18.5) * 25,
    };
  if (bmi < 25)
    return {
      value: bmi,
      label: "Normal",
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-200",
      description: "Great! You're in a healthy weight range. Keep it up!",
      range: ((bmi - 18.5) / 6.5) * 50 + 25,
    };
  if (bmi < 30)
    return {
      value: bmi,
      label: "Overweight",
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
      description:
        "Regular exercise and a balanced diet can help reach a healthy weight.",
      range: ((bmi - 25) / 5) * 25 + 75,
    };
  return {
    value: bmi,
    label: "Obese",
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    description: "Consult a healthcare professional for personalized guidance.",
    range: 100,
  };
}

function BMICard({ bmi }: { bmi: number }) {
  const info = getBMIInfo(bmi);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl border p-6 ${info.bg}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Your BMI</p>
          <div className={`font-display text-5xl font-bold ${info.color} mt-1`}>
            {bmi.toFixed(1)}
          </div>
        </div>
        <Badge
          className={`${info.bg} ${info.color} border font-semibold text-sm`}
        >
          {info.label}
        </Badge>
      </div>

      {/* BMI Bar */}
      <div className="mb-4">
        <div className="relative h-3 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 via-emerald-400 via-amber-400 to-red-400">
          <motion.div
            initial={{ left: "0%" }}
            animate={{ left: `${Math.min(info.range, 98)}%` }}
            transition={{
              duration: 1,
              delay: 0.3,
              type: "spring",
              bounce: 0.3,
            }}
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-gray-400 shadow -ml-2"
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
          <span>Underweight</span>
          <span>Normal</span>
          <span>Overweight</span>
          <span>Obese</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{info.description}</p>
    </motion.div>
  );
}

function CaloriesCard({ dailyCalories }: { dailyCalories: bigint }) {
  const cals = Number(dailyCalories);
  const perMeal = Math.round(cals / 4);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border p-6 bg-emerald-50 border-emerald-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-muted-foreground font-medium">
            Daily Calorie Target
          </p>
          <div className="font-display text-4xl font-bold text-emerald-600 mt-1">
            {cals.toLocaleString("en-IN")}
            <span className="text-lg font-normal ml-1">kcal</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
          <Flame className="h-5 w-5 text-emerald-600" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 mt-4">
        {["Breakfast", "Lunch", "Snack", "Dinner"].map((meal) => (
          <div
            key={meal}
            className="rounded-lg bg-emerald-100/70 px-2 py-2 text-center"
          >
            <div className="flex items-center justify-center mb-1">
              <Utensils className="h-3 w-3 text-emerald-600" />
            </div>
            <p className="text-[10px] text-emerald-700 font-medium">{meal}</p>
            <p className="text-xs font-bold text-emerald-800">{perMeal} kcal</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function ProfilePage() {
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: existingProfile, isLoading: profileLoading } = useMyProfile();
  const saveProfile = useSaveProfile();
  const { data: orders, isLoading: ordersLoading } = useMyOrders();

  const [form, setForm] = useState({
    name: "",
    mobileNumber: "",
    email: "",
    address: "",
    age: "",
    weight: "",
    height: "",
    gender: "",
    dietaryPreferences: "",
    dietaryRestrictions: "",
  });

  const [liveBMI, setLiveBMI] = useState<number | null>(null);

  // Populate from existing profile
  useEffect(() => {
    if (existingProfile) {
      const p = existingProfile;
      setForm({
        name: p.name ?? "",
        mobileNumber: p.mobileNumber ?? "",
        email: p.email ?? "",
        address: p.address ?? "",
        age: p.age?.toString() ?? "",
        weight: p.weight?.toString() ?? "",
        height: p.height?.toString() ?? "",
        gender: p.gender ?? "",
        dietaryPreferences: p.dietaryPreferences ?? "",
        dietaryRestrictions: p.dietaryRestrictions ?? "",
      });
    }
  }, [existingProfile]);

  // Live BMI calculation
  useEffect(() => {
    const w = Number(form.weight) || 0;
    const h = Number(form.height) || 0;
    if (w > 0 && h > 0) {
      setLiveBMI(computeBMI(w, h));
    } else {
      setLiveBMI(null);
    }
  }, [form.weight, form.height]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!form.mobileNumber.trim()) {
      toast.error("Mobile number is required");
      return;
    }
    if (form.mobileNumber.trim().length < 10) {
      toast.error("Please enter a valid mobile number");
      return;
    }

    // Safe numeric conversions
    const w = Number(form.weight) || undefined;
    const h = Number(form.height) || undefined;
    const ageNum = Number(form.age) || undefined;

    // BMI calculation — only if both height and weight are valid
    const bmi = w && h ? w / (h / 100) ** 2 : undefined;

    // Ideal weight using BMI 22 target
    const idealWeight = h ? 22 * (h / 100) ** 2 : undefined;

    // Daily calories based on BMI category
    let dailyCalories: bigint | undefined = undefined;
    if (bmi !== undefined) {
      let cals: number;
      if (bmi < 18.5)
        cals = 2200; // Underweight — higher calories
      else if (bmi < 25)
        cals = 2000; // Normal
      else if (bmi < 30)
        cals = 1800; // Overweight
      else cals = 1500; // Obese
      dailyCalories = BigInt(cals);
    }

    const profile: UserProfile = {
      name: form.name.trim(),
      mobileNumber: form.mobileNumber.trim(),
      email: form.email.trim() || undefined,
      address: form.address.trim() || undefined,
      age: ageNum !== undefined ? BigInt(Math.round(ageNum)) : undefined,
      weight: w,
      height: h,
      bmi,
      idealWeight,
      dailyCalories,
      gender: form.gender || undefined,
      dietaryPreferences: form.dietaryPreferences.trim() || undefined,
      dietaryRestrictions: form.dietaryRestrictions.trim() || undefined,
    };

    try {
      await saveProfile.mutateAsync(profile);
      toast.success("Profile updated successfully");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("name")) toast.error("Please enter your name");
      else if (msg.includes("mobile") || msg.includes("phone"))
        toast.error("Invalid mobile number");
      else if (msg.includes("Unauthorized")) toast.error("Please log in again");
      else
        toast.error(
          "Failed to save profile. Please check your details and try again.",
        );
    }
  };

  if (!isAuthenticated && !isInitializing) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card className="text-center border-border shadow-md">
            <CardContent className="pt-10 pb-8 px-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                Sign in to continue
              </h2>
              <p className="text-muted-foreground mb-8 text-sm">
                Create your health profile, track your BMI, and manage your
                orders with a secure account.
              </p>
              <Button
                onClick={login}
                disabled={isLoggingIn}
                className="w-full bg-primary hover:bg-primary/90 gap-2"
                data-ocid="nav.login_button"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Login to continue
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-10">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Badge
            variant="outline"
            className="mb-3 border-primary/30 text-primary"
          >
            Health profile
          </Badge>
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">
            Your Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your profile, delivery address, and view your order history
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* BMI Card */}
          {liveBMI && <BMICard bmi={liveBMI} />}

          {/* Daily Calories Card — shown after profile is saved */}
          {existingProfile?.dailyCalories && (
            <CaloriesCard dailyCalories={existingProfile.dailyCalories} />
          )}

          {/* Order History */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Order History
              </CardTitle>
              <CardDescription>Your most recent orders</CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div
                  className="space-y-3"
                  data-ocid="profile.orders.loading_state"
                >
                  {[1, 2].map((n) => (
                    <div
                      key={n}
                      className="flex items-center justify-between p-4 rounded-xl border border-border"
                    >
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-6 w-20 rounded-full ml-4" />
                    </div>
                  ))}
                </div>
              ) : !orders || orders.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-10 gap-3 text-center"
                  data-ocid="profile.orders.empty_state"
                >
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      No orders placed yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Browse the menu and place your first order!
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline" className="gap-2">
                    <Link to="/menu">
                      <Leaf className="h-4 w-4" />
                      Browse Menu
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3" data-ocid="profile.orders.list">
                  {orders.slice(0, 5).map((order, i) => {
                    const statusMeta =
                      ORDER_STATUS_BADGE[order.status as string] ??
                      ORDER_STATUS_BADGE[OrderStatus.pending];
                    const itemCount = order.items.reduce(
                      (s, item) => s + Number(item.quantity),
                      0,
                    );
                    const orderDate = new Date(
                      Number(order.createdAt / BigInt(1_000_000)),
                    ).toLocaleDateString("en-IN");

                    return (
                      <div
                        key={order.id.toString()}
                        className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors"
                        data-ocid={`profile.orders.item.${i + 1}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Clock className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">
                              Order #{order.id.toString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {orderDate} · {itemCount} item
                              {itemCount !== 1 ? "s" : ""} ·{" "}
                              <span className="font-medium text-foreground">
                                ₹
                                {Number(order.totalAmount || 0).toLocaleString(
                                  "en-IN",
                                )}
                              </span>
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={`${statusMeta.className} border text-xs font-medium flex-shrink-0 ml-3`}
                        >
                          {statusMeta.label}
                        </Badge>
                      </div>
                    );
                  })}
                  <div className="pt-2">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full gap-2"
                      data-ocid="profile.orders.primary_button"
                    >
                      <Link to="/orders">
                        View All Orders
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Fill in your details to calculate your BMI and track health
                goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <div className="space-y-4">
                  {[
                    "name",
                    "mobile",
                    "email",
                    "address",
                    "age",
                    "weight",
                    "height",
                    "gender",
                    "prefs",
                    "restrictions",
                  ].map((field) => (
                    <div key={field} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <User className="h-3.5 w-3.5 text-primary" />
                      Full Name{" "}
                      <span className="text-destructive text-xs">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Rahul Sharma"
                      className="border-border"
                      data-ocid="profile.name_input"
                    />
                  </div>

                  {/* Mobile & Email */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="mobileNumber"
                        className="flex items-center gap-2 text-sm font-medium"
                      >
                        <Phone className="h-3.5 w-3.5 text-primary" />
                        Mobile Number{" "}
                        <span className="text-destructive text-xs">*</span>
                      </Label>
                      <Input
                        id="mobileNumber"
                        name="mobileNumber"
                        type="tel"
                        value={form.mobileNumber}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="border-border"
                        data-ocid="profile.mobile_number_input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="flex items-center gap-2 text-sm font-medium"
                      >
                        <Mail className="h-3.5 w-3.5 text-primary" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="rahul@example.com"
                        className="border-border"
                        data-ocid="profile.email_input"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="address"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      Delivery Address
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="House 12, Street 4, Green Park, New Delhi"
                      className="border-border"
                      data-ocid="profile.address_input"
                    />
                  </div>

                  {/* Age & Gender */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="age"
                        className="flex items-center gap-2 text-sm font-medium"
                      >
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        Age (years)
                      </Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        min="1"
                        max="120"
                        value={form.age}
                        onChange={handleChange}
                        placeholder="28"
                        className="border-border"
                        data-ocid="profile.age_input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="gender"
                        className="flex items-center gap-2 text-sm font-medium"
                      >
                        <User className="h-3.5 w-3.5 text-primary" />
                        Gender
                      </Label>
                      <Select
                        value={form.gender}
                        onValueChange={(v) =>
                          setForm((prev) => ({ ...prev, gender: v }))
                        }
                      >
                        <SelectTrigger
                          id="gender"
                          className="border-border"
                          data-ocid="profile.gender_select"
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

                  {/* Weight & Height in a grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="weight"
                        className="flex items-center gap-2 text-sm font-medium"
                      >
                        <Weight className="h-3.5 w-3.5 text-primary" />
                        Weight (kg)
                      </Label>
                      <Input
                        id="weight"
                        name="weight"
                        type="number"
                        min="1"
                        max="300"
                        step="0.1"
                        value={form.weight}
                        onChange={handleChange}
                        placeholder="65"
                        className="border-border"
                        data-ocid="profile.weight_input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="height"
                        className="flex items-center gap-2 text-sm font-medium"
                      >
                        <Ruler className="h-3.5 w-3.5 text-primary" />
                        Height (cm)
                      </Label>
                      <Input
                        id="height"
                        name="height"
                        type="number"
                        min="50"
                        max="250"
                        value={form.height}
                        onChange={handleChange}
                        placeholder="170"
                        className="border-border"
                        data-ocid="profile.height_input"
                      />
                    </div>
                  </div>

                  {/* Dietary Preferences */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="dietaryPreferences"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <Leaf className="h-3.5 w-3.5 text-primary" />
                      Dietary Preferences
                      <span className="text-xs text-muted-foreground font-normal">
                        (comma-separated)
                      </span>
                    </Label>
                    <Textarea
                      id="dietaryPreferences"
                      name="dietaryPreferences"
                      value={form.dietaryPreferences}
                      onChange={handleChange}
                      placeholder="e.g. vegetarian, low-carb, high-protein"
                      className="border-border resize-none text-sm"
                      rows={2}
                      data-ocid="profile.dietary_preferences_textarea"
                    />
                  </div>

                  {/* Dietary Restrictions */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="dietaryRestrictions"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <Activity className="h-3.5 w-3.5 text-primary" />
                      Dietary Restrictions / Allergies
                      <span className="text-xs text-muted-foreground font-normal">
                        (comma-separated)
                      </span>
                    </Label>
                    <Textarea
                      id="dietaryRestrictions"
                      name="dietaryRestrictions"
                      value={form.dietaryRestrictions}
                      onChange={handleChange}
                      placeholder="e.g. gluten-free, no nuts, dairy-free"
                      className="border-border resize-none text-sm"
                      rows={2}
                      data-ocid="profile.dietary_restrictions_textarea"
                    />
                  </div>

                  {liveBMI && (
                    <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex items-center gap-3">
                      <Activity className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Calculated BMI:{" "}
                          <span className="text-primary">
                            {liveBMI.toFixed(1)}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getBMIInfo(liveBMI).label} —{" "}
                          {getBMIInfo(liveBMI).description}
                        </p>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 gap-2"
                    disabled={saveProfile.isPending}
                    data-ocid="profile.submit_button"
                  >
                    {saveProfile.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Activity className="h-4 w-4" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
