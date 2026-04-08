import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface IngredientItem {
    id: bigint;
    lowStockThreshold: bigint;
    name: string;
    unit: string;
    pricePerUnit: number;
    quantity: bigint;
}
export interface BowlSize {
    id: bigint;
    name: string;
    createdAt: bigint;
    maxDressings: bigint;
    isActive: boolean;
    maxProteins: bigint;
    maxVegetables: bigint;
    baseWeightG: bigint;
    basePriceRs: number;
}
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
export interface SubscriptionPlanTemplate {
    id: bigint;
    saladCount: bigint;
    durationType: DurationType;
    features: Array<string>;
    active: boolean;
    deliveryFrequency: DeliveryFrequency;
    name: string;
    badge?: string;
    price: number;
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
export interface DashboardStats {
    totalRevenue: number;
    totalCustomers: bigint;
    activeSubscriptions: bigint;
    todayOrders: bigint;
}
export interface AppSettings {
    deliveryCharge: number;
    taxEnabled: boolean;
    gstNumber: string;
    businessName: string;
    businessAddress: string;
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
    deliveryStatus?: string;
    orderId: bigint;
    riderName?: string;
}
export interface BowlIngredient {
    id: bigint;
    imageData?: string;
    inventoryItemId?: bigint;
    calories: bigint;
    name: string;
    createdAt: bigint;
    isActive: boolean;
    weightG: bigint;
    priceRs: number;
    category: BowlIngredientCategory;
}
export interface DeliveryRider {
    id: bigint;
    name: string;
    available: boolean;
    phone: string;
}
export interface UserProfile {
    age?: bigint;
    bmi?: number;
    weight?: number;
    height?: number;
    dietaryPreferences?: string;
    name: string;
    mobileNumber: string;
    email?: string;
    dietaryRestrictions?: string;
    address?: string;
    idealWeight?: number;
    gender?: string;
    dailyCalories?: bigint;
}
export interface Review {
    id: bigint;
    status: ReviewStatus;
    userId?: Principal;
    createdAt: bigint;
    profession?: string;
    reviewText: string;
    reviewerName: string;
    rating: bigint;
}
export enum BowlIngredientCategory {
    base = "base",
    dressing = "dressing",
    vegetable = "vegetable",
    protein = "protein"
}
export enum CouponDiscountType {
    fixed = "fixed",
    percentage = "percentage"
}
export enum DeliveryFrequency {
    daily = "daily",
    weekly = "weekly"
}
export enum DurationType {
    monthly = "monthly",
    weekly = "weekly"
}
export enum OrderStatus {
    preparing = "preparing",
    cancelled = "cancelled",
    pending = "pending",
    outForDelivery = "outForDelivery",
    delivered = "delivered",
    confirmed = "confirmed"
}
export enum ReviewStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
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
    adminDeleteReview(id: bigint): Promise<void>;
    adminDeleteSubscription(id: bigint): Promise<void>;
    adminDeleteUser(user: Principal): Promise<void>;
    adminExtendSubscription(id: bigint, newEndDate: bigint, additionalSalads: bigint): Promise<void>;
    adminGetAllReviews(): Promise<Array<Review>>;
    adminGetAllUsers(): Promise<Array<AdminUserRecord>>;
    adminPauseSubscription(id: bigint): Promise<void>;
    adminUpdateReview(id: bigint, status: ReviewStatus, profession: string | null): Promise<void>;
    adminUpdateSubscription(id: bigint, plan: SubscriptionPlan, totalSalads: bigint, remainingSalads: bigint, startDate: bigint, endDate: bigint, status: SubscriptionStatus): Promise<void>;
    adminUpdateUser(user: Principal, profile: UserProfile): Promise<void>;
    applyCoupon(code: string): Promise<number>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignRiderToOrder(orderId: bigint, riderId: bigint): Promise<void>;
    cancelSubscription(): Promise<void>;
    createBowlIngredient(name: string, category: BowlIngredientCategory, priceRs: number, weightG: bigint, calories: bigint, inventoryItemId: bigint | null, imageData: string | null): Promise<bigint>;
    createBowlSize(name: string, basePriceRs: number, baseWeightG: bigint, maxVegetables: bigint, maxProteins: bigint, maxDressings: bigint): Promise<bigint>;
    createOrUpdateProfile(profile: UserProfile): Promise<void>;
    createSubscriptionPlanTemplate(name: string, durationType: DurationType, saladCount: bigint, price: number, deliveryFrequency: DeliveryFrequency, features: Array<string>, badge: string | null): Promise<bigint>;
    deleteBowlIngredient(id: bigint): Promise<void>;
    deleteBowlSize(id: bigint): Promise<void>;
    deleteCoupon(id: bigint): Promise<void>;
    deleteIngredient(id: bigint): Promise<void>;
    deleteMenuItem(id: bigint): Promise<void>;
    deleteSubscriptionPlanTemplate(id: bigint): Promise<void>;
    getActiveCoupons(): Promise<Array<Coupon>>;
    getActiveSubscriptionPlanTemplates(): Promise<Array<SubscriptionPlanTemplate>>;
    getAllBowlIngredients(): Promise<Array<BowlIngredient>>;
    getAllBowlSizes(): Promise<Array<BowlSize>>;
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
    getAllSubscriptionPlanTemplates(): Promise<Array<SubscriptionPlanTemplate>>;
    getAllSubscriptions(): Promise<Array<Subscription>>;
    getAppSettings(): Promise<AppSettings>;
    getApprovedReviews(): Promise<Array<Review>>;
    getBowlIngredientsByCategory(category: BowlIngredientCategory): Promise<Array<BowlIngredient>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<DashboardStats>;
    getMenuItemById(id: bigint): Promise<MenuItem | null>;
    getMenuItemsByCategory(category: string): Promise<Array<MenuItem>>;
    getMyOrders(): Promise<Array<Order>>;
    getMyProfile(): Promise<UserProfile | null>;
    getMySubscription(): Promise<Subscription | null>;
    getNextReviewId(): Promise<bigint>;
    getOrderById(orderId: bigint): Promise<Order | null>;
    getOrderDelivery(orderId: bigint): Promise<OrderDelivery | null>;
    getReviewCount(): Promise<bigint>;
    getSaladIngredients(saladId: bigint): Promise<Array<SaladIngredient>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(items: Array<OrderItem>, totalAmount: number, notes: string | null): Promise<bigint>;
    saveAppSettings(settings: AppSettings): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setSaladIngredients(saladId: bigint, ingredientList: Array<SaladIngredient>): Promise<void>;
    submitReview(reviewerName: string, profession: string | null, rating: bigint, reviewText: string): Promise<bigint>;
    subscribeToPlan(plan: SubscriptionPlan): Promise<bigint>;
    subscribeToPlanTemplate(templateId: bigint): Promise<bigint>;
    toggleAvailability(id: bigint): Promise<void>;
    toggleBowlIngredientStatus(id: bigint): Promise<void>;
    toggleBowlSizeStatus(id: bigint): Promise<void>;
    toggleSubscriptionPlanTemplateStatus(id: bigint): Promise<void>;
    updateBowlIngredient(id: bigint, name: string, category: BowlIngredientCategory, priceRs: number, weightG: bigint, calories: bigint, inventoryItemId: bigint | null, imageData: string | null): Promise<void>;
    updateBowlSize(id: bigint, name: string, basePriceRs: number, baseWeightG: bigint, maxVegetables: bigint, maxProteins: bigint, maxDressings: bigint): Promise<void>;
    updateCoupon(coupon: Coupon): Promise<void>;
    updateDeliveryRider(rider: DeliveryRider): Promise<void>;
    updateDeliveryStatus(orderId: bigint, deliveryStatus: string): Promise<void>;
    updateIngredient(item: IngredientItem): Promise<void>;
    updateMenuItem(item: MenuItem): Promise<void>;
    updateOrderStatus(orderId: bigint, status: OrderStatus): Promise<void>;
    updateSubscriptionPlanTemplate(id: bigint, name: string, durationType: DurationType, saladCount: bigint, price: number, deliveryFrequency: DeliveryFrequency, features: Array<string>, badge: string | null, active: boolean): Promise<void>;
}
