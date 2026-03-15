import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart } from "@/context/CartContext";
import { Check, ChefHat } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface BowlOption {
  id: string;
  label: string;
  calories: number;
  price: number;
}

const BASE_OPTIONS: BowlOption[] = [
  { id: "romaine", label: "Romaine Lettuce", calories: 0, price: 0 },
  { id: "quinoa", label: "Quinoa", calories: 80, price: 50 },
  { id: "brown-rice", label: "Brown Rice", calories: 90, price: 40 },
];

const VEG_OPTIONS: BowlOption[] = [
  { id: "cucumber", label: "Cucumber", calories: 10, price: 0 },
  { id: "tomatoes", label: "Tomatoes", calories: 15, price: 0 },
  { id: "spinach", label: "Spinach", calories: 7, price: 0 },
  { id: "red-cabbage", label: "Red Cabbage", calories: 12, price: 0 },
  { id: "corn", label: "Corn", calories: 25, price: 0 },
  { id: "bell-peppers", label: "Bell Peppers", calories: 15, price: 0 },
];

const PROTEIN_OPTIONS: BowlOption[] = [
  { id: "none", label: "No Protein", calories: 0, price: 0 },
  { id: "paneer", label: "Paneer", calories: 120, price: 80 },
  { id: "chickpeas", label: "Chickpeas", calories: 100, price: 60 },
  { id: "tofu", label: "Tofu", calories: 90, price: 70 },
  {
    id: "grilled-chicken",
    label: "Grilled Chicken",
    calories: 150,
    price: 100,
  },
];

const DRESSING_OPTIONS: BowlOption[] = [
  { id: "house", label: "House Dressing", calories: 30, price: 20 },
  { id: "tahini", label: "Tahini", calories: 45, price: 20 },
  { id: "caesar", label: "Caesar", calories: 60, price: 20 },
  { id: "lime-citrus", label: "Lime Citrus", calories: 15, price: 15 },
  {
    id: "apple-cider",
    label: "Apple Cider Vinaigrette",
    calories: 20,
    price: 15,
  },
];

const BASE_BOWL_CALORIES = 250;
const BASE_BOWL_PRICE = 299;

const STEPS = [
  { title: "Choose Your Base", subtitle: "The foundation of your bowl" },
  { title: "Pick Your Vegetables", subtitle: "Pick up to 4 vegetables" },
  { title: "Add Protein", subtitle: "Power up your bowl" },
  { title: "Choose Dressing", subtitle: "The finishing touch" },
];

function OptionCard({
  option,
  selected,
  onToggle,
  showPrice,
}: {
  option: BowlOption;
  selected: boolean;
  onToggle: () => void;
  showPrice: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full text-left rounded-xl border-2 p-4 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-white hover:border-primary/40 hover:bg-accent/40"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              selected ? "border-primary bg-primary" : "border-border bg-white"
            }`}
          >
            {selected && <Check className="h-3 w-3 text-white" />}
          </div>
          <span
            className={`font-medium text-sm ${
              selected ? "text-primary" : "text-foreground"
            }`}
          >
            {option.label}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {option.calories > 0 && (
            <span className="text-xs text-muted-foreground">
              +{option.calories} kcal
            </span>
          )}
          {showPrice && option.price > 0 && (
            <Badge
              variant="outline"
              className="text-xs text-primary border-primary/30 px-2 py-0"
            >
              +₹{option.price}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BuildYourBowlModal({ open, onOpenChange }: Props) {
  const { addItem } = useCart();
  const [step, setStep] = useState(0);
  const [selectedBase, setSelectedBase] = useState("romaine");
  const [selectedVegs, setSelectedVegs] = useState<string[]>([]);
  const [selectedProtein, setSelectedProtein] = useState("none");
  const [selectedDressing, setSelectedDressing] = useState("house");

  const calcCalories = () => {
    const base = BASE_OPTIONS.find((o) => o.id === selectedBase);
    const vegsCal = selectedVegs.reduce((sum, id) => {
      const v = VEG_OPTIONS.find((o) => o.id === id);
      return sum + (v?.calories ?? 0);
    }, 0);
    const protein = PROTEIN_OPTIONS.find((o) => o.id === selectedProtein);
    const dressing = DRESSING_OPTIONS.find((o) => o.id === selectedDressing);
    return (
      BASE_BOWL_CALORIES +
      (base?.calories ?? 0) +
      vegsCal +
      (protein?.calories ?? 0) +
      (dressing?.calories ?? 0)
    );
  };

  const calcPrice = () => {
    const base = BASE_OPTIONS.find((o) => o.id === selectedBase);
    const protein = PROTEIN_OPTIONS.find((o) => o.id === selectedProtein);
    const dressing = DRESSING_OPTIONS.find((o) => o.id === selectedDressing);
    return (
      BASE_BOWL_PRICE +
      (base?.price ?? 0) +
      (protein?.price ?? 0) +
      (dressing?.price ?? 0)
    );
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep(0);
      setSelectedBase("romaine");
      setSelectedVegs([]);
      setSelectedProtein("none");
      setSelectedDressing("house");
    }, 300);
  };

  const toggleVeg = (id: string) => {
    setSelectedVegs((prev) => {
      if (prev.includes(id)) return prev.filter((v) => v !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  const handleAddToCart = () => {
    const baseLabel =
      BASE_OPTIONS.find((o) => o.id === selectedBase)?.label ?? selectedBase;
    const vegLabels = selectedVegs.map(
      (id) => VEG_OPTIONS.find((o) => o.id === id)?.label ?? id,
    );
    const proteinLabel =
      PROTEIN_OPTIONS.find((o) => o.id === selectedProtein)?.label ??
      selectedProtein;
    const dressingLabel =
      DRESSING_OPTIONS.find((o) => o.id === selectedDressing)?.label ??
      selectedDressing;

    addItem({
      menuItemId: BigInt(0),
      name: "Custom Bowl",
      unitPrice: calcPrice(),
      customBowlConfig: {
        base: baseLabel,
        vegetables: vegLabels.length > 0 ? vegLabels : ["No vegetables"],
        protein: proteinLabel,
        dressing: dressingLabel,
      },
    });
    toast.success("Custom bowl added to cart!");
    handleClose();
  };

  const totalCalories = calcCalories();
  const totalPrice = calcPrice();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-lg w-full max-h-[90vh] overflow-y-auto"
        data-ocid="build_bowl.dialog"
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ChefHat className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl font-bold">
                Build Your Perfect Bowl
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {STEPS[step].subtitle}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex items-center gap-2 flex-1">
              <div
                data-ocid={`build_bowl.step.${i + 1}`}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                  i < step
                    ? "bg-primary text-white"
                    : i === step
                      ? "bg-primary text-white ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-1 rounded-full transition-colors ${
                    i < step ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step title */}
        <h3 className="font-display font-bold text-lg text-foreground mb-4">
          {STEPS[step].title}
        </h3>

        {/* Step content */}
        <div className="space-y-3">
          {step === 0 &&
            BASE_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.id}
                option={opt}
                selected={selectedBase === opt.id}
                onToggle={() => setSelectedBase(opt.id)}
                showPrice
              />
            ))}

          {step === 1 && (
            <>
              <p className="text-xs text-muted-foreground mb-3">
                Selected {selectedVegs.length}/4 vegetables
              </p>
              {VEG_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.id}
                  option={opt}
                  selected={selectedVegs.includes(opt.id)}
                  onToggle={() => toggleVeg(opt.id)}
                  showPrice={false}
                />
              ))}
            </>
          )}

          {step === 2 &&
            PROTEIN_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.id}
                option={opt}
                selected={selectedProtein === opt.id}
                onToggle={() => setSelectedProtein(opt.id)}
                showPrice
              />
            ))}

          {step === 3 &&
            DRESSING_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.id}
                option={opt}
                selected={selectedDressing === opt.id}
                onToggle={() => setSelectedDressing(opt.id)}
                showPrice
              />
            ))}
        </div>

        {/* Live totals */}
        <div className="mt-6 rounded-xl bg-primary/5 border border-primary/10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total Calories</p>
              <p className="font-display font-bold text-primary">
                {totalCalories} kcal
              </p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-xs text-muted-foreground">Total Price</p>
              <p className="font-display font-bold text-foreground">
                ₹{totalPrice}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-xs text-primary border-primary/30"
          >
            Step {step + 1}/{STEPS.length}
          </Badge>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          {step > 0 ? (
            <Button
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              data-ocid="build_bowl.back_button"
              className="gap-2"
            >
              ← Back
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={handleClose}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
          )}

          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              data-ocid="build_bowl.next_button"
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              Next →
            </Button>
          ) : (
            <Button
              onClick={handleAddToCart}
              data-ocid="build_bowl.add_button"
              className="bg-primary hover:bg-primary/90 gap-2 font-semibold"
            >
              <ChefHat className="h-4 w-4" />
              Add to Cart · ₹{totalPrice}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
