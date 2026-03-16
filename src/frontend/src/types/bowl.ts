export interface BowlIngredient {
  id: bigint;
  name: string;
  category: "base" | "vegetable" | "protein" | "dressing";
  priceRs: number;
  weightG: bigint;
  calories: bigint;
  inventoryItemId: bigint | null;
  imageData: string | null;
  isActive: boolean;
  createdAt: bigint;
}

export interface BowlSize {
  id: bigint;
  name: string;
  basePriceRs: number;
  baseWeightG: bigint;
  maxVegetables: bigint;
  maxProteins: bigint;
  maxDressings: bigint;
  isActive: boolean;
  createdAt: bigint;
}
