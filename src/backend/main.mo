import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Time "mo:core/Time";
import Char "mo:core/Char";
import Nat32 "mo:core/Nat32";


import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

// MIGRATION: Keep this with clause for main actor!

actor {
  /////////////////////
  // CONSTANTS       //
  /////////////////////
  public type Currency = ?{
    #inr : Float;
    #eur : Float;
    #usd : Float;
  };

  /////////////////////
  // TYPES           //
  /////////////////////

  // User Profile (Updated)
  public type UserProfile = {
    name : Text;
    mobileNumber : Text;
    email : ?Text;
    age : ?Nat;
    weight : ?Float; // in kg, made optional
    height : ?Float; // in cm, made optional
    bmi : ?Float; // made optional
    address : ?Text;
    gender : ?Text;
    dietaryPreferences : ?Text;
    dietaryRestrictions : ?Text;
    idealWeight : ?Float; // New field - optional
    dailyCalories : ?Nat; // New field - optional
  };

  // Admin User Record Type (Updated to use new UserProfile)
  public type AdminUserRecord = {
    principal : Principal;
    profile : UserProfile;
  };

  // Menu Item
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

  // Order Item
  public type OrderItem = {
    menuItemId : Nat;
    quantity : Nat;
    unitPrice : Float;
  };

  // Order Status
  public type OrderStatus = {
    #pending;
    #confirmed;
    #preparing;
    #outForDelivery;
    #delivered;
    #cancelled;
  };

  // Order
  public type Order = {
    id : Nat;
    userId : Principal;
    items : [OrderItem];
    totalAmount : Float;
    status : OrderStatus;
    createdAt : Int;
    notes : ?Text;
  };

  // Subscription Plan
  public type SubscriptionPlan = {
    #weekly;
    #monthly;
  };

  // Subscription Status
  public type SubscriptionStatus = {
    #active;
    #paused;
    #cancelled;
  };

  // Subscription
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

  // Ingredient Item
  public type IngredientItem = {
    id : Nat;
    name : Text;
    quantity : Nat;
    pricePerUnit : Float;
    lowStockThreshold : Nat;
    unit : Text;
  };

  // Coupon Discount Type
  public type CouponDiscountType = {
    #fixed;
    #percentage;
  };

  // Coupon
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

  // Delivery Rider
  public type DeliveryRider = {
    id : Nat;
    name : Text;
    phone : Text;
    available : Bool;
  };

  // NEW Order Delivery
  public type OrderDelivery = {
    orderId : Nat;
    riderId : ?Nat;
    riderName : ?Text;
    deliveryStatus : ?Text;
    assignedAt : ?Int;
  };

  // Dashboard Stats
  public type DashboardStats = {
    todayOrders : Nat;
    totalRevenue : Float;
    activeSubscriptions : Nat;
    totalCustomers : Nat;
  };

  // Salad Ingredient mapping
  public type SaladIngredient = {
    saladId : Nat;
    ingredientId : Nat;
    quantityRequired : Nat;
  };

  // App Settings
  public type AppSettings = {
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

  // Review Status
  public type ReviewStatus = {
    #pending;
    #approved;
    #rejected;
  };

  // Review Type
  public type Review = {
    id : Nat;
    userId : ?Principal;
    reviewerName : Text;
    profession : ?Text;
    rating : Nat;
    reviewText : Text;
    status : ReviewStatus;
    createdAt : Int;
  };

  // Subscription Plan Template
  public type DurationType = {
    #weekly;
    #monthly;
  };

  public type DeliveryFrequency = {
    #daily;
    #weekly;
  };

  public type SubscriptionPlanTemplate = {
    id : Nat;
    name : Text;
    durationType : DurationType;
    saladCount : Nat;
    price : Float;
    deliveryFrequency : DeliveryFrequency;
    features : [Text];
    badge : ?Text;
    active : Bool;
  };
  // Bowl Ingredient Category
  public type BowlIngredientCategory = {
    #base;
    #vegetable;
    #protein;
    #dressing;
  };

  // Bowl Ingredient
  public type BowlIngredient = {
    id : Nat;
    name : Text;
    category : BowlIngredientCategory;
    priceRs : Float;
    weightG : Nat;
    calories : Nat;
    inventoryItemId : ?Nat;
    imageData : ?Text;
    isActive : Bool;
    createdAt : Int;
  };

  // Bowl Size
  public type BowlSize = {
    id : Nat;
    name : Text;
    basePriceRs : Float;
    baseWeightG : Nat;
    maxVegetables : Nat;
    maxProteins : Nat;
    maxDressings : Nat;
    isActive : Bool;
    createdAt : Int;
  };

  /////////////////////
  // STATE           //
  /////////////////////

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  /////////////////////////////
  // STABLE BACKING STORAGE  //
  /////////////////////////////

  stable var stableUserProfiles : [(Principal, UserProfile)] = [];
  stable var stableMenuItems : [(Nat, MenuItem)] = [];
  stable var stableOrders : [(Nat, Order)] = [];
  stable var stableSubscriptions : [(Nat, Subscription)] = [];
  stable var stableIngredients : [(Nat, IngredientItem)] = [];
  stable var stableCoupons : [(Nat, Coupon)] = [];
  stable var stableDeliveryRiders : [(Nat, DeliveryRider)] = [];
  stable var stableOrderDeliveries : [(Nat, OrderDelivery)] = [];
  stable var stableSaladIngredients : [(Nat, [SaladIngredient])] = [];
  stable var stableSubscriptionPlanTemplates : [(Nat, SubscriptionPlanTemplate)] = [];
  stable var stableReviews : [(Nat, Review)] = [];
  stable var stableBowlIngredients : [(Nat, BowlIngredient)] = [];
  stable var stableBowlSizes : [(Nat, BowlSize)] = [];

  stable var stableNextSubscriptionId : Nat = 1;
  stable var stableNextPlanTemplateId : Nat = 1;
  stable var stableNextReviewId : Nat = 1;
  stable var stableNextBowlIngredientId : Nat = 1;
  stable var stableNextBowlSizeId : Nat = 1;
  stable var stablePlanTemplatesSeeded : Bool = false;
  stable var stableBowlIngredientsSeeded : Bool = false;
  stable var stableBowlSizesSeeded : Bool = false;

  stable var stableAppSettings : AppSettings = {
    businessName = "Salad Khatora";
    whatsappNumber = "7660005766";
    taxEnabled = false;
    taxPercentage = 5.0;
    deliveryCharge = 30.0;
    freeDeliveryAbove = 500.0;
    servicePincodes = [];
    gstNumber = "";
    businessAddress = "";
  };

  /////////////////////////////
  // RUNTIME MAPS (restored) //
  /////////////////////////////

  let userProfiles = Map.fromIter<Principal, UserProfile>(stableUserProfiles.vals());
  let menuItems = Map.fromIter<Nat, MenuItem>(stableMenuItems.vals());
  let orders = Map.fromIter<Nat, Order>(stableOrders.vals());
  let subscriptions = Map.fromIter<Nat, Subscription>(stableSubscriptions.vals());
  let ingredients = Map.fromIter<Nat, IngredientItem>(stableIngredients.vals());
  let coupons = Map.fromIter<Nat, Coupon>(stableCoupons.vals());
  let deliveryRiders = Map.fromIter<Nat, DeliveryRider>(stableDeliveryRiders.vals());
  let orderDeliveries = Map.fromIter<Nat, OrderDelivery>(stableOrderDeliveries.vals());
  let saladIngredients = Map.fromIter<Nat, [SaladIngredient]>(stableSaladIngredients.vals());
  let subscriptionPlanTemplates = Map.fromIter<Nat, SubscriptionPlanTemplate>(stableSubscriptionPlanTemplates.vals());
  let reviews = Map.fromIter<Nat, Review>(stableReviews.vals());
  let bowlIngredients = Map.fromIter<Nat, BowlIngredient>(stableBowlIngredients.vals());
  let bowlSizes = Map.fromIter<Nat, BowlSize>(stableBowlSizes.vals());

  var nextSubscriptionId = stableNextSubscriptionId;
  var nextPlanTemplateId : Nat = stableNextPlanTemplateId;
  var planTemplatesSeeded : Bool = stablePlanTemplatesSeeded;
  var nextReviewId : Nat = stableNextReviewId;
  var nextBowlIngredientId : Nat = stableNextBowlIngredientId;
  var bowlIngredientsSeeded : Bool = stableBowlIngredientsSeeded;
  var nextBowlSizeId : Nat = stableNextBowlSizeId;
  var bowlSizesSeeded : Bool = stableBowlSizesSeeded;

  var appSettings : AppSettings = stableAppSettings;

  ///////////////////////
  // REVIEWS           //
  ///////////////////////

  public shared ({ caller }) func submitReview(
    reviewerName : Text,
    profession : ?Text,
    rating : Nat,
    reviewText : Text,
  ) : async Nat {
    if (reviewerName == "") {
      Runtime.trap("Reviewer name cannot be empty");
    };
    if (reviewText == "") {
      Runtime.trap("Review text cannot be empty");
    };

    if (reviewText != "" and reviewText.size() < 10) {
      Runtime.trap("Review text must be at least 10 characters");
    };

    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    let reviewId = nextReviewId;
    nextReviewId += 1;

    let review = {
      id = reviewId;
      userId = ?caller;
      reviewerName;
      profession;
      rating;
      reviewText;
      status = #pending;
      createdAt = Time.now();
    };

    reviews.add(reviewId, review);
    reviewId;
  };

  public query func getApprovedReviews() : async [Review] {
    reviews.toArray().map(func((_, review)) { review }).filter(func(r) { r.status == #approved });
  };

  public query ({ caller }) func adminGetAllReviews() : async [Review] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all reviews");
    };
    reviews.toArray().map(func((_, review)) { review });
  };

  public shared ({ caller }) func adminUpdateReview(
    id : Nat,
    status : ReviewStatus,
    profession : ?Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update reviews");
    };

    switch (reviews.get(id)) {
      case (null) { Runtime.trap("Review not found") };
      case (?review) {
        let updatedReview = { review with status; profession };
        reviews.add(id, updatedReview);
      };
    };
  };

  public shared ({ caller }) func adminDeleteReview(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete reviews");
    };

    switch (reviews.get(id)) {
      case (null) { Runtime.trap("Review not found") };
      case (?_) {
        reviews.remove(id);
      };
    };
  };

  public query func getReviewCount() : async Int {
    reviews.size();
  };

  public query func getNextReviewId() : async Int {
    nextReviewId;
  };

  ///////////////////////
  // APP SETTINGS      //
  ///////////////////////

  public query ({ caller }) func getAppSettings() : async AppSettings {
    appSettings;
  };

  public shared ({ caller }) func saveAppSettings(settings : AppSettings) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update app settings");
    };
    appSettings := settings;
    stableAppSettings := settings;
  };

  ///////////////////////
  // SALAD INGREDIENTS //
  ///////////////////////

  public shared ({ caller }) func setSaladIngredients(saladId : Nat, ingredientList : [SaladIngredient]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set salad ingredients");
    };
    saladIngredients.add(saladId, ingredientList);
  };

  public query ({ caller }) func getSaladIngredients(saladId : Nat) : async [SaladIngredient] {
    switch (saladIngredients.get(saladId)) {
      case (null) { [] };
      case (?ingredients) { ingredients };
    };
  };

  public query ({ caller }) func getAllSaladIngredients() : async [{ saladId : Nat; ingredients : [SaladIngredient] }] {
    saladIngredients.toArray().map(
      func((saladId, ingredients)) {
        { saladId; ingredients };
      }
    );
  };

  /////////////////////
  // USER PROFILES   //
  /////////////////////

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func adminGetAllUsers() : async [AdminUserRecord] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all user profiles");
    };
    let allUsers = userProfiles.toArray();
    allUsers.map(
      func(entry) {
        let (principal, profile) = entry;
        { principal; profile };
      }
    );
  };

  public shared ({ caller }) func adminCreateUser(user : Principal, profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can create user profiles for others");
    };
    userProfiles.add(user, profile);
  };

  public shared ({ caller }) func adminUpdateUser(user : Principal, profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update user profiles for others");
    };
    switch (userProfiles.get(user)) {
      case (null) {
        Runtime.trap("User profile does not exist. Use adminCreateUser instead.");
      };
      case (?_) {
        userProfiles.add(user, profile);
      };
    };
  };

  public shared ({ caller }) func adminDeleteUser(user : Principal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete user profiles");
    };
    switch (userProfiles.get(user)) {
      case (null) {
        Runtime.trap("User profile does not exist");
      };
      case (?_) {
        userProfiles.remove(user);
      };
    };
  };

  public shared ({ caller }) func createOrUpdateProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getMyProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  /////////////////////
  // MENU ITEMS      //
  /////////////////////

  public query func getAllMenuItems() : async [MenuItem] {
    let items = menuItems.values().toArray();
    items.sort(
      func(a, b) { Nat.compare(a.id, b.id) }
    );
  };

  public query func getMenuItemById(id : Nat) : async ?MenuItem {
    menuItems.get(id);
  };

  public query func getMenuItemsByCategory(category : Text) : async [MenuItem] {
    let allItems = menuItems.values().toArray();
    let filtered = allItems.filter(
      func(item) { item.category == category }
    );
    filtered.sort(
      func(a, b) { Nat.compare(a.id, b.id) }
    );
  };

  public shared ({ caller }) func addMenuItem(item : MenuItem) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add menu items");
    };
    menuItems.add(item.id, item);
  };

  public shared ({ caller }) func updateMenuItem(item : MenuItem) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update menu items");
    };
    menuItems.add(item.id, item);
  };

  public shared ({ caller }) func deleteMenuItem(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete menu items");
    };
    switch (menuItems.get(id)) {
      case (null) { Runtime.trap("Menu item not found") };
      case (?_) {
        menuItems.remove(id);
      };
    };
  };

  public shared ({ caller }) func toggleAvailability(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can toggle availability");
    };
    switch (menuItems.get(id)) {
      case (null) { Runtime.trap("Menu item not found") };
      case (?item) {
        menuItems.add(id, { item with available = not item.available });
      };
    };
  };

  /////////////////////
  // ORDERS          //
  /////////////////////

  public shared ({ caller }) func placeOrder(items : [OrderItem], totalAmount : Float, notes : ?Text) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    let orderId = orders.size() + 1;
    let order : Order = {
      id = orderId;
      userId = caller;
      items;
      totalAmount;
      status = #pending;
      createdAt = Time.now();
      notes;
    };

    for (item in items.values()) {
      switch (saladIngredients.get(item.menuItemId)) {
        case (null) {};
        case (?saladIngredientMappings) {
          for (mapping in saladIngredientMappings.values()) {
            switch (ingredients.get(mapping.ingredientId)) {
              case (null) {
                Runtime.trap("Ingredient not found: " # mapping.ingredientId.toText());
              };
              case (?ingredient) {
                let totalNeeded = mapping.quantityRequired * item.quantity;
                if (ingredient.quantity < totalNeeded) {
                  Runtime.trap("Insufficient stock for ingredient: " # ingredient.name);
                };
              };
            };
          };
        };
      };
    };

    for (item in items.values()) {
      switch (saladIngredients.get(item.menuItemId)) {
        case (null) {};
        case (?saladIngredientMappings) {
          for (mapping in saladIngredientMappings.values()) {
            switch (ingredients.get(mapping.ingredientId)) {
              case (null) { () };
              case (?ingredient) {
                let totalNeeded = mapping.quantityRequired * item.quantity;
                let newIngredient : IngredientItem = {
                  ingredient with quantity = ingredient.quantity - totalNeeded;
                };
                ingredients.add(mapping.ingredientId, newIngredient);
              };
            };
          };
        };
      };
    };

    orders.add(orderId, order);
    orderId;
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    let allOrders = orders.values().toArray();
    allOrders.filter(
      func(order) { order.userId == caller }
    );
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : OrderStatus) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        // Deduct bowl inventory when order transitions to confirmed or preparing (only once)
        let wasNotConfirmedOrPreparing = switch (order.status) {
          case (#confirmed) { false };
          case (#preparing) { false };
          case (_) { true };
        };
        let isNowConfirmedOrPreparing = switch (status) {
          case (#confirmed) { true };
          case (#preparing) { true };
          case (_) { false };
        };
        if (wasNotConfirmedOrPreparing and isNowConfirmedOrPreparing) {
          deductBowlInventoryForOrder(order);
        };
        orders.add(orderId, { order with status });
      };
    };
  };

  public query ({ caller }) func getOrderById(orderId : Nat) : async ?Order {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    switch (orders.get(orderId)) {
      case (null) { null };
      case (?order) {
        if (order.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        ?order;
      };
    };
  };

  ////////////////////////////
  // SUBSCRIPTIONS          //
  ////////////////////////////

  let WEEKLY_SALADS = 6;
  let MONTHLY_SALADS = 24;

  let WEEK_DURATION_NANOS : Int = 7 * 24 * 60 * 60 * 1_000_000_000;
  let MONTH_DURATION_NANOS : Int = 30 * 24 * 60 * 60 * 1_000_000_000;

  public shared ({ caller }) func subscribeToPlan(plan : SubscriptionPlan) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can subscribe");
    };

    let active = subscriptions.values().find(
      func(sub) { sub.userId == caller and sub.status == #active }
    );

    switch (active) {
      case (?sub) {
        let updated = { sub with status = #cancelled : SubscriptionStatus };
        subscriptions.add(sub.id, updated);
      };
      case (null) {};
    };

    let subId = nextSubscriptionId;
    nextSubscriptionId += 1;
    let now = Time.now();

    let (totalSalads, endDate) = switch (plan) {
      case (#weekly) { (WEEKLY_SALADS, now + WEEK_DURATION_NANOS) };
      case (#monthly) { (MONTHLY_SALADS, now + MONTH_DURATION_NANOS) };
    };

    let newSub : Subscription = {
      id = subId;
      userId = caller;
      plan;
      totalSalads;
      remainingSalads = totalSalads;
      startDate = now;
      endDate;
      status = #active;
    };

    subscriptions.add(subId, newSub);
    subId;
  };

  public query ({ caller }) func getMySubscription() : async ?Subscription {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view subscriptions");
    };

    let allSubs = subscriptions.values().toArray();
    let userSubs = allSubs.filter(func(sub) { sub.userId == caller });

    if (userSubs.size() == 0) {
      return null;
    };

    let sorted = userSubs.sort(
      func(a, b) { Int.compare(b.startDate, a.startDate) }
    );

    ?sorted[0];
  };

  public shared ({ caller }) func cancelSubscription() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can cancel subscriptions");
    };

    let active = subscriptions.values().find(
      func(sub) { sub.userId == caller and sub.status == #active }
    );

    switch (active) {
      case (null) { Runtime.trap("No active subscription found") };
      case (?sub) {
        let updated = { sub with status = #cancelled : SubscriptionStatus };
        subscriptions.add(sub.id, updated);
      };
    };
  };

  public query ({ caller }) func getAllSubscriptions() : async [Subscription] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view subscriptions");
    };
    subscriptions.values().toArray();
  };

  public shared ({ caller }) func adminCreateSubscription(
    userId : Principal,
    plan : SubscriptionPlan,
    totalSalads : Nat,
    remainingSalads : Nat,
    startDate : Int,
    endDate : Int,
    status : SubscriptionStatus
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create subscriptions");
    };

    let subId = nextSubscriptionId;
    nextSubscriptionId += 1;

    let newSub : Subscription = {
      id = subId;
      userId;
      plan;
      totalSalads;
      remainingSalads;
      startDate;
      endDate;
      status;
    };

    subscriptions.add(subId, newSub);
    subId;
  };

  public shared ({ caller }) func adminUpdateSubscription(
    id : Nat,
    plan : SubscriptionPlan,
    totalSalads : Nat,
    remainingSalads : Nat,
    startDate : Int,
    endDate : Int,
    status : SubscriptionStatus
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update subscriptions");
    };

    switch (subscriptions.get(id)) {
      case (null) { Runtime.trap("Subscription not found") };
      case (?sub) {
        let updatedSub : Subscription = {
          sub with
          plan;
          totalSalads;
          remainingSalads;
          startDate;
          endDate;
          status;
        };
        subscriptions.add(id, updatedSub);
      };
    };
  };

  public shared ({ caller }) func adminPauseSubscription(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can pause subscriptions");
    };

    switch (subscriptions.get(id)) {
      case (null) { Runtime.trap("Subscription not found") };
      case (?sub) {
        let updated = { sub with status = #paused : SubscriptionStatus };
        subscriptions.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func adminExtendSubscription(
    id : Nat,
    newEndDate : Int,
    additionalSalads : Nat
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can extend subscriptions");
    };

    switch (subscriptions.get(id)) {
      case (null) { Runtime.trap("Subscription not found") };
      case (?sub) {
        let updatedSub : Subscription = {
          sub with
          endDate = newEndDate;
          remainingSalads = sub.remainingSalads + additionalSalads;
        };
        subscriptions.add(id, updatedSub);
      };
    };
  };

  public shared ({ caller }) func adminCancelSubscription(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can cancel subscriptions");
    };

    switch (subscriptions.get(id)) {
      case (null) { Runtime.trap("Subscription not found") };
      case (?sub) {
        let updated = { sub with status = #cancelled : SubscriptionStatus };
        subscriptions.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func adminDeleteSubscription(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete subscriptions");
    };

    switch (subscriptions.get(id)) {
      case (null) { Runtime.trap("Subscription not found") };
      case (?_) {
        subscriptions.remove(id);
      };
    };
  };

  ////////////////////////////
  // SUBSCRIPTION PLANS     //
  ////////////////////////////

  func seedPlanTemplates() {
    if (planTemplatesSeeded) return;
    planTemplatesSeeded := true;

    let seed : [(Nat, Text, DurationType, Nat, Float, DeliveryFrequency, [Text], ?Text)] = [
      (1, "Weekly Weight Loss Plan", #weekly, 6, 599.0, #daily, ["6 salads per week", "Low calorie options", "Free delivery", "Customisable portions"], ?"Popular"),
      (2, "Weekly Protein Plan", #weekly, 6, 699.0, #daily, ["6 salads per week", "High protein ingredients", "Free delivery", "Gym-friendly menu"], null),
      (3, "Monthly Fitness Plan", #monthly, 26, 2199.0, #daily, ["26 salads per month", "Balanced nutrition", "Free delivery", "Priority menu access"], ?"Best Value"),
      (4, "Monthly Premium Plan", #monthly, 30, 2799.0, #daily, ["30 salads per month", "Premium ingredients", "Free delivery", "Dedicated support", "Exclusive menu items"], null),
    ];

    for ((id, name, dt, sc, price, df, features, badge) in seed.vals()) {
      let t : SubscriptionPlanTemplate = { id; name; durationType = dt; saladCount = sc; price; deliveryFrequency = df; features; badge; active = true };
      subscriptionPlanTemplates.add(id, t);
      if (id >= nextPlanTemplateId) { nextPlanTemplateId := id + 1 };
    };
  };

  public query func getActiveSubscriptionPlanTemplates() : async [SubscriptionPlanTemplate] {
    seedPlanTemplates();
    subscriptionPlanTemplates.values().filter(func(t) { t.active }).toArray();
  };

  public query ({ caller }) func getAllSubscriptionPlanTemplates() : async [SubscriptionPlanTemplate] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized");
    };
    seedPlanTemplates();
    subscriptionPlanTemplates.values().toArray();
  };

  public shared ({ caller }) func createSubscriptionPlanTemplate(
    name : Text,
    durationType : DurationType,
    saladCount : Nat,
    price : Float,
    deliveryFrequency : DeliveryFrequency,
    features : [Text],
    badge : ?Text,
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized");
    };
    seedPlanTemplates();
    let id = nextPlanTemplateId;
    nextPlanTemplateId += 1;
    let t : SubscriptionPlanTemplate = { id; name; durationType; saladCount; price; deliveryFrequency; features; badge; active = true };
    subscriptionPlanTemplates.add(id, t);
    id;
  };

  public shared ({ caller }) func updateSubscriptionPlanTemplate(
    id : Nat,
    name : Text,
    durationType : DurationType,
    saladCount : Nat,
    price : Float,
    deliveryFrequency : DeliveryFrequency,
    features : [Text],
    badge : ?Text,
    active : Bool,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized");
    };
    seedPlanTemplates();
    switch (subscriptionPlanTemplates.get(id)) {
      case (null) { Runtime.trap("Plan not found") };
      case (?_) {
        let t : SubscriptionPlanTemplate = { id; name; durationType; saladCount; price; deliveryFrequency; features; badge; active };
        subscriptionPlanTemplates.add(id, t);
      };
    };
  };

  public shared ({ caller }) func deleteSubscriptionPlanTemplate(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized");
    };
    subscriptionPlanTemplates.remove(id);
  };

  public shared ({ caller }) func toggleSubscriptionPlanTemplateStatus(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized");
    };
    seedPlanTemplates();
    switch (subscriptionPlanTemplates.get(id)) {
      case (null) { Runtime.trap("Plan not found") };
      case (?t) {
        subscriptionPlanTemplates.add(id, { t with active = not t.active });
      };
    };
  };

  public shared ({ caller }) func subscribeToPlanTemplate(templateId : Nat) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can subscribe");
    };
    seedPlanTemplates();
    let tmpl = switch (subscriptionPlanTemplates.get(templateId)) {
      case (null) { Runtime.trap("Plan not found") };
      case (?t) { t };
    };
    if (not tmpl.active) { Runtime.trap("Plan is not active") };

    // Cancel existing active subscription
    let active = subscriptions.values().find(func(s) { s.userId == caller and s.status == #active });
    switch (active) {
      case (?sub) { subscriptions.add(sub.id, { sub with status = #cancelled : SubscriptionStatus }) };
      case (null) {};
    };

    let subId = nextSubscriptionId;
    nextSubscriptionId += 1;
    let now = Time.now();
    let endDate = switch (tmpl.durationType) {
      case (#weekly) { now + 7 * 24 * 60 * 60 * 1_000_000_000 };
      case (#monthly) { now + 30 * 24 * 60 * 60 * 1_000_000_000 };
    };
    let plan : SubscriptionPlan = switch (tmpl.durationType) {
      case (#weekly) { #weekly };
      case (#monthly) { #monthly };
    };
    let newSub : Subscription = {
      id = subId;
      userId = caller;
      plan;
      totalSalads = tmpl.saladCount;
      remainingSalads = tmpl.saladCount;
      startDate = now;
      endDate;
      status = #active;
    };
    subscriptions.add(subId, newSub);
    subId;
  };

  ////////////////////////////
  // INVENTORY              //
  ////////////////////////////

  public shared ({ caller }) func addIngredient(item : IngredientItem) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add ingredients");
    };
    ingredients.add(item.id, item);
  };

  public shared ({ caller }) func updateIngredient(item : IngredientItem) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update ingredients");
    };
    ingredients.add(item.id, item);
  };

  public shared ({ caller }) func deleteIngredient(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete ingredients");
    };
    ingredients.remove(id);
  };

  public query ({ caller }) func getAllIngredients() : async [IngredientItem] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view ingredients");
    };
    ingredients.values().toArray();
  };

  ////////////////////////////
  // COUPONS                //
  ////////////////////////////

  public shared ({ caller }) func addCoupon(coupon : Coupon) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add coupons");
    };
    coupons.add(coupon.id, coupon);
  };

  public shared ({ caller }) func updateCoupon(coupon : Coupon) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update coupons");
    };
    coupons.add(coupon.id, coupon);
  };

  public shared ({ caller }) func deleteCoupon(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete coupons");
    };
    coupons.remove(id);
  };

  public query ({ caller }) func getAllCoupons() : async [Coupon] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all coupons");
    };
    coupons.values().toArray();
  };

  public shared ({ caller }) func applyCoupon(code : Text) : async Float {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can apply coupons");
    };

    let foundCoupon = coupons.values().find(
      func(c : Coupon) : Bool { c.code == code }
    );

    switch (foundCoupon) {
      case (null) { Runtime.trap("Coupon not found") };
      case (?coupon) {
        if (not coupon.active) {
          Runtime.trap("Coupon is not active");
        };

        let now = Time.now();
        if (now > coupon.expiryDate) {
          Runtime.trap("Coupon has expired");
        };

        if (coupon.usedCount >= coupon.usageLimit) {
          Runtime.trap("Coupon usage limit reached");
        };

        let updatedCoupon = {
          coupon with usedCount = coupon.usedCount + 1
        };
        coupons.add(coupon.id, updatedCoupon);

        coupon.discountValue;
      };
    };
  };

  public query func getActiveCoupons() : async [Coupon] {
    let now = Time.now();
    let allCoupons = coupons.values().toArray();
    allCoupons.filter(
      func(c : Coupon) : Bool {
        c.active and c.expiryDate > now
      }
    );
  };

  ////////////////////////////
  // DELIVERY               //
  ////////////////////////////

  public shared ({ caller }) func addDeliveryRider(rider : DeliveryRider) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add delivery riders");
    };
    deliveryRiders.add(rider.id, rider);
  };

  public shared ({ caller }) func updateDeliveryRider(rider : DeliveryRider) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update delivery riders");
    };
    deliveryRiders.add(rider.id, rider);
  };

  public query ({ caller }) func getAllDeliveryRiders() : async [DeliveryRider] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view delivery riders");
    };
    deliveryRiders.values().toArray();
  };

  public shared ({ caller }) func assignRiderToOrder(orderId : Nat, riderId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can assign riders to orders");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        // Update order status to outForDelivery
        orders.add(orderId, { order with status = #outForDelivery });
      };
    };

    switch (deliveryRiders.get(riderId)) {
      case (null) { Runtime.trap("Rider not found") };
      case (?rider) {
        let delivery : OrderDelivery = {
          orderId;
          riderId = ?riderId;
          riderName = ?rider.name;
          deliveryStatus = ?"assigned";
          assignedAt = ?Time.now();
        };
        orderDeliveries.add(orderId, delivery);
      };
    };
  };

  public shared ({ caller }) func updateDeliveryStatus(orderId : Nat, deliveryStatus : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update delivery status");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let newOrderStatus : OrderStatus = switch (deliveryStatus) {
          case ("pickedUp") { #outForDelivery };
          case ("outForDelivery") { #outForDelivery };
          case ("delivered") { #delivered };
          case (_) { #outForDelivery };
        };

        orders.add(orderId, { order with status = newOrderStatus });

        switch (orderDeliveries.get(orderId)) {
          case (null) { Runtime.trap("Order delivery record not found") };
          case (?delivery) {
            let updatedDelivery = { delivery with deliveryStatus = ?deliveryStatus };
            orderDeliveries.add(orderId, updatedDelivery);
          };
        };
      };
    };
  };

  public query ({ caller }) func getOrderDelivery(orderId : Nat) : async ?OrderDelivery {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view order deliveries");
    };

    switch (orders.get(orderId)) {
      case (null) { null };
      case (?order) {
        if (order.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view delivery info for your own orders");
        };
        orderDeliveries.get(orderId);
      };
    };
  };

  public query ({ caller }) func getAllOrderDeliveries() : async [OrderDelivery] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all order deliveries");
    };
    orderDeliveries.values().toArray();
  };

  ////////////////////////////
  // DASHBOARD              //
  ////////////////////////////

  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view dashboard stats");
    };

    let now = Time.now();
    let oneDayAgo = now - (24 * 60 * 60 * 1_000_000_000);

    let allOrders = orders.values().toArray();

    let todayOrders = allOrders.filter(
      func(order : Order) : Bool {
        order.createdAt >= oneDayAgo
      }
    ).size();

    var totalRevenue : Float = 0.0;
    for (order in allOrders.vals()) {
      switch (order.status) {
        case (#delivered) {
          totalRevenue := totalRevenue + order.totalAmount;
        };
        case (_) {};
      };
    };

    let allSubs = subscriptions.values().toArray();
    let activeSubscriptions = allSubs.filter(
      func(sub : Subscription) : Bool {
        sub.status == #active
      }
    ).size();

    let totalCustomers = userProfiles.size();

    {
      todayOrders;
      totalRevenue;
      activeSubscriptions;
      totalCustomers;
    };
  };
  ////////////////////////////
  // BUILD YOUR BOWL        //
  ////////////////////////////

  func seedBowlData() {
    if (bowlIngredientsSeeded) return;
    bowlIngredientsSeeded := true;
    bowlSizesSeeded := true;

    // Seed Bowl Ingredients
    let ingredientSeed : [(Nat, Text, BowlIngredientCategory, Float, Nat, Nat)] = [
      (1, "Brown Rice",       #base,      40.0, 120, 130),
      (2, "Quinoa",           #base,      50.0, 100, 120),
      (3, "Lettuce",          #base,      20.0,  80,  15),
      (4, "Cucumber",         #vegetable, 15.0,  40,  10),
      (5, "Tomato",           #vegetable, 15.0,  40,  12),
      (6, "Corn",             #vegetable, 20.0,  50,  45),
      (7, "Carrot",           #vegetable, 15.0,  40,  17),
      (8, "Paneer",           #protein,   70.0,  80, 180),
      (9, "Chickpeas",        #protein,   40.0,  80, 130),
      (10, "Tofu",            #protein,   60.0,  80,  95),
      (11, "Mint Yogurt",     #dressing,  25.0,  20,  30),
      (12, "Olive Oil Lemon", #dressing,  30.0,  15,  80),
      (13, "Honey Mustard",   #dressing,  25.0,  20,  60),
    ];

    for ((id, name, cat, price, wt, cal) in ingredientSeed.vals()) {
      let ing : BowlIngredient = {
        id;
        name;
        category = cat;
        priceRs = price;
        weightG = wt;
        calories = cal;
        inventoryItemId = null;
        imageData = null;
        isActive = true;
        createdAt = Time.now();
      };
      bowlIngredients.add(id, ing);
      if (id >= nextBowlIngredientId) { nextBowlIngredientId := id + 1 };
    };

    // Seed Bowl Sizes
    let sizeSeed : [(Nat, Text, Float, Nat, Nat, Nat, Nat)] = [
      (1, "Regular", 149.0, 250, 3, 1, 1),
      (2, "Large",   199.0, 350, 4, 2, 2),
    ];

    for ((id, name, basePrice, baseWt, maxVeg, maxProt, maxDress) in sizeSeed.vals()) {
      let sz : BowlSize = {
        id;
        name;
        basePriceRs = basePrice;
        baseWeightG = baseWt;
        maxVegetables = maxVeg;
        maxProteins = maxProt;
        maxDressings = maxDress;
        isActive = true;
        createdAt = Time.now();
      };
      bowlSizes.add(id, sz);
      if (id >= nextBowlSizeId) { nextBowlSizeId := id + 1 };
    };
  };

  public query func getAllBowlIngredients() : async [BowlIngredient] {
    seedBowlData();
    bowlIngredients.values().toArray();
  };

  public query func getBowlIngredientsByCategory(category : BowlIngredientCategory) : async [BowlIngredient] {
    seedBowlData();
    bowlIngredients.values().filter(func(i) {
      i.isActive and (
        switch (category, i.category) {
          case (#base, #base)           { true };
          case (#vegetable, #vegetable) { true };
          case (#protein, #protein)     { true };
          case (#dressing, #dressing)   { true };
          case (_,_)                    { false };
        }
      )
    }).toArray();
  };

  public shared ({ caller }) func createBowlIngredient(
    name : Text,
    category : BowlIngredientCategory,
    priceRs : Float,
    weightG : Nat,
    calories : Nat,
    inventoryItemId : ?Nat,
    imageData : ?Text,
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized");
    };
    seedBowlData();
    let id = nextBowlIngredientId;
    nextBowlIngredientId += 1;
    let ing : BowlIngredient = {
      id;
      name;
      category;
      priceRs;
      weightG;
      calories;
      inventoryItemId;
      imageData;
      isActive = true;
      createdAt = Time.now();
    };
    bowlIngredients.add(id, ing);
    id;
  };

  public shared ({ caller }) func updateBowlIngredient(
    id : Nat,
    name : Text,
    category : BowlIngredientCategory,
    priceRs : Float,
    weightG : Nat,
    calories : Nat,
    inventoryItemId : ?Nat,
    imageData : ?Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized");
    };
    seedBowlData();
    switch (bowlIngredients.get(id)) {
      case (null) { Runtime.trap("Bowl ingredient not found") };
      case (?ing) {
        bowlIngredients.add(id, {
          ing with name; category; priceRs; weightG; calories; inventoryItemId; imageData;
        });
      };
    };
  };

  public shared ({ caller }) func toggleBowlIngredientStatus(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized");
    };
    seedBowlData();
    switch (bowlIngredients.get(id)) {
      case (null) { Runtime.trap("Bowl ingredient not found") };
      case (?ing) {
        bowlIngredients.add(id, { ing with isActive = not ing.isActive });
      };
    };
  };

  public shared ({ caller }) func deleteBowlIngredient(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized");
    };
    bowlIngredients.remove(id);
  };

  public query func getAllBowlSizes() : async [BowlSize] {
    seedBowlData();
    bowlSizes.values().toArray();
  };

  public shared ({ caller }) func createBowlSize(
    name : Text,
    basePriceRs : Float,
    baseWeightG : Nat,
    maxVegetables : Nat,
    maxProteins : Nat,
    maxDressings : Nat,
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized");
    };
    seedBowlData();
    let id = nextBowlSizeId;
    nextBowlSizeId += 1;
    let sz : BowlSize = {
      id;
      name;
      basePriceRs;
      baseWeightG;
      maxVegetables;
      maxProteins;
      maxDressings;
      isActive = true;
      createdAt = Time.now();
    };
    bowlSizes.add(id, sz);
    id;
  };

  public shared ({ caller }) func updateBowlSize(
    id : Nat,
    name : Text,
    basePriceRs : Float,
    baseWeightG : Nat,
    maxVegetables : Nat,
    maxProteins : Nat,
    maxDressings : Nat,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized");
    };
    seedBowlData();
    switch (bowlSizes.get(id)) {
      case (null) { Runtime.trap("Bowl size not found") };
      case (?sz) {
        bowlSizes.add(id, { sz with name; basePriceRs; baseWeightG; maxVegetables; maxProteins; maxDressings });
      };
    };
  };

  public shared ({ caller }) func toggleBowlSizeStatus(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized");
    };
    seedBowlData();
    switch (bowlSizes.get(id)) {
      case (null) { Runtime.trap("Bowl size not found") };
      case (?sz) {
        bowlSizes.add(id, { sz with isActive = not sz.isActive });
      };
    };
  };

  public shared ({ caller }) func deleteBowlSize(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized");
    };
    bowlSizes.remove(id);
  };

  // Deduct inventory for custom bowl when order is confirmed/preparing
  func deductBowlInventoryForOrder(order : Order) {
    // Only deduct if there's a custom bowl item (menuItemId = 0)
    var hasBowl = false;
    for (item in order.items.vals()) {
      if (item.menuItemId == 0) { hasBowl := true };
    };
    if (not hasBowl) return;

    // Parse ingredient inventory mappings from notes JSON text
    // Notes JSON contains: "inventoryItemId":N and "weightG":N pairs in the customBowl section
    switch (order.notes) {
      case (null) {};
      case (?notesText) {
        let chars = notesText.chars().toArray();
        let len = chars.size();

        func parseNat(startPos : Nat) : (Nat, Nat) {
          var n = 0;
          var p = startPos;
          while (p < len) {
            let c = chars[p];
            let code = c.toNat32().toNat();
            if (code >= 48 and code <= 57) {
              if (code >= 48) { n := n * 10 + (code - 48) };
              p += 1;
            } else {
              return (n, p);
            };
          };
          (n, p);
        };

        // Search for "inventoryItemId": patterns
        // We look for the sequence of characters matching the key
        let invKey : [Char] = ['\u{22}','i','n','v','e','n','t','o','r','y','I','t','e','m','I','d','\u{22}',':'];
        let wgtKey : [Char] = ['\u{22}','w','e','i','g','h','t','G','\u{22}',':'];
        let invKeyLen = invKey.size();
        let wgtKeyLen = wgtKey.size();

        var pos = 0;
        while (pos + invKeyLen <= len) {
          var matched = true;
          var k = 0;
          while (k < invKeyLen) {
            if (chars[pos + k] != invKey[k]) { matched := false };
            k += 1;
          };
          if (matched) {
            var numStart = pos + invKeyLen;
            while (numStart < len and (chars[numStart] == ' ' or chars[numStart] == '\u{09}')) {
              numStart += 1;
            };
            let (invId, afterInv) = parseNat(numStart);
            if (invId > 0) {
              // Search for weightG within the next 300 characters
              let searchEnd = if (afterInv + 300 < len) { afterInv + 300 } else { len };
              var wPos = afterInv;
              var found = false;
              while (wPos + wgtKeyLen <= searchEnd and not found) {
                var wMatched = true;
                var wk = 0;
                while (wk < wgtKeyLen) {
                  if (chars[wPos + wk] != wgtKey[wk]) { wMatched := false };
                  wk += 1;
                };
                if (wMatched) {
                  var wnStart = wPos + wgtKeyLen;
                  while (wnStart < len and (chars[wnStart] == ' ' or chars[wnStart] == '\u{09}')) {
                    wnStart += 1;
                  };
                  let (weightGVal, _afterWgt) = parseNat(wnStart);
                  if (weightGVal > 0) {
                    switch (ingredients.get(invId)) {
                      case (null) {};
                      case (?inv) {
                        if (inv.quantity >= weightGVal) {
                          let newQty : Nat = inv.quantity - weightGVal; ingredients.add(invId, { inv with quantity = newQty });
                        };
                      };
                    };
                  };
                  found := true;
                };
                wPos += 1;
              };
            };
            pos := afterInv;
          } else {
            pos += 1;
          };
        };
      };
    };
  };



  /////////////////////////////
  // UPGRADE HOOKS           //
  /////////////////////////////

  system func preupgrade() {
    stableUserProfiles := userProfiles.toArray();
    stableMenuItems := menuItems.toArray();
    stableOrders := orders.toArray();
    stableSubscriptions := subscriptions.toArray();
    stableIngredients := ingredients.toArray();
    stableCoupons := coupons.toArray();
    stableDeliveryRiders := deliveryRiders.toArray();
    stableOrderDeliveries := orderDeliveries.toArray();
    stableSaladIngredients := saladIngredients.toArray();
    stableSubscriptionPlanTemplates := subscriptionPlanTemplates.toArray();
    stableReviews := reviews.toArray();
    stableBowlIngredients := bowlIngredients.toArray();
    stableBowlSizes := bowlSizes.toArray();
    stableNextSubscriptionId := nextSubscriptionId;
    stableNextPlanTemplateId := nextPlanTemplateId;
    stableNextReviewId := nextReviewId;
    stableNextBowlIngredientId := nextBowlIngredientId;
    stableNextBowlSizeId := nextBowlSizeId;
    stablePlanTemplatesSeeded := planTemplatesSeeded;
    stableBowlIngredientsSeeded := bowlIngredientsSeeded;
    stableBowlSizesSeeded := bowlSizesSeeded;
    stableAppSettings := appSettings;
  };

  system func postupgrade() {
    // Maps are already restored from stable arrays at initialization.
    // Reset stable arrays to free heap memory (optional optimization).
    stableUserProfiles := [];
    stableMenuItems := [];
    stableOrders := [];
    stableSubscriptions := [];
    stableIngredients := [];
    stableCoupons := [];
    stableDeliveryRiders := [];
    stableOrderDeliveries := [];
    stableSaladIngredients := [];
    stableSubscriptionPlanTemplates := [];
    stableReviews := [];
    stableBowlIngredients := [];
    stableBowlSizes := [];
  };

};