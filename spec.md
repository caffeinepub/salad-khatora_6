# Salad Khatora

## Current State

- Full-stack app with Motoko backend and React + TypeScript frontend
- Admin panel has: Dashboard, Orders, Customers, Subscriptions, Menu Management, Inventory, Coupons, Delivery
- Menu Management allows adding/editing/deleting salad items (MenuItem type)
- Inventory tracks ingredients (IngredientItem: id, name, quantity, pricePerUnit, lowStockThreshold, unit)
- Orders are placed via `placeOrder(items, totalAmount, notes)` -- no ingredient deduction currently
- No mapping between salads and ingredients exists yet

## Requested Changes (Diff)

### Add
- `SaladIngredient` type: `{ saladId: Nat; ingredientId: Nat; quantityRequired: Nat }`
- `saladIngredients` map in backend state: `Map<Nat, [SaladIngredient]>` keyed by saladId
- Backend functions:
  - `setSaladIngredients(saladId, ingredients)` -- admin only, replaces all ingredient mappings for a salad
  - `getSaladIngredients(saladId)` -- public query, returns ingredient list for a salad
  - `getAllSaladIngredients()` -- public query, returns all mappings (for inventory usage view)
- Auto-deduct logic in `placeOrder`: for each order item, look up saladIngredients for that menuItemId, multiply quantityRequired by order quantity, deduct from ingredient stock. If stock is insufficient, trap with error.
- Frontend: ingredient picker in AdminMenu add/edit dialog (multi-select from existing ingredients with quantity input)
- Frontend: AdminInventory table gets a "Used In" column showing which salads use each ingredient

### Modify
- `placeOrder` in backend: after saving the order, iterate order items, look up ingredient mappings, deduct stock
- `AdminMenu.tsx`: form dialog extended with an "Ingredients" section -- list of ingredient rows (select ingredient + enter quantity), add/remove rows
- `AdminInventory.tsx`: add "Used In" column showing salad names linked to each ingredient
- `useAdminQueries.ts`: add hooks for `setSaladIngredients`, `getSaladIngredients`, `getAllSaladIngredients`
- `backend.d.ts`: add `SaladIngredient` type and new function signatures

### Remove
- Nothing removed

## Implementation Plan

1. Update `main.mo`:
   - Add `SaladIngredient` type
   - Add `saladIngredients` Map (keyed by saladId, value is array of SaladIngredient)
   - Add `setSaladIngredients` (admin), `getSaladIngredients` (public), `getAllSaladIngredients` (public)
   - Update `placeOrder` to deduct ingredients after saving order

2. Update `backend.d.ts`:
   - Add `SaladIngredient` interface
   - Add 3 new function signatures to `backendInterface`

3. Update `useAdminQueries.ts`:
   - Add `useGetSaladIngredients(saladId)` query hook
   - Add `useGetAllSaladIngredients()` query hook
   - Add `useSetSaladIngredients()` mutation hook

4. Update `AdminMenu.tsx`:
   - When opening add/edit dialog, also fetch ingredient list
   - Add "Ingredients" section at bottom of form: a dynamic list of rows, each with ingredient dropdown + quantity input
   - On submit, call `setSaladIngredients` after saving the menu item

5. Update `AdminInventory.tsx`:
   - Fetch `getAllSaladIngredients()` and `getAllMenuItems()`
   - For each ingredient row, show a "Used In" cell listing salad names that use it
