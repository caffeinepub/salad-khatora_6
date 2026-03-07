import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Time "mo:core/Time";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";




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

  /////////////////////
  // STATE           //
  /////////////////////

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();
  let menuItems = Map.empty<Nat, MenuItem>();
  let orders = Map.empty<Nat, Order>();
  let subscriptions = Map.empty<Nat, Subscription>();
  let ingredients = Map.empty<Nat, IngredientItem>();
  let coupons = Map.empty<Nat, Coupon>();
  let deliveryRiders = Map.empty<Nat, DeliveryRider>();
  let orderDeliveries = Map.empty<Nat, OrderDelivery>();
  let saladIngredients = Map.empty<Nat, [SaladIngredient]>();

  var nextSubscriptionId = 1;

  var appSettings : AppSettings = {
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
};
