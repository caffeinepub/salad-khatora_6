# Salad Khatora

## Current State

Full-stack food ordering app with customer-facing pages (menu, cart, checkout, orders, subscriptions, profile) and a complete Admin Panel (dashboard, orders, customers, subscriptions, inventory, coupons, delivery, menu management, settings).

Authentication uses Internet Identity via `_initializeAccessControlWithSecret`. The backend `access-control.mo` `getUserRole()` currently calls `Runtime.trap("User is not registered")` for any principal not yet in the `userRoles` map -- this causes all admin queries to fail with a canister trap when the admin checks permission before being registered, resulting in data not loading and not saving in the admin panel.

`AppSettings` does not include `gstNumber` and `businessAddress` -- those are currently stored only in localStorage as a workaround.

## Requested Changes (Diff)

### Add
- `gstNumber: Text` and `businessAddress: Text` fields to `AppSettings` type in the backend, stored and retrieved like all other settings fields.

### Modify
- `getUserRole()` in `access-control.mo`: return `#guest` instead of trapping when a principal is not found in the `userRoles` map. This makes `hasPermission()` return `false` gracefully for unregistered users instead of trapping, fixing all admin data load/save failures.
- `AppSettings` type: add `gstNumber` and `businessAddress` fields (both `Text`, default empty string).
- `appSettings` default value: include `gstNumber = ""` and `businessAddress = ""`.
- `getAppSettings` and `saveAppSettings`: work with the new fields automatically.
- Frontend `AdminSettings.tsx`: read/write `gstNumber` and `businessAddress` from/to backend instead of localStorage.
- Frontend `AdminOrders.tsx` (receipt): read `gstNumber` and `businessAddress` from backend settings instead of localStorage.
- Frontend `useAdminQueries.ts`: no change needed; the `saveAppSettings`/`getAppSettings` hooks already use the `AppSettings` type.

### Remove
- localStorage-based `sk_business_details` workaround in `AdminSettings.tsx` (replaced by proper backend storage).

## Implementation Plan

1. Regenerate Motoko backend with:
   - `getUserRole` returning `#guest` for unregistered principals (no trap)
   - `AppSettings` extended with `gstNumber: Text` and `businessAddress: Text`
   - Default `appSettings` includes `gstNumber = ""` and `businessAddress = ""`
   - All existing types, functions, logic unchanged

2. Update `backend.d.ts` to add `gstNumber` and `businessAddress` to `AppSettings` interface.

3. Update `AdminSettings.tsx`:
   - Remove localStorage `sk_business_details` load/save
   - Read `gstNumber` and `businessAddress` from `settings` (backend)
   - Include them in `buildFullSettings()` return value

4. Update `AdminOrders.tsx` (receipt print):
   - Read `gstNumber` and `businessAddress` from `useAppSettings()` hook
   - Remove localStorage fallback for those fields
