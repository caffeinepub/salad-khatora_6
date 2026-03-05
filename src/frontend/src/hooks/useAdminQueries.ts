import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Coupon,
  DashboardStats,
  DeliveryRider,
  IngredientItem,
  Order,
  OrderDelivery,
  Subscription,
} from "../backend";
import type { OrderStatus } from "../backend";
import { useActor } from "./useActor";

// ─── Admin: Dashboard ─────────────────────────────────────────────────────────

export function useDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Admin: Orders ────────────────────────────────────────────────────────────

export function useAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["allOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: bigint;
      status: OrderStatus;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allOrders"] });
    },
  });
}

// ─── Admin: Subscriptions ─────────────────────────────────────────────────────

export function useAllSubscriptions() {
  const { actor, isFetching } = useActor();
  return useQuery<Subscription[]>({
    queryKey: ["allSubscriptions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSubscriptions();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Admin: Inventory ─────────────────────────────────────────────────────────

export function useAllIngredients() {
  const { actor, isFetching } = useActor();
  return useQuery<IngredientItem[]>({
    queryKey: ["allIngredients"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllIngredients();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddIngredient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: IngredientItem) => {
      if (!actor) throw new Error("Not connected");
      await actor.addIngredient(item);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allIngredients"] });
    },
  });
}

export function useUpdateIngredient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: IngredientItem) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateIngredient(item);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allIngredients"] });
    },
  });
}

export function useDeleteIngredient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteIngredient(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allIngredients"] });
    },
  });
}

// ─── Admin: Coupons ───────────────────────────────────────────────────────────

export function useAllCoupons() {
  const { actor, isFetching } = useActor();
  return useQuery<Coupon[]>({
    queryKey: ["allCoupons"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCoupons();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCoupon() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (coupon: Coupon) => {
      if (!actor) throw new Error("Not connected");
      await actor.addCoupon(coupon);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allCoupons"] });
    },
  });
}

export function useUpdateCoupon() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (coupon: Coupon) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateCoupon(coupon);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allCoupons"] });
    },
  });
}

export function useDeleteCoupon() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteCoupon(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allCoupons"] });
    },
  });
}

// ─── Admin: Delivery ──────────────────────────────────────────────────────────

export function useAllDeliveryRiders() {
  const { actor, isFetching } = useActor();
  return useQuery<DeliveryRider[]>({
    queryKey: ["allDeliveryRiders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDeliveryRiders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddDeliveryRider() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rider: DeliveryRider) => {
      if (!actor) throw new Error("Not connected");
      await actor.addDeliveryRider(rider);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allDeliveryRiders"] });
    },
  });
}

export function useUpdateDeliveryRider() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rider: DeliveryRider) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateDeliveryRider(rider);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allDeliveryRiders"] });
    },
  });
}

export function useAllOrderDeliveries() {
  const { actor, isFetching } = useActor();
  return useQuery<OrderDelivery[]>({
    queryKey: ["allOrderDeliveries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrderDeliveries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAssignRiderToOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      riderId,
    }: {
      orderId: bigint;
      riderId: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.assignRiderToOrder(orderId, riderId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allOrderDeliveries"] });
      void queryClient.invalidateQueries({ queryKey: ["allOrders"] });
    },
  });
}

export function useAssignDeliveryPartner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      deliveryPartner,
    }: { orderId: bigint; deliveryPartner: string }) => {
      if (!actor) throw new Error("Not connected");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (actor as any).assignDeliveryPartner(orderId, deliveryPartner);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allOrderDeliveries"] });
    },
  });
}

export function useUpdateDeliveryStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: { orderId: bigint; status: string }) => {
      if (!actor) throw new Error("Not connected");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (actor as any).updateDeliveryStatus(orderId, status, null);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allOrderDeliveries"] });
    },
  });
}

// ─── Admin: Auth Check ────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
