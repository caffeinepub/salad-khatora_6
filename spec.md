# Salad Khatora

## Current State
Full-stack Salad Khatora app with:
- Customer routes: `/`, `/menu`, `/profile`, `/orders`, `/subscriptions`
- Admin panel at `/admin/*`
- BMI calculation logic already exists in `ProfilePage.tsx` (computeBMI, getBMIInfo functions)
- Existing green/white theme with Tailwind, motion/react animations
- TanStack Router for routing

## Requested Changes (Diff)

### Add
- New `/kiosk` route -- a standalone gym kiosk landing page
- `KioskPage.tsx` component in `src/frontend/src/pages/`
- Route registered in `App.tsx`

### Modify
- `App.tsx`: add `kioskRoute` using the existing root layout (so Navigation and WhatsApp button are inherited), pointing to `KioskPage`

### Remove
- Nothing removed

## Implementation Plan

1. Create `src/frontend/src/pages/KioskPage.tsx`:
   - Large touch-friendly input form: height (cm), weight (kg), age, gender (select)
   - All inputs must be big/touch-friendly (large text, tall input fields, min-height buttons)
   - On submit: compute BMI (weight / (height/100)^2) and calorie target using Harris-Benedict formula
   - Display results: BMI value, health category label (Underweight / Normal / Overweight / Obese), calorie target (kcal/day)
   - Based on BMI/health category, show a recommended salad plan:
     - Underweight: "Calorie Boost Plan" -- high-protein, calorie-rich salads
     - Normal: "Balance & Maintain Plan" -- balanced nutrition
     - Overweight: "Lean & Clean Plan" -- low-calorie, high-fiber salads
     - Obese: "Fresh Start Plan" -- very low-calorie, detox-focused salads
   - "Start 7 Day Salad Plan" button links to the main Salad Khatora subscriptions page (`/subscriptions`)
   - Matches existing green/white theme (uses `gradient-hero`, `text-primary`, `font-display`, same card/badge styles)
   - data-ocid markers on all interactive elements

2. Register route in `App.tsx`:
   - Import `KioskPage`
   - Create `kioskRoute` at path `/kiosk`
   - Add to `routeTree`
