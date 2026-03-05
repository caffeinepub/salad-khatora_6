import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";

module {
  type OrderItem = {
    menuItemId : Nat;
    quantity : Nat;
    unitPrice : Float;
  };

  type OldOrderStatus = {
    #pending;
    #confirmed;
    #preparing;
    #delivered;
    #cancelled;
  };

  type OldOrder = {
    id : Nat;
    userId : Principal.Principal;
    items : [OrderItem];
    totalAmount : Float;
    status : OldOrderStatus;
    createdAt : Int;
    notes : ?Text;
  };

  type OldActor = {
    orders : Map.Map<Nat, OldOrder>;
  };

  type NewOrderStatus = {
    #pending;
    #confirmed;
    #preparing;
    #outForDelivery;
    #delivered;
    #cancelled;
  };

  type NewOrder = {
    id : Nat;
    userId : Principal.Principal;
    items : [OrderItem];
    totalAmount : Float;
    status : NewOrderStatus;
    createdAt : Int;
    notes : ?Text;
  };

  type NewActor = {
    orders : Map.Map<Nat, NewOrder>;
  };

  public func run(old : OldActor) : NewActor {
    let newOrders = old.orders.map<Nat, OldOrder, NewOrder>(
      func(_id, oldOrder) {
        { oldOrder with status = convertOrderStatusToNew(oldOrder.status) };
      }
    );
    { orders = newOrders };
  };

  func convertOrderStatusToNew(oldStatus : OldOrderStatus) : NewOrderStatus {
    switch (oldStatus) {
      case (#pending) { #pending };
      case (#confirmed) { #confirmed };
      case (#preparing) { #preparing };
      case (#delivered) { #delivered };
      case (#cancelled) { #cancelled };
    };
  };
};
