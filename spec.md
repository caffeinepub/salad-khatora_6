# Salad Khatora

## Current State

Phase 1 & 2 are live:
- Customer app with Internet Identity login
- User profile with health metrics & BMI calculator
- Menu browsing and cart
- Order placement and history
- Real-time order status tracker (5-second polling)
- Subscription plans (Weekly 6 salads / Monthly 24 salads)
- WhatsApp support button

Backend has: UserProfile, MenuItem, Order, Subscription, OrderStatus, SubscriptionPlan, SubscriptionStatus types.
Admin-gated endpoints exist: addMenuItem, updateMenuItem, toggleAvailability, getAllOrders, updateOrderStatus, getAllSubscriptions.
Authorization via MixinAuthorization (role-based: admin/user/guest).

## Requested Changes (Diff)

### Add

**Backend:**
- `IngredientItem` type: id, name, quantity (Nat), pricePerUnit (Float), lowStockThreshold (Nat), unit (Text)
- `Coupon` type: id, code (Text), discountType (#fixed / #percentage), discountValue (Float), expiryDate (Int), usageLimit (Nat), usedCount (Nat), active (Bool)
- `DeliveryRider` type: id, name (Text), phone (Text), available (Bool)
- `OrderDelivery` type: orderId (Nat), riderId (?Nat), status (OrderStatus extended with #outForDelivery), assignedAt (?Int)
- Admin endpoints: addIngredient, updateIngredient, deleteIngredient, getAllIngredients
- Admin endpoints: addCoupon, updateCoupon, deleteCoupon, getAllCoupons
- Admin endpoints: addDeliveryRider, updateDeliveryRider, getAllDeliveryRiders
- Admin endpoints: assignRiderToOrder, getOrderDelivery
- Admin endpoint: getDashboardStats returning { todayOrders, totalRevenue, activeSubscriptions, totalCustomers }
- User endpoint: applyCoupon(code) -> returns discount amount or error
- Extend OrderStatus to include #outForDelivery

**Frontend:**
- Admin Panel at `/admin` route (protected, only accessible to admins)
- Admin layout with sidebar navigation: Dashboard, Orders, Customers, Subscriptions, Inventory, Coupons, Delivery
- Dashboard page: stat cards (today's orders, total revenue, active subscriptions, total customers)
- Orders page: table of all orders with status update controls and rider assignment
- Customers page: list of all registered customers with their profile details
- Subscriptions page: table of all subscriptions with status
- Inventory page: add/edit/delete ingredients with low-stock alerts
- Coupons page: create/edit/delete coupons (fixed & percentage, expiry, usage limit)
- Delivery page: manage delivery riders (add/edit) and assign riders to orders

### Modify

- `OrderStatus` extended with `#outForDelivery` variant
- Customer order status tracker updated to show "Out for Delivery" step
- Navigation: add "Admin" link visible only to admin users

### Remove

Nothing removed.

## Implementation Plan

1. Regenerate Motoko backend with new types and endpoints (IngredientItem, Coupon, DeliveryRider, OrderDelivery, getDashboardStats, applyCoupon, all CRUD endpoints)
2. Build Admin Panel frontend:
   - `/admin` protected route with admin check
   - Admin layout with sidebar (Dashboard, Orders, Customers, Subscriptions, Inventory, Coupons, Delivery)
   - Dashboard stats page
   - Orders management with status update + rider assignment
   - Customers list page
   - Subscriptions management
   - Inventory CRUD with low-stock alerts
   - Coupons CRUD (fixed & percentage)
   - Delivery riders CRUD + assignment
3. Update Navigation to show Admin link for admin users
4. Update customer OrdersPage to include "Out for Delivery" step in tracker
