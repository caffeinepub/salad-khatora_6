# Salad Khatora — Dynamic Build Your Bowl System

## Current State

- `BuildYourBowlModal.tsx` uses hardcoded ingredient arrays (`BASE_OPTIONS`, `VEG_OPTIONS`, `PROTEIN_OPTIONS`, `DRESSING_OPTIONS`) with a fixed base price of ₹299
- No bowl size selection step exists; max vegetables is hardcoded to 4
- CartContext `CustomBowlConfig` only stores labels (strings), not ingredient IDs, weight, or calories
- Custom bowls use `menuItemId = BigInt(0)`, so no inventory deduction occurs for them
- Inventory deduction for regular items fires immediately in `placeOrder()` — before confirmation
- AdminOrders.tsx does not display custom bowl config in any structured way
- No admin UI for managing bowl ingredients or bowl sizes
- Backend has no `BowlIngredient` or `BowlSize` types

## Requested Changes (Diff)

### Add
- **Backend types**: `BowlIngredient` (id, name, category variant, priceRs, weightG, calories, inventoryItemId opt, imageData opt, isActive, createdAt) and `BowlSize` (id, name, basePriceRs, baseWeightG, maxVegetables, maxProteins, maxDressings, isActive)
- **Backend CRUD functions**: `getAllBowlIngredients`, `getBowlIngredientsByCategory`, `createBowlIngredient`, `updateBowlIngredient`, `toggleBowlIngredientStatus`, `deleteBowlIngredient`, `getAllBowlSizes`, `createBowlSize`, `updateBowlSize`, `toggleBowlSizeStatus`, `deleteBowlSize`
- **Backend**: `deductBowlInventory(orderId)` — called from `updateOrderStatus` when transitioning to `#confirmed` or `#preparing`, reads custom bowl ingredient IDs from order notes JSON, deducts each ingredient's weightG from its mapped inventory item
- **Backend seeding**: 12 default ingredients (3 bases, 4 vegetables, 3 proteins, 3 dressings) + 2 bowl sizes (Regular ₹149/250g, Large ₹199/350g)
- **Admin page `AdminIngredients.tsx`**: table of all bowl ingredients with edit/toggle/delete; Add/Edit modal with name, category dropdown, price, weight, calories, inventory item dropdown (from `useAllIngredients()`), local image upload (max 2MB, compressed), active toggle
- **Admin page `AdminBowlSizes.tsx`**: table of all bowl sizes with edit/toggle/delete; Add/Edit modal with name, base price, base weight, max vegetables, max proteins, max dressings, active toggle
- **New hooks** in `useAdminQueries.ts`: `useBowlIngredients`, `useBowlIngredientsByCategory`, `useCreateBowlIngredient`, `useUpdateBowlIngredient`, `useToggleBowlIngredientStatus`, `useDeleteBowlIngredient`, `useBowlSizes`, `useCreateBowlSize`, `useUpdateBowlSize`, `useToggleBowlSizeStatus`, `useDeleteBowlSize`
- **New routes** in `App.tsx`: `/admin/ingredients` and `/admin/bowl-sizes`
- **New nav items** in `AdminLayout.tsx`: "Ingredients" and "Bowl Sizes" sidebar links

### Modify
- **`BuildYourBowlModal.tsx`**: Prepend Step 0 (choose bowl size from backend); replace all hardcoded ingredient arrays with live data from `useBowlIngredientsByCategory`; enforce per-size limits for vegetables, proteins, dressings; update pricing formula to `bowlSize.basePriceRs + sum(ingredient.priceRs for each selected portion)`; update weight calculation to `bowlSize.baseWeightG + sum(ingredient.weightG)`; calories = sum of ingredient calories only
- **`CartContext.tsx`**: Expand `CustomBowlConfig` to include `bowlSizeId`, `bowlSizeName`, `ingredients: Array<{id, name, weightG, calories, priceRs}>`, `totalCalories`, `totalWeight`, `totalPrice`. Keep backward compat with old string-only config
- **`AdminOrders.tsx`**: In the order detail view, parse `customBowl` field from order notes JSON and render a "Custom Bowl Details" card showing size, each ingredient with weight, total weight, total calories, total price
- **`updateOrderStatus` backend function**: After updating status to `#confirmed` or `#preparing`, iterate through the order's items looking for `menuItemId = 0` (custom bowls), parse ingredient IDs from notes JSON, and deduct each ingredient's `weightG` from the mapped inventory item's `quantity`
- **`backend.ts` (actor layer)**: Register all new BowlIngredient and BowlSize functions
- **`backend.d.ts`**: Add type declarations for all new types and functions

### Remove
- Hardcoded `BASE_OPTIONS`, `VEG_OPTIONS`, `PROTEIN_OPTIONS`, `DRESSING_OPTIONS` arrays from `BuildYourBowlModal.tsx`
- Hardcoded `BASE_BOWL_PRICE = 299` and `BASE_BOWL_CALORIES = 250` constants
- Hardcoded `maxVegetables = 4` limit

## Implementation Plan

1. Add `BowlIngredient` and `BowlSize` Motoko types and stable storage vars to `main.mo`
2. Add CRUD functions for both types with admin-only access control
3. Add seeding logic (runs once if storage is empty) for 12 default ingredients + 2 bowl sizes
4. Modify `updateOrderStatus` to trigger `deductBowlInventory` on transition to `#confirmed`/`#preparing`
5. Register all new functions in `backend.ts` and `backend.d.ts`
6. Build `AdminIngredients.tsx` page with full CRUD UI and image upload
7. Build `AdminBowlSizes.tsx` page with full CRUD UI
8. Add new hooks to `useAdminQueries.ts`
9. Update `BuildYourBowlModal.tsx` — dynamic loading, bowl size step, live calculations
10. Update `CartContext.tsx` — expanded `CustomBowlConfig` with IDs, weights, calories
11. Update `AdminOrders.tsx` — parse and display Custom Bowl Details section
12. Wire routes and nav in `App.tsx` and `AdminLayout.tsx`
