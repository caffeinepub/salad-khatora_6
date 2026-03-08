# Salad Khatora

## Current State
The "Fresh Picks Today" section on the home page (`LandingPage.tsx`) is fully hardcoded with three static salad items (Garden Fresh Bowl, Mediterranean Greek, Grilled Chicken Bowl) with placeholder images and fixed prices. It does not connect to the backend at all.

The backend has:
- `getAllMenuItems()` — returns all menu items
- `getAllOrders()` — admin-only; returns all orders with `items: OrderItem[]`
- Each `OrderItem` has `menuItemId`, `quantity`, `unitPrice`

There is no public query to get top-ordered items by frequency.

## Requested Changes (Diff)

### Add
- New backend query `getTopOrderedMenuItems(limit: Nat)` — public (no auth), iterates all orders, counts occurrences of each `menuItemId` across all order items, joins with menu items, sorts by count descending, returns top N active items
- New frontend hook `useTopOrderedMenuItems(limit: number)` in `useQueries.ts`
- Fallback logic: if no orders exist (count = 0 for all items), return the first N active menu items instead

### Modify
- `LandingPage.tsx` — replace the hardcoded "Fresh Picks Today" grid with a dynamic component that:
  - Calls `useTopOrderedMenuItems(3)`
  - Shows a loading skeleton while fetching
  - Renders real item name, price (₹), calories, category badge, and imageUrl (with fallback)
  - Shows an "Order Count" or popularity indicator (e.g. "🔥 X orders")
  - Links each card to `/menu`

### Remove
- The three hardcoded static item objects from the Fresh Picks Today grid in `LandingPage.tsx`

## Implementation Plan
1. Add `getTopOrderedMenuItems(limit: Nat)` public query to `main.mo`
2. Regenerate `backend.d.ts` is not needed — just add to existing interface manually since the signature is straightforward: returns `Array<MenuItem>`
3. Add `useTopOrderedMenuItems` hook to `useQueries.ts`
4. Update `LandingPage.tsx` Fresh Picks section to use the hook, with loading skeleton, real data rendering, and fallback
