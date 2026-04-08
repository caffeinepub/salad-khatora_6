import type { Principal } from "@icp-sdk/core/principal";
import type {
  CouponDiscountType,
  OrderStatus,
  ReviewStatus,
  SubscriptionPlan,
  SubscriptionStatus,
} from "./enums";

// ─── Shared Types from Motoko Backend ─────────────────────────────────────────

export type { Principal };

// Re-export enums so they can be imported from this file too
export type {
  OrderStatus,
  SubscriptionStatus,
  ReviewStatus,
  CouponDiscountType,
  SubscriptionPlan,
};

export interface UserProfile {
  name: string;
  mobileNumber: string;
  email?: string | null;
  age?: bigint | null;
  weight?: number | null;
  height?: number | null;
  bmi?: number | null;
  address?: string | null;
  gender?: string | null;
  dietaryPreferences?: string | null;
  dietaryRestrictions?: string | null;
  idealWeight?: number | null;
  dailyCalories?: bigint | null;
}

export interface AdminUserRecord {
  principal: Principal;
  profile: UserProfile;
}

export interface MenuItem {
  id: bigint;
  name: string;
  description: string;
  price: number;
  category: string;
  calories: bigint;
  available: boolean;
  protein: bigint;
  imageUrl?: string | null;
}

export interface OrderItem {
  menuItemId: bigint;
  quantity: bigint;
  unitPrice: number;
}

export interface Order {
  id: bigint;
  userId: Principal;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: bigint;
  notes?: string | null;
}

export interface Subscription {
  id: bigint;
  userId: Principal;
  plan: SubscriptionPlan;
  totalSalads: bigint;
  remainingSalads: bigint;
  startDate: bigint;
  endDate: bigint;
  status: SubscriptionStatus;
}

export interface IngredientItem {
  id: bigint;
  name: string;
  quantity: bigint;
  pricePerUnit: number;
  lowStockThreshold: bigint;
  unit: string;
}

export interface Coupon {
  id: bigint;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  expiryDate: bigint;
  usageLimit: bigint;
  usedCount: bigint;
  active: boolean;
}

export interface DeliveryRider {
  id: bigint;
  name: string;
  phone: string;
  available: boolean;
}

export interface OrderDelivery {
  orderId: bigint;
  riderId?: bigint | null;
  riderName?: string | null;
  deliveryStatus?: string | null;
  assignedAt?: bigint | null;
}

export interface DashboardStats {
  todayOrders: bigint;
  totalRevenue: number;
  activeSubscriptions: bigint;
  totalCustomers: bigint;
}

export interface SaladIngredient {
  saladId: bigint;
  ingredientId: bigint;
  quantityRequired: bigint;
}

export interface AppSettings {
  businessName: string;
  whatsappNumber: string;
  taxEnabled: boolean;
  taxPercentage: number;
  deliveryCharge: number;
  freeDeliveryAbove: number;
  servicePincodes: string[];
  gstNumber: string;
  businessAddress: string;
}

export interface Review {
  id: bigint;
  userId?: Principal | null;
  reviewerName: string;
  profession?: string | null;
  rating: bigint;
  reviewText: string;
  status: ReviewStatus;
  createdAt: bigint;
}
