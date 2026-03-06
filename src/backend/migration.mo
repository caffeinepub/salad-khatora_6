import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  // COPY DATA STRUCTURES FROM BOTH VERSIONS

  public type UserProfile = {
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

  public type AdminUserRecord = {
    principal : Principal;
    profile : UserProfile;
  };

  public type MenuItem = {
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

  public type OrderItem = {
    menuItemId : Nat;
    quantity : Nat;
    unitPrice : Float;
  };

  public type OrderStatus = {
    #pending;
    #confirmed;
    #preparing;
    #outForDelivery;
    #delivered;
    #cancelled;
  };

  public type Order = {
    id : Nat;
    userId : Principal;
    items : [OrderItem];
    totalAmount : Float;
    status : OrderStatus;
    createdAt : Int;
    notes : ?Text;
  };

  public type SubscriptionPlan = {
    #weekly;
    #monthly;
  };

  public type SubscriptionStatus = {
    #active;
    #paused;
    #cancelled;
  };

  public type Subscription = {
    id : Nat;
    userId : Principal;
    plan : SubscriptionPlan;
    totalSalads : Nat;
    remainingSalads : Nat;
    startDate : Int;
    endDate : Int;
    status : SubscriptionStatus;
  };

  public type IngredientItem = {
    id : Nat;
    name : Text;
    quantity : Nat;
    pricePerUnit : Float;
    lowStockThreshold : Nat;
    unit : Text;
  };

  public type CouponDiscountType = {
    #fixed;
    #percentage;
  };

  public type Coupon = {
    id : Nat;
    code : Text;
    discountType : CouponDiscountType;
    discountValue : Float;
    expiryDate : Int;
    usageLimit : Nat;
    usedCount : Nat;
    active : Bool;
  };

  public type DeliveryRider = {
    id : Nat;
    name : Text;
    phone : Text;
    available : Bool;
  };

  public type OrderDelivery = {
    orderId : Nat;
    riderId : ?Nat;
    riderName : ?Text;
    deliveryStatus : ?Text;
    assignedAt : ?Int;
  };

  public type DashboardStats = {
    todayOrders : Nat;
    totalRevenue : Float;
    activeSubscriptions : Nat;
    totalCustomers : Nat;
  };

  public type SaladIngredient = {
    saladId : Nat;
    ingredientId : Nat;
    quantityRequired : Nat;
  };

  public type OldAppSettings = {
    businessName : Text;
    whatsappNumber : Text;
    taxEnabled : Bool;
    taxPercentage : Float;
    deliveryCharge : Float;
    freeDeliveryAbove : Float;
    servicePincodes : [Text];
  };

  // New AppSettings type
  public type NewAppSettings = {
    businessName : Text;
    whatsappNumber : Text;
    taxEnabled : Bool;
    taxPercentage : Float;
    deliveryCharge : Float;
    freeDeliveryAbove : Float;
    servicePincodes : [Text];
    gstNumber : Text;
    businessAddress : Text;
  };

  public type OldActor = {
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
    appSettings : OldAppSettings;
  };

  public type NewActor = {
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
    appSettings : NewAppSettings;
  };

  public func run(old : OldActor) : NewActor {
    let newAppSettings : NewAppSettings = {
      old.appSettings with
      gstNumber = "";
      businessAddress = "";
    };

    { old with appSettings = newAppSettings };
  };
};
