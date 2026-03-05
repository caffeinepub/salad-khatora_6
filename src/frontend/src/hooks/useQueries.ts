import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AppSettings,
  MenuItem,
  Order,
  OrderItem,
  Subscription,
  UserProfile,
} from "../backend";
import type { SubscriptionPlan } from "../backend";
import { useActor } from "./useActor";

// ─── Menu ─────────────────────────────────────────────────────────────────────

export function useAllMenuItems() {
  const { actor, isFetching } = useActor();
  return useQuery<MenuItem[]>({
    queryKey: ["menuItems"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMenuItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMenuItemsByCategory(category: string) {
  const { actor, isFetching } = useActor();
  return useQuery<MenuItem[]>({
    queryKey: ["menuItems", "category", category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMenuItemsByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export function useMyProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["myProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      await actor.createOrUpdateProfile(profile);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export function useMyOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["myOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      items,
      totalAmount,
      notes,
    }: {
      items: OrderItem[];
      totalAmount: number;
      notes: string | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      if (!items || items.length === 0) throw new Error("Cart is empty");
      if (totalAmount <= 0) throw new Error("Invalid order total");
      return actor.placeOrder(items, totalAmount, notes);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["myOrders"] });
    },
  });
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export function useMySubscription() {
  const { actor, isFetching } = useActor();
  return useQuery<Subscription | null>({
    queryKey: ["mySubscription"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMySubscription();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubscribeToPlan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (plan: SubscriptionPlan) => {
      if (!actor) throw new Error("Not connected");
      return actor.subscribeToPlan(plan);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["mySubscription"] });
    },
  });
}

export function useCancelSubscription() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      await actor.cancelSubscription();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["mySubscription"] });
    },
  });
}

// ─── App Settings ─────────────────────────────────────────────────────────────

export function useAppSettings() {
  const { actor, isFetching } = useActor();
  return useQuery<AppSettings>({
    queryKey: ["appSettings"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getAppSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApplyCoupon() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error("Not connected");
      const discount = await actor.applyCoupon(code);
      return discount;
    },
  });
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export function useCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) return "guest";
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}
