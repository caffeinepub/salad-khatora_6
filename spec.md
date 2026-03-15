# Salad Khatora

## Current State

The app is a full-stack India-focused salad ordering platform with:
- LandingPage: Hero section with "Eat Fresh. Feel Amazing." headline, "Browse Menu" + "Get Started" CTA buttons, numeric stats bar (50+ Fresh Items, 10k+ Happy Customers, 4.9★ Rating, 30min Delivery), features section, menu preview cards with calories badge as text in the bottom-left area, reviews carousel, CTA section, footer.
- Navigation: Links ordered Home → Menu → Reviews → My Orders → Profile → Subscriptions (auth-gated). No visual highlight on Subscriptions.
- WhatsAppButton: Fixed bottom-6 right-6 (green circle)
- FloatingReviewButton: Fixed bottom-24 right-6 (primary green circle)
- CartContext: CartItem = { menuItemId: bigint, name, unitPrice, quantity } — no custom bowl support yet.
- MenuPage: Grid of menu cards with Add to Cart. No Build Your Bowl entry point.

## Requested Changes (Diff)

### Add
- **Build Your Bowl component** (`BuildYourBowlModal.tsx`): Step-by-step multi-step modal (Base → Vegetables → Protein → Dressing). Each step shows options with icons. Live calorie total and price total update as user selects options. "Add to Cart" adds a custom bowl item to the same cart as regular items. Bowl configuration is stored in the cart item for admin visibility.
- **BuildYourBowlSection component** for the homepage: Prominent section below the hero featuring an image/illustration, headline "Build Your Perfect Bowl", subtitle, and a "Start Building" CTA button that opens the BuildYourBowlModal.
- **CartItem extension**: Add optional `customBowlConfig?: { base: string, vegetables: string[], protein: string, dressing: string }` field to CartItem in CartContext. When a custom bowl is added to cart, this config is attached to the item.
- **Custom bowl serialization in CheckoutPage**: When building the order items list for submission, if a CartItem has `customBowlConfig`, serialize it as a JSON string appended to the item name or as a note field so admin can see the ingredients.

### Modify
- **LandingPage hero**: 
  - Update headline to "Fresh Salads. Healthy Daily Meals." with subtitle emphasizing fresh ingredients, customizable bowls, and subscription plans.
  - Replace "Browse Menu" + "Get Started" buttons with:
    - Primary: "Order Now" (scrolls to the menu preview section using `#menu-preview` anchor)
    - Secondary: "View Menu" (navigates to /menu)
  - Two-column grid layout is already present (md:grid-cols-2) — ensure image column is properly filled and balanced on desktop.
- **LandingPage stats bar**: Replace numeric stats with 4 value cards — Fresh Ingredients (Leaf icon), Healthy Meals (Heart icon), Nutrition Focused (Apple/Salad icon — use `Apple` or `Sprout` from lucide), Quick Delivery (Clock icon). Show outlined Lucide icons above each label, no numbers.
- **LandingPage**: Add `id="menu-preview"` to the menu preview section so hero "Order Now" can scroll to it.
- **LandingPage**: Insert `BuildYourBowlSection` between the hero/stats area and the features section.
- **Navigation**: Reorder nav links to Home → Menu → Subscriptions → Reviews → My Orders → Profile. Add a small green `Badge` with text "New" or a subtle accent style next to the "Subscriptions" link to highlight it. Subscriptions should be shown to all users (not auth-only), same as Reviews.
- **MenuPage**: Add a "Build Your Bowl" button (primary outline style) near the top of the page (below the page heading), which opens the `BuildYourBowlModal`.
- **WhatsAppButton**: Change position to `bottom-6 right-6` (unchanged).
- **FloatingReviewButton**: Change position to `bottom-24 right-6` so buttons stack vertically with proper gap (WhatsApp at bottom-6, Review at bottom-24 — already correct, but ensure they don't overlap).
- **LandingPage menu cards (Fresh Picks)**: Move calories badge inside the card info area at the bottom-right. Currently shown as `<span className="text-xs text-muted-foreground bg-muted rounded-full px-3 py-1">`. Ensure it is positioned at the bottom-right of the card text section alongside the price. Ensure consistent card heights using flex-col and equal-height card containers.
- **CartContext**: Extend `CartItem` interface with optional `customBowlConfig` field. The `addItem` function should accept this new optional field.
- **MenuPage menu cards**: Apply the same calories badge positioning fix (bottom-right inside card info area). Ensure consistent card height across all items.

### Remove
- Remove "Get Started" button from hero section.
- Remove "Browse Menu" button from hero section (replaced by "Order Now" and "View Menu").
- Remove numeric stat values from stats bar (keep only icon + label).

## Implementation Plan

1. **CartContext.tsx**: Add `customBowlConfig?: { base: string; vegetables: string[]; protein: string; dressing: string }` to `CartItem` interface. Update `addItem` to accept and preserve this field.

2. **BuildYourBowlModal.tsx** (new): Create a multi-step Dialog/Sheet component.
   - Step 1: Choose Base (Romaine Lettuce 0 kcal ₹0, Quinoa +80 kcal +₹50, Brown Rice +90 kcal +₹40)
   - Step 2: Choose Vegetables (multi-select: Cucumber +10 kcal, Tomatoes +15 kcal, Spinach +7 kcal, Red Cabbage +12 kcal, Corn +25 kcal, Bell Peppers +15 kcal)
   - Step 3: Choose Protein (Paneer +120 kcal +₹80, Chickpeas +100 kcal +₹60, Tofu +90 kcal +₹70, Grilled Chicken +150 kcal +₹100, No Protein 0)
   - Step 4: Choose Dressing (Tahini +45 kcal +₹20, Caesar +60 kcal +₹20, Lime Citrus +15 kcal +₹15, Apple Cider Vinaigrette +20 kcal +₹15, House Dressing +30 kcal +₹20)
   - Show live calorie total and price total at bottom of each step
   - Base price ₹299 for the bowl, add-on prices stack on top
   - "Add to Bowl" / "Next" buttons for navigation between steps
   - Final step: "Add to Cart" button that calls `addItem({ menuItemId: BigInt(0), name: 'Custom Bowl', unitPrice: totalPrice, customBowlConfig: { base, vegetables, protein, dressing } })`
   - data-ocid markers on all interactive elements

3. **LandingPage.tsx**: Apply all hero, stats, nav, menu card, and section changes. Insert BuildYourBowlSection. Add `id="menu-preview"` to the menu section.

4. **Navigation.tsx**: Reorder navLinks array. Add Badge accent to Subscriptions link. Make Subscriptions accessible to all users (remove authOnly restriction).

5. **MenuPage.tsx**: Add BuildYourBowlModal import and trigger button. Fix calories badge positioning inside card info area. Ensure card heights are consistent.

6. **CheckoutPage.tsx** (minor): When building the order request, check if a cart item has `customBowlConfig` and serialize it — e.g. append ingredients to the item name as ` (Base: X, Veggies: Y, Protein: Z, Dressing: W)` so admin can see it in the order details.

7. **FloatingReviewButton.tsx / WhatsAppButton.tsx**: Verify stacking positions are correct (bottom-6 and bottom-24 at right-6) so buttons stack neatly without overlap.
