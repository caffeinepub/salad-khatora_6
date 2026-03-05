import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Flame,
  Heart,
  Leaf,
  RefreshCw,
  Salad,
  Scale,
  Shield,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Gender = "male" | "female";

type BMICategory = "underweight" | "normal" | "overweight" | "obese";

interface KioskForm {
  height: string;
  weight: string;
  age: string;
  gender: Gender | "";
}

interface FitnessResult {
  bmi: number;
  category: BMICategory;
  calories: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  BMICategory,
  {
    label: string;
    color: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    badgeBg: string;
    motivational: string;
    planName: string;
    planDesc: string;
    salads: string[];
    icon: typeof Activity;
  }
> = {
  underweight: {
    label: "Underweight",
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    badgeBg: "bg-blue-100 text-blue-700",
    motivational:
      "Your body needs more nourishment! Focus on nutrient-rich foods to reach a healthy, energised weight.",
    planName: "Calorie Boost Plan",
    planDesc:
      "High-protein, nutrient-dense salads to help you reach a healthy weight.",
    salads: [
      "Avocado Protein Bowl",
      "Quinoa Power Salad",
      "Chicken & Nuts Bowl",
    ],
    icon: Sparkles,
  },
  normal: {
    label: "Normal Weight",
    color: "bg-emerald-500",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    badgeBg: "bg-emerald-100 text-emerald-700",
    motivational:
      "You're in great shape! Keep up the healthy habits and maintain your ideal balance.",
    planName: "Balance & Maintain Plan",
    planDesc: "Perfectly balanced salads to keep you at your best.",
    salads: ["Mediterranean Greek", "Garden Fresh Bowl", "Rainbow Veggie Mix"],
    icon: Heart,
  },
  overweight: {
    label: "Overweight",
    color: "bg-amber-500",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    badgeBg: "bg-amber-100 text-amber-700",
    motivational:
      "Small consistent changes lead to big results. Fresh, fibrous salads are your best ally.",
    planName: "Lean & Clean Plan",
    planDesc:
      "High-fiber, low-calorie salads to support your weight loss journey.",
    salads: ["Detox Green Bowl", "Cucumber Mint Salad", "Spinach Berry Blast"],
    icon: Flame,
  },
  obese: {
    label: "Obese",
    color: "bg-red-500",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    badgeBg: "bg-red-100 text-red-700",
    motivational:
      "Every great journey starts with a single step. Let today be your fresh start to a healthier you.",
    planName: "Fresh Start Plan",
    planDesc: "Light detox salads to kickstart your health transformation.",
    salads: [
      "Lemon Detox Green",
      "Watermelon Feta Mint",
      "Steamed Veggie Bowl",
    ],
    icon: Activity,
  },
};

// ─── Calculations ─────────────────────────────────────────────────────────────

function getBMICategory(bmi: number): BMICategory {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "normal";
  if (bmi < 30) return "overweight";
  return "obese";
}

function calculateResults(
  height: number,
  weight: number,
  age: number,
  gender: Gender,
): FitnessResult {
  const bmi = weight / ((height / 100) * (height / 100));

  let bmr: number;
  if (gender === "male") {
    bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
  }
  const calories = Math.round(bmr * 1.55);

  return {
    bmi: Math.round(bmi * 10) / 10,
    category: getBMICategory(bmi),
    calories,
  };
}

// ─── BMI Gauge Visual ─────────────────────────────────────────────────────────

function BMIGauge({ bmi, category }: { bmi: number; category: BMICategory }) {
  const config = CATEGORY_CONFIG[category];
  // Map BMI 15–40 to 0–100%
  const pct = Math.min(100, Math.max(0, ((bmi - 15) / 25) * 100));

  return (
    <div className="space-y-3">
      <div className="relative h-4 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 via-emerald-400 via-amber-400 to-red-400">
        <motion.div
          className="absolute top-0 h-full w-1 bg-foreground rounded-full shadow-md"
          initial={{ left: "0%" }}
          animate={{ left: `${pct}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          style={{ transform: "translateX(-50%)" }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground font-medium px-0.5">
        <span>Underweight</span>
        <span>Normal</span>
        <span>Overweight</span>
        <span>Obese</span>
      </div>
      <div className="flex items-center justify-center gap-2">
        <span
          className={`text-4xl font-display font-extrabold ${config.textColor}`}
        >
          {bmi.toFixed(1)}
        </span>
        <Badge
          className={`${config.badgeBg} border-0 text-sm font-semibold px-3 py-1`}
        >
          {config.label}
        </Badge>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function KioskPage() {
  const [form, setForm] = useState<KioskForm>({
    height: "",
    weight: "",
    age: "",
    gender: "",
  });
  const [result, setResult] = useState<FitnessResult | null>(null);
  const [errors, setErrors] = useState<
    Partial<Record<keyof KioskForm, string>>
  >({});

  function validate(): boolean {
    const newErrors: typeof errors = {};
    const h = Number.parseFloat(form.height);
    const w = Number.parseFloat(form.weight);
    const a = Number.parseInt(form.age, 10);

    if (!form.height || Number.isNaN(h) || h < 100 || h > 250)
      newErrors.height = "Enter a valid height (100–250 cm)";
    if (!form.weight || Number.isNaN(w) || w < 20 || w > 300)
      newErrors.weight = "Enter a valid weight (20–300 kg)";
    if (!form.age || Number.isNaN(a) || a < 10 || a > 100)
      newErrors.age = "Enter a valid age (10–100)";
    if (!form.gender) newErrors.gender = "Please select your gender";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleCalculate() {
    if (!validate()) return;
    const r = calculateResults(
      Number.parseFloat(form.height),
      Number.parseFloat(form.weight),
      Number.parseInt(form.age, 10),
      form.gender as Gender,
    );
    setResult(r);
    // Smooth scroll to results
    setTimeout(() => {
      document
        .getElementById("kiosk-results")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  function handleRecalculate() {
    setResult(null);
    setErrors({});
    setForm({ height: "", weight: "", age: "", gender: "" });
    setTimeout(() => {
      document
        .getElementById("kiosk-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  const config = result ? CATEGORY_CONFIG[result.category] : null;

  return (
    <main className="flex flex-col min-h-screen bg-background">
      {/* ── Hero Header ──────────────────────────────────────────────── */}
      <section className="gradient-hero text-white relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-8 -left-16 w-56 h-56 rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto px-6 py-12 md:py-16 text-center">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2.5 mb-6"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white/90 tracking-tight">
              Salad Khatora
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
              <Activity className="h-3.5 w-3.5" />
              Gym Kiosk · Free Health Check
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight mb-4 text-balance">
              Check Your <br />
              <span className="text-green-200">Fitness Score</span>
            </h1>
            <p className="text-white/75 text-xl max-w-md mx-auto leading-relaxed">
              Enter your metrics below to calculate your BMI, daily calorie
              target, and get a personalised salad plan.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Input Form ───────────────────────────────────────────────── */}
      <section
        id="kiosk-form"
        className="container mx-auto px-4 sm:px-6 max-w-2xl py-12"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card className="bg-white rounded-3xl border border-border shadow-lg overflow-hidden">
            <CardContent className="p-8 md:p-10 space-y-7">
              {/* Height */}
              <div className="space-y-2.5">
                <Label
                  htmlFor="kiosk-height"
                  className="text-xl font-semibold text-foreground flex items-center gap-2"
                >
                  <Scale className="h-5 w-5 text-primary" />
                  Height (cm)
                </Label>
                <Input
                  id="kiosk-height"
                  type="number"
                  placeholder="e.g. 170"
                  value={form.height}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, height: e.target.value }))
                  }
                  className="h-16 text-xl px-5 rounded-xl border-2 border-input focus:border-primary transition-colors"
                  inputMode="numeric"
                  data-ocid="kiosk.height_input"
                />
                {errors.height && (
                  <p
                    className="text-sm text-destructive font-medium"
                    data-ocid="kiosk.height_error"
                  >
                    {errors.height}
                  </p>
                )}
              </div>

              {/* Weight */}
              <div className="space-y-2.5">
                <Label
                  htmlFor="kiosk-weight"
                  className="text-xl font-semibold text-foreground flex items-center gap-2"
                >
                  <Activity className="h-5 w-5 text-primary" />
                  Weight (kg)
                </Label>
                <Input
                  id="kiosk-weight"
                  type="number"
                  placeholder="e.g. 65"
                  value={form.weight}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, weight: e.target.value }))
                  }
                  className="h-16 text-xl px-5 rounded-xl border-2 border-input focus:border-primary transition-colors"
                  inputMode="numeric"
                  data-ocid="kiosk.weight_input"
                />
                {errors.weight && (
                  <p
                    className="text-sm text-destructive font-medium"
                    data-ocid="kiosk.weight_error"
                  >
                    {errors.weight}
                  </p>
                )}
              </div>

              {/* Age */}
              <div className="space-y-2.5">
                <Label
                  htmlFor="kiosk-age"
                  className="text-xl font-semibold text-foreground flex items-center gap-2"
                >
                  <Sparkles className="h-5 w-5 text-primary" />
                  Age (years)
                </Label>
                <Input
                  id="kiosk-age"
                  type="number"
                  placeholder="e.g. 28"
                  value={form.age}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, age: e.target.value }))
                  }
                  className="h-16 text-xl px-5 rounded-xl border-2 border-input focus:border-primary transition-colors"
                  inputMode="numeric"
                  data-ocid="kiosk.age_input"
                />
                {errors.age && (
                  <p
                    className="text-sm text-destructive font-medium"
                    data-ocid="kiosk.age_error"
                  >
                    {errors.age}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2.5">
                <Label className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Gender
                </Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, gender: v as Gender }))
                  }
                >
                  <SelectTrigger
                    className="h-16 text-xl px-5 rounded-xl border-2 border-input focus:border-primary"
                    data-ocid="kiosk.gender_select"
                  >
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male" className="text-lg py-3">
                      Male
                    </SelectItem>
                    <SelectItem value="female" className="text-lg py-3">
                      Female
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p
                    className="text-sm text-destructive font-medium"
                    data-ocid="kiosk.gender_error"
                  >
                    {errors.gender}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                onClick={handleCalculate}
                className="w-full h-16 text-xl font-bold rounded-xl bg-primary hover:bg-primary/90 text-white gap-3 shadow-md transition-all active:scale-[0.98]"
                data-ocid="kiosk.calculate_button"
              >
                <Flame className="h-6 w-6" />
                Calculate My Score
                <ArrowRight className="h-6 w-6" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* ── Results Section ───────────────────────────────────────────── */}
      <AnimatePresence>
        {result && config && (
          <section
            id="kiosk-results"
            className="container mx-auto px-4 sm:px-6 max-w-2xl pb-12 space-y-6"
            data-ocid="kiosk.results_panel"
          >
            {/* Results header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 className="font-display text-3xl font-bold text-foreground">
                Your Fitness Results
              </h2>
              <p className="text-muted-foreground mt-2">
                Based on the metrics you entered
              </p>
            </motion.div>

            {/* BMI Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card
                className={`bg-white rounded-2xl border-2 ${config.borderColor} shadow-sm overflow-hidden`}
                data-ocid="kiosk.bmi_card"
              >
                <CardContent className="p-7 space-y-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center`}
                    >
                      <Scale className={`h-6 w-6 ${config.textColor}`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                        Body Mass Index
                      </p>
                      <h3 className="font-display text-xl font-bold text-foreground">
                        Your BMI Score
                      </h3>
                    </div>
                  </div>

                  <BMIGauge bmi={result.bmi} category={result.category} />

                  <div
                    className={`rounded-xl ${config.bgColor} border ${config.borderColor} p-4`}
                  >
                    <p
                      className={`text-sm font-medium ${config.textColor} leading-relaxed`}
                    >
                      {config.motivational}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Calorie Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card
                className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
                data-ocid="kiosk.calorie_card"
              >
                <CardContent className="p-7">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                      <Flame className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                        Daily Calorie Target
                      </p>
                      <h3 className="font-display text-xl font-bold text-foreground">
                        Recommended Intake
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-end gap-3">
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="font-display text-6xl font-extrabold text-primary leading-none"
                    >
                      {result.calories.toLocaleString()}
                    </motion.span>
                    <span className="text-xl text-muted-foreground font-medium pb-2">
                      kcal / day
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mt-3">
                    Calculated using the Harris-Benedict formula (moderately
                    active). Adjust based on your actual activity level.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recommended Plan Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card
                className="bg-white rounded-2xl border-2 border-primary/30 shadow-sm overflow-hidden"
                data-ocid="kiosk.plan_card"
              >
                {/* Green accent top strip */}
                <div className="h-1.5 bg-gradient-to-r from-primary via-emerald-500 to-green-400" />

                <CardContent className="p-7 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Salad className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                        Recommended for You
                      </p>
                      <h3 className="font-display text-2xl font-bold text-primary">
                        {config.planName}
                      </h3>
                    </div>
                  </div>

                  <p className="text-foreground text-base leading-relaxed">
                    {config.planDesc}
                  </p>

                  {/* Salad suggestions */}
                  <div className="space-y-2.5">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Included Salads
                    </p>
                    {config.salads.map((salad, i) => (
                      <div
                        key={salad}
                        className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10"
                        data-ocid={`kiosk.plan_card.item.${i + 1}`}
                      >
                        <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                          <Leaf className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">
                          {salad}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Button
                    asChild
                    className="w-full h-16 text-xl font-bold rounded-xl bg-primary hover:bg-primary/90 text-white gap-3 shadow-md transition-all active:scale-[0.98]"
                    data-ocid="kiosk.start_plan_button"
                  >
                    <Link to="/subscriptions">
                      <Sparkles className="h-6 w-6" />
                      Start 7 Day Salad Plan
                      <ArrowRight className="h-6 w-6" />
                    </Link>
                  </Button>

                  {/* Recalculate */}
                  <Button
                    variant="outline"
                    onClick={handleRecalculate}
                    className="w-full h-12 text-base font-semibold rounded-xl border-2 border-border text-muted-foreground hover:text-foreground hover:border-primary/40 gap-2 transition-all"
                    data-ocid="kiosk.recalculate_button"
                  >
                    <RefreshCw className="h-5 w-5" />
                    Recalculate
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </section>
        )}
      </AnimatePresence>

      {/* ── Try at Home ──────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 sm:px-6 max-w-2xl pb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
        >
          <Card className="bg-primary/5 border border-primary/20 rounded-2xl overflow-hidden">
            <CardContent className="p-7 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                <Smartphone className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-display font-bold text-lg text-foreground">
                  Order from anywhere
                </p>
                <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                  Download &amp; order fresh salads from the comfort of home.
                  Visit{" "}
                  <Link
                    to="/"
                    className="text-primary font-semibold hover:underline"
                    data-ocid="kiosk.home.link"
                  >
                    Salad Khatora
                  </Link>{" "}
                  to get started.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-white transition-colors font-semibold flex-shrink-0"
                data-ocid="kiosk.home.secondary_button"
              >
                <Link to="/">Visit App</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-white py-7 mt-auto">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
              <Leaf className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-foreground">
              Salad Khatora
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()}. Built with{" "}
            <Heart className="inline h-3.5 w-3.5 text-red-500 mx-0.5" /> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              className="text-primary hover:underline font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            Secured by Internet Computer
          </div>
        </div>
      </footer>
    </main>
  );
}
