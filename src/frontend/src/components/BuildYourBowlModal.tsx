import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/context/CartContext";
import {
  useBowlIngredientsByCategory,
  useBowlSizes,
} from "@/hooks/useAdminQueries";
import type { BowlIngredient, BowlSize } from "@/types/bowl";
import { Check, ChefHat, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const PLACEHOLDER_IMG = "/assets/default-food.png";

const STEPS = [
  { title: "Choose Bowl Size", subtitle: "Select the size of your bowl" },
  { title: "Choose Your Base", subtitle: "The foundation of your bowl" },
  { title: "Pick Your Vegetables", subtitle: "Fresh and crunchy additions" },
  { title: "Add Protein", subtitle: "Power up your bowl" },
  { title: "Choose Dressing", subtitle: "The finishing touch" },
];

interface IngredientCardProps {
  ingredient: BowlIngredient;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}

function IngredientCard({
  ingredient,
  selected,
  disabled,
  onToggle,
}: IngredientCardProps) {
  const imgSrc = ingredient.imageData ?? PLACEHOLDER_IMG;
  return (
    <button
      type="button"
      onClick={!disabled ? onToggle : undefined}
      disabled={disabled}
      className={`w-full text-left rounded-xl border-2 p-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        disabled && !selected
          ? "opacity-40 cursor-not-allowed border-border bg-muted/30"
          : selected
            ? "border-primary bg-primary/5 shadow-sm"
            : "border-border bg-white hover:border-primary/40 hover:bg-accent/40"
      }`}
    >
      <div className="flex items-center gap-3">
        <img
          src={imgSrc}
          alt={ingredient.name}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMG;
          }}
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                selected
                  ? "border-primary bg-primary"
                  : "border-border bg-white"
              }`}
            >
              {selected && <Check className="h-2.5 w-2.5 text-white" />}
            </div>
            <span
              className={`font-medium text-sm truncate ${selected ? "text-primary" : "text-foreground"}`}
            >
              {ingredient.name}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 pl-6">
            <span className="text-xs text-muted-foreground">
              {Number(ingredient.calories)} kcal
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">
              {Number(ingredient.weightG)}g
            </span>
            {ingredient.priceRs > 0 && (
              <Badge
                variant="outline"
                className="text-xs text-primary border-primary/30 px-1.5 py-0 ml-auto"
              >
                +₹{ingredient.priceRs}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

interface SizeSelectorProps {
  sizes: BowlSize[];
  selectedId: bigint | null;
  onSelect: (size: BowlSize) => void;
}

function SizeSelector({ sizes, selectedId, onSelect }: SizeSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {sizes
        .filter((s) => s.isActive)
        .map((size) => {
          const sel = selectedId === size.id;
          return (
            <button
              key={size.id.toString()}
              type="button"
              onClick={() => onSelect(size)}
              className={`rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                sel
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/40 hover:bg-accent/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-foreground">{size.name}</span>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    sel ? "border-primary bg-primary" : "border-border"
                  }`}
                >
                  {sel && <Check className="h-3 w-3 text-white" />}
                </div>
              </div>
              <div className="text-2xl font-bold text-primary">
                ₹{size.basePriceRs}
              </div>
              <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <div>Base weight: {Number(size.baseWeightG)}g</div>
                <div>
                  Up to {Number(size.maxVegetables)} veg ·{" "}
                  {Number(size.maxProteins)} protein ·{" "}
                  {Number(size.maxDressings)} dressing
                </div>
              </div>
            </button>
          );
        })}
    </div>
  );
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BuildYourBowlModal({ open, onOpenChange }: Props) {
  const { addItem } = useCart();
  const [step, setStep] = useState(0);
  const [selectedSize, setSelectedSize] = useState<BowlSize | null>(null);
  const [selectedBase, setSelectedBase] = useState<BowlIngredient | null>(null);
  const [selectedVegs, setSelectedVegs] = useState<BowlIngredient[]>([]);
  const [selectedProteins, setSelectedProteins] = useState<BowlIngredient[]>(
    [],
  );
  const [selectedDressings, setSelectedDressings] = useState<BowlIngredient[]>(
    [],
  );

  const { data: sizes, isLoading: sizesLoading } = useBowlSizes();
  const { data: bases, isLoading: basesLoading } =
    useBowlIngredientsByCategory("base");
  const { data: vegs, isLoading: vegsLoading } =
    useBowlIngredientsByCategory("vegetable");
  const { data: proteins, isLoading: proteinsLoading } =
    useBowlIngredientsByCategory("protein");
  const { data: dressings, isLoading: dressingsLoading } =
    useBowlIngredientsByCategory("dressing");

  const activeIngredients = (list: BowlIngredient[] | undefined) =>
    (list ?? []).filter((i) => i.isActive);

  const maxVegs = selectedSize ? Number(selectedSize.maxVegetables) : 3;
  const maxProteins = selectedSize ? Number(selectedSize.maxProteins) : 1;
  const maxDressings = selectedSize ? Number(selectedSize.maxDressings) : 1;

  // ── Live totals ────────────────────────────────────────────────────────────
  const allSelected = [
    ...(selectedBase ? [selectedBase] : []),
    ...selectedVegs,
    ...selectedProteins,
    ...selectedDressings,
  ];

  const totalCalories = allSelected.reduce((s, i) => s + Number(i.calories), 0);
  const totalWeight = allSelected.reduce(
    (s, i) => s + Number(i.weightG),
    selectedSize ? Number(selectedSize.baseWeightG) : 0,
  );
  const totalPrice =
    (selectedSize?.basePriceRs ?? 0) +
    allSelected.reduce((s, i) => s + i.priceRs, 0);

  function reset() {
    setStep(0);
    setSelectedSize(null);
    setSelectedBase(null);
    setSelectedVegs([]);
    setSelectedProteins([]);
    setSelectedDressings([]);
  }

  function handleClose() {
    onOpenChange(false);
    setTimeout(reset, 300);
  }

  function toggleMulti(
    item: BowlIngredient,
    _list: BowlIngredient[],
    setList: React.Dispatch<React.SetStateAction<BowlIngredient[]>>,
    max: number,
  ) {
    setList((prev) => {
      if (prev.some((i) => i.id === item.id)) {
        return prev.filter((i) => i.id !== item.id);
      }
      if (prev.length >= max) return prev;
      return [...prev, item];
    });
  }

  function canProceed(): boolean {
    if (step === 0) return selectedSize !== null;
    if (step === 1) return selectedBase !== null;
    return true; // veg, protein, dressing are optional
  }

  function handleNext() {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  function handleAddToCart() {
    if (!selectedSize) {
      toast.error("Please select a bowl size.");
      return;
    }
    if (!selectedBase) {
      toast.error("Please select a base.");
      return;
    }

    const ingredients = allSelected.map((i) => ({
      id: i.id,
      name: i.name,
      weightG: Number(i.weightG),
      calories: Number(i.calories),
      priceRs: i.priceRs,
      inventoryItemId: i.inventoryItemId,
    }));

    addItem({
      menuItemId: BigInt(0),
      name: `Custom Bowl (${selectedSize.name})`,
      unitPrice: totalPrice,
      customBowlConfig: {
        bowlSizeId: selectedSize.id,
        bowlSizeName: selectedSize.name,
        ingredients,
        totalCalories,
        totalWeight,
        totalPrice,
        // backward compat
        base: selectedBase.name,
        vegetables: selectedVegs.map((v) => v.name),
        protein: selectedProteins[0]?.name ?? "",
        dressing: selectedDressings[0]?.name ?? "",
      },
    });

    toast.success("Custom bowl added to cart!");
    handleClose();
  }

  // ── Step content ───────────────────────────────────────────────────────────
  function renderStepContent() {
    if (step === 0) {
      if (sizesLoading) return <LoadingGrid count={2} />;
      const activeSizes =
        (sizes as BowlSize[] | undefined)?.filter((s) => s.isActive) ?? [];
      if (!activeSizes.length) {
        return (
          <p className="text-muted-foreground text-sm text-center py-8">
            No bowl sizes available. Please check back later.
          </p>
        );
      }
      return (
        <SizeSelector
          sizes={activeSizes}
          selectedId={selectedSize?.id ?? null}
          onSelect={setSelectedSize}
        />
      );
    }

    if (step === 1) {
      if (basesLoading) return <LoadingGrid count={3} />;
      const list = activeIngredients(bases as BowlIngredient[] | undefined);
      return (
        <div className="grid gap-2">
          {list.map((ing) => (
            <IngredientCard
              key={ing.id.toString()}
              ingredient={ing}
              selected={selectedBase?.id === ing.id}
              disabled={false}
              onToggle={() =>
                setSelectedBase(ing.id === selectedBase?.id ? null : ing)
              }
            />
          ))}
        </div>
      );
    }

    if (step === 2) {
      if (vegsLoading) return <LoadingGrid count={4} />;
      const list = activeIngredients(vegs as BowlIngredient[] | undefined);
      const atMax = selectedVegs.length >= maxVegs;
      return (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground mb-2">
            Select up to {maxVegs} vegetable{maxVegs !== 1 ? "s" : ""} (
            {selectedVegs.length}/{maxVegs})
          </p>
          <div className="grid gap-2">
            {list.map((ing) => {
              const sel = selectedVegs.some((i) => i.id === ing.id);
              return (
                <IngredientCard
                  key={ing.id.toString()}
                  ingredient={ing}
                  selected={sel}
                  disabled={atMax && !sel}
                  onToggle={() =>
                    toggleMulti(ing, selectedVegs, setSelectedVegs, maxVegs)
                  }
                />
              );
            })}
          </div>
        </div>
      );
    }

    if (step === 3) {
      if (proteinsLoading) return <LoadingGrid count={3} />;
      const list = activeIngredients(proteins as BowlIngredient[] | undefined);
      const atMax = selectedProteins.length >= maxProteins;
      return (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground mb-2">
            Select up to {maxProteins} protein{maxProteins !== 1 ? "s" : ""} (
            {selectedProteins.length}/{maxProteins})
          </p>
          <div className="grid gap-2">
            {list.map((ing) => {
              const sel = selectedProteins.some((i) => i.id === ing.id);
              return (
                <IngredientCard
                  key={ing.id.toString()}
                  ingredient={ing}
                  selected={sel}
                  disabled={atMax && !sel}
                  onToggle={() =>
                    toggleMulti(
                      ing,
                      selectedProteins,
                      setSelectedProteins,
                      maxProteins,
                    )
                  }
                />
              );
            })}
          </div>
        </div>
      );
    }

    if (step === 4) {
      if (dressingsLoading) return <LoadingGrid count={3} />;
      const list = activeIngredients(dressings as BowlIngredient[] | undefined);
      const atMax = selectedDressings.length >= maxDressings;
      return (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground mb-2">
            Select up to {maxDressings} dressing{maxDressings !== 1 ? "s" : ""}{" "}
            ({selectedDressings.length}/{maxDressings})
          </p>
          <div className="grid gap-2">
            {list.map((ing) => {
              const sel = selectedDressings.some((i) => i.id === ing.id);
              return (
                <IngredientCard
                  key={ing.id.toString()}
                  ingredient={ing}
                  selected={sel}
                  disabled={atMax && !sel}
                  onToggle={() =>
                    toggleMulti(
                      ing,
                      selectedDressings,
                      setSelectedDressings,
                      maxDressings,
                    )
                  }
                />
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ChefHat className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Build Your Bowl
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {STEPS[step].subtitle}
              </p>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex gap-1.5 mt-4">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="text-sm font-semibold text-foreground mt-3">
            Step {step + 1} of {STEPS.length}: {STEPS[step].title}
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 h-full">
            {/* Main content */}
            <div className="lg:col-span-3 px-6 py-4 overflow-y-auto">
              {renderStepContent()}
            </div>

            {/* Summary panel */}
            <div className="lg:col-span-2 border-t lg:border-t-0 lg:border-l border-border bg-muted/30 px-5 py-4">
              <h3 className="font-semibold text-sm text-foreground mb-3">
                Your Bowl Summary
              </h3>
              {selectedSize && (
                <p className="text-xs text-muted-foreground mb-2">
                  Size:{" "}
                  <span className="text-foreground font-medium">
                    {selectedSize.name}
                  </span>
                </p>
              )}
              <Separator className="mb-3" />
              <div className="space-y-1.5 min-h-[80px]">
                {allSelected.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    No ingredients selected yet
                  </p>
                ) : (
                  allSelected.map((i) => (
                    <div
                      key={i.id.toString()}
                      className="flex justify-between text-xs"
                    >
                      <span className="text-foreground">
                        {i.name} ({Number(i.weightG)}g)
                      </span>
                      {i.priceRs > 0 && (
                        <span className="text-muted-foreground">
                          ₹{i.priceRs}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
              <Separator className="my-3" />
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Weight</span>
                  <span className="font-medium">{totalWeight}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Calories</span>
                  <span className="font-medium">{totalCalories} kcal</span>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Total Price</span>
                <span className="text-lg font-bold text-primary">
                  ₹{totalPrice}
                </span>
              </div>

              {step === STEPS.length - 1 && (
                <Button
                  className="w-full mt-4"
                  onClick={handleAddToCart}
                  disabled={!selectedBase}
                  data-ocid="bowl.primary_button"
                >
                  Add to Cart
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-border bg-background">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 0}
            data-ocid="bowl.secondary_button"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <span className="text-xs text-muted-foreground">
            {step + 1} / {STEPS.length}
          </span>
          {step < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              data-ocid="bowl.primary_button"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleAddToCart}
              disabled={!selectedBase}
              data-ocid="bowl.primary_button"
            >
              Add to Cart
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LoadingGrid({ count }: { count: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static count list
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}
