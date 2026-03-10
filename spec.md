# Salad Khatora

## Current State
- Subscription plans are hardcoded as a `SubscriptionPlan` enum (`weekly` / `monthly`) in the backend.
- The customer Subscriptions page shows two static plan cards.
- Admin has a Subscriptions section for managing customer subscriptions, but no way to create/edit plan templates.
- `subscribeToPlan(plan: SubscriptionPlan)` is the current customer subscribe API.

## Requested Changes (Diff)

### Add
- New `SubscriptionPlanTemplate` entity with fields: id, name, durationType (weekly/monthly), saladCount, price, deliveryFrequency (daily/weekly), features (list of strings), badge (optional), active (bool).
- Backend CRUD: `createSubscriptionPlanTemplate`, `updateSubscriptionPlanTemplate`, `deleteSubscriptionPlanTemplate`, `getActiveSubscriptionPlanTemplates`, `getAllSubscriptionPlanTemplates`.
- `subscribeToPlanTemplate(templateId)` — creates a customer subscription linked to a specific template.
- Seed 4 default plan templates on first deploy (Weekly Weight Loss, Weekly Protein, Monthly Fitness, Monthly Premium).
- Admin panel: new "Subscription Plans" menu item (separate from "Subscriptions").
- Admin Subscription Plans page: list of all plans, create/edit form (inline or modal), activate/deactivate toggle, delete.
- Customer Subscriptions page: loads active plan templates dynamically; "Subscribe Now" calls `subscribeToPlanTemplate`.

### Modify
- Customer subscription flow to use template IDs instead of enum.
- Admin sidebar to include new "Subscription Plans" nav item.

### Remove
- Hardcoded plan cards from the customer Subscriptions page.

## Implementation Plan
1. Generate updated Motoko backend with `SubscriptionPlanTemplate` entity and all CRUD + subscribe endpoints, plus seed data.
2. Build Admin "Subscription Plans" management UI: table of plans, add/edit form with all fields (name, duration type, salad count, price, delivery frequency, feature bullet points, badge, active toggle), delete with confirm.
3. Update customer Subscriptions page to fetch and render plans dynamically from the backend.
