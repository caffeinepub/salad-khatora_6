// Enum-like constants matching Motoko variant types
// These are used as object enum patterns: OrderStatus.pending, etc.

export const OrderStatus = {
  pending: "pending" as const,
  confirmed: "confirmed" as const,
  preparing: "preparing" as const,
  outForDelivery: "outForDelivery" as const,
  delivered: "delivered" as const,
  cancelled: "cancelled" as const,
};
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const SubscriptionStatus = {
  active: "active" as const,
  paused: "paused" as const,
  cancelled: "cancelled" as const,
};
export type SubscriptionStatus =
  (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const ReviewStatus = {
  pending: "pending" as const,
  approved: "approved" as const,
  rejected: "rejected" as const,
};
export type ReviewStatus = (typeof ReviewStatus)[keyof typeof ReviewStatus];

export const CouponDiscountType = {
  fixed: "fixed" as const,
  percentage: "percentage" as const,
};
export type CouponDiscountType =
  (typeof CouponDiscountType)[keyof typeof CouponDiscountType];

export const SubscriptionPlan = {
  weekly: "weekly" as const,
  monthly: "monthly" as const,
};
export type SubscriptionPlan =
  (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];
