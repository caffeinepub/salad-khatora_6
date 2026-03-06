import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  // Type definitions matching the main actor's state
  type UserProfile = {
    name : Text;
    mobileNumber : Text;
    email : ?Text;
    age : ?Nat;
    weight : ?Float;
    height : ?Float;
    bmi : ?Float;
    address : ?Text;
    gender : ?Text;
    dietaryPreferences : ?Text;
    dietaryRestrictions : ?Text;
    idealWeight : ?Float;
    dailyCalories : ?Nat;
  };

  type AdminUserRecord = {
    principal : Principal;
    profile : UserProfile;
  };

  type MenuItem = {
    id : Nat;
    name : Text;
    description : Text;
    price : Float;
    category : Text;
    calories : Nat;
    available : Bool;
    protein : Nat;
    imageUrl : ?Text;
  };

  type OrderItem = {
    menuItemId : Nat;
    quantity : Nat;
    unitPrice : Float;
  };

  type OrderStatus = {
    #pending;
    #confirmed;
    #preparing;
    #outForDelivery;
    #delivered;
    #cancelled;
  };

  type Order = {
    id : Nat;
    userId : Principal;
    items : [OrderItem];
    totalAmount : Float;
    status : OrderStatus;
    createdAt : Int;
    notes : ?Text;
  };

  type SubscriptionPlan = {
    #weekly;
    #monthly;
  };

  type SubscriptionStatus = {
    #active;
    #paused;
    #cancelled;
  };

  type Subscription = {
    id : Nat;
    userId : Principal;
    plan : SubscriptionPlan;
    totalSalads : Nat;
    remainingSalads : Nat;
    startDate : Int;
    endDate : Int;
    status : SubscriptionStatus;
  };

  type IngredientItem = {
    id : Nat;
    name : Text;
    quantity : Nat;
    pricePerUnit : Float;
    lowStockThreshold : Nat;
    unit : Text;
  };

  type CouponDiscountType = {
    #fixed;
    #percentage;
  };

  type Coupon = {
    id : Nat;
    code : Text;
    discountType : CouponDiscountType;
    discountValue : Float;
    expiryDate : Int;
    usageLimit : Nat;
    usedCount : Nat;
    active : Bool;
  };

  type DeliveryRider = {
    id : Nat;
    name : Text;
    phone : Text;
    available : Bool;
  };

  type OrderDelivery = {
    orderId : Nat;
    riderId : ?Nat;
    riderName : ?Text;
    deliveryStatus : ?Text;
    assignedAt : ?Int;
  };

  type DashboardStats = {
    todayOrders : Nat;
    totalRevenue : Float;
    activeSubscriptions : Nat;
    totalCustomers : Nat;
  };

  type SaladIngredient = {
    saladId : Nat;
    ingredientId : Nat;
    quantityRequired : Nat;
  };

  type AppSettings = {
    businessName : Text;
    whatsappNumber : Text;
    taxEnabled : Bool;
    taxPercentage : Float;
    deliveryCharge : Float;
    freeDeliveryAbove : Float;
    servicePincodes : [Text];
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    menuItems : Map.Map<Nat, MenuItem>;
    orders : Map.Map<Nat, Order>;
    subscriptions : Map.Map<Nat, Subscription>;
    ingredients : Map.Map<Nat, IngredientItem>;
    coupons : Map.Map<Nat, Coupon>;
    deliveryRiders : Map.Map<Nat, DeliveryRider>;
    orderDeliveries : Map.Map<Nat, OrderDelivery>;
    saladIngredients : Map.Map<Nat, [SaladIngredient]>;
    nextSubscriptionId : Nat;
    appSettings : AppSettings;
  };

  public func run(old : OldActor) : OldActor {
    old;
  };
};
