import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AdminUserRecord {
    principal: Principal;
    profile: UserProfile;
}
export interface Coupon {
    id: bigint;
    active: boolean;
    discountValue: number;
    expiryDate: bigint;
    code: string;
    discountType: CouponDiscountType;
    usedCount: bigint;
    usageLimit: bigint;
}
export interface OrderItem {
    quantity: bigint;
    unitPrice: number;
    menuItemId: bigint;
}
export interface DashboardStats {
    totalRevenue: number;
    totalCustomers: bigint;
    activeSubscriptions: bigint;
    todayOrders: bigint;
}
export interface Order {
    id: bigint;
    status: OrderStatus;
    userId: Principal;
    createdAt: bigint;
    totalAmount: number;
    notes?: string;
    items: Array<OrderItem>;
}
export interface AppSettings {
    deliveryCharge: number;
    taxEnabled: boolean;
    businessName: string;
    whatsappNumber: string;
    freeDeliveryAbove: number;
    servicePincodes: Array<string>;
    taxPercentage: number;
}
export interface Subscription {
    id: bigint;
    status: SubscriptionStatus;
    endDate: bigint;
    userId: Principal;
    plan: SubscriptionPlan;
    remainingSalads: bigint;
    totalSalads: bigint;
    startDate: bigint;
}
export interface SaladIngredient {
    quantityRequired: bigint;
    ingredientId: bigint;
    saladId: bigint;
}
export interface MenuItem {
    id: bigint;
    calories: bigint;
    name: string;
    description: string;
    available: boolean;
    imageUrl?: string;
    category: string;
    price: number;
    protein: bigint;
}
export interface OrderDelivery {
    assignedAt?: bigint;
    riderId?: bigint;
    orderId: bigint;
}
export interface DeliveryRider {
    id: bigint;
    name: string;
    available: boolean;
    phone: string;
}
export interface IngredientItem {
    id: bigint;
    lowStockThreshold: bigint;
    name: string;
    unit: string;
    pricePerUnit: number;
    quantity: bigint;
}
export interface UserProfile {
    age: bigint;
    bmi: number;
    weight: number;
    height: number;
    calorieTarget?: bigint;
    dietaryPreferences?: string;
    name: string;
    email: string;
    dietaryRestrictions?: string;
    address?: string;
    gender?: string;
    phone?: string;
}
export enum CouponDiscountType {
    fixed = "fixed",
    percentage = "percentage"
}
export enum OrderStatus {
    preparing = "preparing",
    cancelled = "cancelled",
    pending = "pending",
    outForDelivery = "outForDelivery",
    delivered = "delivered",
    confirmed = "confirmed"
}
export enum SubscriptionPlan {
    monthly = "monthly",
    weekly = "weekly"
}
export enum SubscriptionStatus {
    active = "active",
    cancelled = "cancelled",
    paused = "paused"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCoupon(coupon: Coupon): Promise<void>;
    addDeliveryRider(rider: DeliveryRider): Promise<void>;
    addIngredient(item: IngredientItem): Promise<void>;
    addMenuItem(item: MenuItem): Promise<void>;
    adminCancelSubscription(id: bigint): Promise<void>;
    adminCreateSubscription(userId: Principal, plan: SubscriptionPlan, totalSalads: bigint, remainingSalads: bigint, startDate: bigint, endDate: bigint, status: SubscriptionStatus): Promise<bigint>;
    adminCreateUser(user: Principal, profile: UserProfile): Promise<void>;
    adminDeleteSubscription(id: bigint): Promise<void>;
    adminDeleteUser(user: Principal): Promise<void>;
    adminExtendSubscription(id: bigint, newEndDate: bigint, additionalSalads: bigint): Promise<void>;
    adminGetAllUsers(): Promise<Array<AdminUserRecord>>;
    adminPauseSubscription(id: bigint): Promise<void>;
    adminUpdateSubscription(id: bigint, plan: SubscriptionPlan, totalSalads: bigint, remainingSalads: bigint, startDate: bigint, endDate: bigint, status: SubscriptionStatus): Promise<void>;
    adminUpdateUser(user: Principal, profile: UserProfile): Promise<void>;
    applyCoupon(code: string): Promise<number>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignRiderToOrder(orderId: bigint, riderId: bigint): Promise<void>;
    cancelSubscription(): Promise<void>;
    createOrUpdateProfile(profile: UserProfile): Promise<void>;
    deleteCoupon(id: bigint): Promise<void>;
    deleteIngredient(id: bigint): Promise<void>;
    deleteMenuItem(id: bigint): Promise<void>;
    getActiveCoupons(): Promise<Array<Coupon>>;
    getAllCoupons(): Promise<Array<Coupon>>;
    getAllDeliveryRiders(): Promise<Array<DeliveryRider>>;
    getAllIngredients(): Promise<Array<IngredientItem>>;
    getAllMenuItems(): Promise<Array<MenuItem>>;
    getAllOrderDeliveries(): Promise<Array<OrderDelivery>>;
    getAllOrders(): Promise<Array<Order>>;
    getAllSaladIngredients(): Promise<Array<{
        saladId: bigint;
        ingredients: Array<SaladIngredient>;
    }>>;
    getAllSubscriptions(): Promise<Array<Subscription>>;
    getAppSettings(): Promise<AppSettings>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<DashboardStats>;
    getMenuItemById(id: bigint): Promise<MenuItem | null>;
    getMenuItemsByCategory(category: string): Promise<Array<MenuItem>>;
    getMyOrders(): Promise<Array<Order>>;
    getMyProfile(): Promise<UserProfile | null>;
    getMySubscription(): Promise<Subscription | null>;
    getOrderById(orderId: bigint): Promise<Order | null>;
    getOrderDelivery(orderId: bigint): Promise<OrderDelivery | null>;
    getSaladIngredients(saladId: bigint): Promise<Array<SaladIngredient>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(items: Array<OrderItem>, totalAmount: number, notes: string | null): Promise<bigint>;
    saveAppSettings(settings: AppSettings): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setSaladIngredients(saladId: bigint, ingredientList: Array<SaladIngredient>): Promise<void>;
    subscribeToPlan(plan: SubscriptionPlan): Promise<bigint>;
    toggleAvailability(id: bigint): Promise<void>;
    updateCoupon(coupon: Coupon): Promise<void>;
    updateDeliveryRider(rider: DeliveryRider): Promise<void>;
    updateIngredient(item: IngredientItem): Promise<void>;
    updateMenuItem(item: MenuItem): Promise<void>;
    updateOrderStatus(orderId: bigint, status: OrderStatus): Promise<void>;
}
