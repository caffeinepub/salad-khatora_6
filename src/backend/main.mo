import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



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

  // User Profile
  public type UserProfile = {
    name : Text;
    email : Text;
    age : Nat;
    weight : Float; // in kg
    height : Float; // in cm
    bmi : Float;
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
  };

  // Order Item
  public type OrderItem = {
    menuItemId : Nat;
    quantity : Nat;
    unitPrice : Float;
  };

  // Order Status - EXTENDED with #outForDelivery
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
    #weekly; // 6 salads
    #monthly; // 24 salads
  };

  // Subscription Status
  public type SubscriptionStatus = {
    #active;
    #cancelled;
  };

  // Subscription
  public type Subscription = {
    id : Nat;
    userId : Principal;
    plan : SubscriptionPlan;
    startDate : Int;
    status : SubscriptionStatus;
  };

  // NEW TYPES FOR PHASE 3

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

  // Order Delivery
  public type OrderDelivery = {
    orderId : Nat;
    riderId : ?Nat;
    assignedAt : ?Int;
  };

  // Dashboard Stats
  public type DashboardStats = {
    todayOrders : Nat;
    totalRevenue : Float;
    activeSubscriptions : Nat;
    totalCustomers : Nat;
  };

  /////////////////////
  // STATE           //
  /////////////////////

  // Internal state for initialization
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

  /////////////////////
  // USER PROFILES   //
  /////////////////////

  // Required by frontend: get caller's own profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  // Required by frontend: save caller's own profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Required by frontend: get another user's profile (admin or self only)
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Legacy function - kept for backward compatibility
  public shared ({ caller }) func createOrUpdateProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Legacy function - kept for backward compatibility
  public query ({ caller }) func getMyProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  /////////////////////
  // MENU ITEMS      //
  /////////////////////

  // Public access - no authentication required (guests can view menu)
  public query func getAllMenuItems() : async [MenuItem] {
    let items = menuItems.values().toArray();
    items.sort(
      func(a, b) { Nat.compare(a.id, b.id) }
    );
  };

  // Public access - no authentication required (guests can view menu)
  public query func getMenuItemById(id : Nat) : async ?MenuItem {
    menuItems.get(id);
  };

  // Public access - no authentication required (guests can view menu)
  public query func getMenuItemsByCategory(category : Text) : async [MenuItem] {
    let allItems = menuItems.values().toArray();
    let filtered = allItems.filter(
      func(item) { item.category == category }
    );
    filtered.sort(
      func(a, b) { Nat.compare(a.id, b.id) }
    );
  };

  // Admin only
  public shared ({ caller }) func addMenuItem(item : MenuItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add menu items");
    };
    menuItems.add(item.id, item);
  };

  // Admin only
  public shared ({ caller }) func updateMenuItem(item : MenuItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update menu items");
    };
    menuItems.add(item.id, item);
  };

  // Admin only
  public shared ({ caller }) func toggleAvailability(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
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

  // User only - must be authenticated to place order
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

    orders.add(orderId, order);
    orderId;
  };

  // User only - can only view own orders
  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    let allOrders = orders.values().toArray();
    allOrders.filter(
      func(order) { order.userId == caller }
    );
  };

  // Admin only - can view all orders
  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  // Admin only - can update order status
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

  // User only - can get own order by id
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

  // User only - subscribe to a plan
  public shared ({ caller }) func subscribeToPlan(plan : SubscriptionPlan) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can subscribe");
    };

    // Cancel existing active subscriptions
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

    let subId = subscriptions.size() + 1;
    let newSub : Subscription = {
      id = subId;
      userId = caller;
      plan;
      startDate = Time.now();
      status = #active;
    };

    subscriptions.add(subId, newSub);
    subId;
  };

  // User only - get latest subscription
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

  // User only - cancel active subscription
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

  // Admin only - get all subscriptions
  public query ({ caller }) func getAllSubscriptions() : async [Subscription] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view subscriptions");
    };
    subscriptions.values().toArray();
  };

  ////////////////////////////
  // PHASE 3: INVENTORY     //
  ////////////////////////////

  // Admin only - add ingredient
  public shared ({ caller }) func addIngredient(item : IngredientItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add ingredients");
    };
    ingredients.add(item.id, item);
  };

  // Admin only - update ingredient
  public shared ({ caller }) func updateIngredient(item : IngredientItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update ingredients");
    };
    ingredients.add(item.id, item);
  };

  // Admin only - delete ingredient
  public shared ({ caller }) func deleteIngredient(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete ingredients");
    };
    ingredients.remove(id);
  };

  // Public query - anyone can view ingredients
  public query func getAllIngredients() : async [IngredientItem] {
    ingredients.values().toArray();
  };

  ////////////////////////////
  // PHASE 3: COUPONS       //
  ////////////////////////////

  // Admin only - add coupon
  public shared ({ caller }) func addCoupon(coupon : Coupon) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add coupons");
    };
    coupons.add(coupon.id, coupon);
  };

  // Admin only - update coupon
  public shared ({ caller }) func updateCoupon(coupon : Coupon) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update coupons");
    };
    coupons.add(coupon.id, coupon);
  };

  // Admin only - delete coupon
  public shared ({ caller }) func deleteCoupon(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete coupons");
    };
    coupons.remove(id);
  };

  // Admin only - get all coupons
  public query ({ caller }) func getAllCoupons() : async [Coupon] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all coupons");
    };
    coupons.values().toArray();
  };

  // User only - apply coupon
  public shared ({ caller }) func applyCoupon(code : Text) : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can apply coupons");
    };

    // Find coupon by code
    let foundCoupon = coupons.values().find(
      func(c : Coupon) : Bool { c.code == code }
    );

    switch (foundCoupon) {
      case (null) { Runtime.trap("Coupon not found") };
      case (?coupon) {
        // Check if coupon is active
        if (not coupon.active) {
          Runtime.trap("Coupon is not active");
        };

        // Check if coupon is expired
        let now = Time.now();
        if (now > coupon.expiryDate) {
          Runtime.trap("Coupon has expired");
        };

        // Check usage limit
        if (coupon.usedCount >= coupon.usageLimit) {
          Runtime.trap("Coupon usage limit reached");
        };

        // Increment used count
        let updatedCoupon = {
          coupon with usedCount = coupon.usedCount + 1
        };
        coupons.add(coupon.id, updatedCoupon);

        // Return discount value
        coupon.discountValue;
      };
    };
  };

  // Public query - get active coupons for display
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
  // PHASE 3: DELIVERY      //
  ////////////////////////////

  // Admin only - add delivery rider
  public shared ({ caller }) func addDeliveryRider(rider : DeliveryRider) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add delivery riders");
    };
    deliveryRiders.add(rider.id, rider);
  };

  // Admin only - update delivery rider
  public shared ({ caller }) func updateDeliveryRider(rider : DeliveryRider) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update delivery riders");
    };
    deliveryRiders.add(rider.id, rider);
  };

  // Public query - anyone can view delivery riders
  public query func getAllDeliveryRiders() : async [DeliveryRider] {
    deliveryRiders.values().toArray();
  };

  // Admin only - assign rider to order
  public shared ({ caller }) func assignRiderToOrder(orderId : Nat, riderId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can assign riders to orders");
    };

    // Verify order exists
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?_) {};
    };

    // Verify rider exists
    switch (deliveryRiders.get(riderId)) {
      case (null) { Runtime.trap("Rider not found") };
      case (?_) {};
    };

    let delivery : OrderDelivery = {
      orderId;
      riderId = ?riderId;
      assignedAt = ?Time.now();
    };

    orderDeliveries.add(orderId, delivery);
  };

  // Public query - get order delivery info
  public query func getOrderDelivery(orderId : Nat) : async ?OrderDelivery {
    orderDeliveries.get(orderId);
  };

  // Public query - get all order deliveries
  public query func getAllOrderDeliveries() : async [OrderDelivery] {
    orderDeliveries.values().toArray();
  };

  ////////////////////////////
  // PHASE 3: DASHBOARD     //
  ////////////////////////////

  // Admin only - get dashboard statistics
  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view dashboard stats");
    };

    let now = Time.now();
    let oneDayAgo = now - (24 * 60 * 60 * 1_000_000_000); // 24 hours in nanoseconds

    let allOrders = orders.values().toArray();

    // Count today's orders (within last 24 hours)
    let todayOrders = allOrders.filter(
      func(order : Order) : Bool {
        order.createdAt >= oneDayAgo
      }
    ).size();

    // Calculate total revenue from delivered orders
    var totalRevenue : Float = 0.0;
    for (order in allOrders.vals()) {
      switch (order.status) {
        case (#delivered) {
          totalRevenue := totalRevenue + order.totalAmount;
        };
        case (_) {};
      };
    };

    // Count active subscriptions
    let allSubs = subscriptions.values().toArray();
    let activeSubscriptions = allSubs.filter(
      func(sub : Subscription) : Bool {
        sub.status == #active
      }
    ).size();

    // Count total unique customers
    let totalCustomers = userProfiles.size();

    {
      todayOrders;
      totalRevenue;
      activeSubscriptions;
      totalCustomers;
    };
  };
};
