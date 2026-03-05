import type { UserProfile } from "@/backend";
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
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useMyProfile, useSaveProfile } from "@/hooks/useQueries";
import {
  Activity,
  Calendar,
  Leaf,
  Loader2,
  LogIn,
  Mail,
  Ruler,
  TrendingUp,
  User,
  Weight,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

export default function ProfilePage() {
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: existingProfile, isLoading: profileLoading } = useMyProfile();
  const saveProfile = useSaveProfile();

  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "",
    weight: "",
    height: "",
  });

  const [liveBMI, setLiveBMI] = useState<number | null>(null);

  // Populate from existing profile
  useEffect(() => {
    if (existingProfile) {
      setForm({
        name: existingProfile.name,
        email: existingProfile.email,
        age: existingProfile.age.toString(),
        weight: existingProfile.weight.toString(),
        height: existingProfile.height.toString(),
      });
    }
  }, [existingProfile]);

  // Live BMI calculation
  useEffect(() => {
    const w = Number.parseFloat(form.weight);
    const h = Number.parseFloat(form.height);
    setLiveBMI(computeBMI(w, h));
  }, [form.weight, form.height]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = Number.parseFloat(form.weight);
    const h = Number.parseFloat(form.height);
    const bmi = computeBMI(w, h);

    const profile: UserProfile = {
      name: form.name,
      email: form.email,
      age: BigInt(Math.round(Number.parseFloat(form.age))),
      weight: w,
      height: h,
      bmi: bmi ?? 0,
    };

    try {
      await saveProfile.mutateAsync(profile);
      toast.success("Profile saved successfully! 🌿");
    } catch {
      toast.error("Failed to save profile. Please try again.");
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
            Set up your health metrics to personalize your experience
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* BMI Card */}
          {liveBMI && <BMICard bmi={liveBMI} />}

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
                  {["name", "email", "age", "weight", "height"].map((field) => (
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
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Ahmad Ali Khan"
                      required
                      className="border-border"
                      data-ocid="profile.name_input"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <Mail className="h-3.5 w-3.5 text-primary" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="ahmad@example.com"
                      required
                      className="border-border"
                      data-ocid="profile.email_input"
                    />
                  </div>

                  {/* Age */}
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
                      required
                      className="border-border"
                      data-ocid="profile.age_input"
                    />
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
                        required
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
                        required
                        className="border-border"
                        data-ocid="profile.height_input"
                      />
                    </div>
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
