import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import type {
  AppSettings,
  MenuItem,
  Order,
  OrderItem,
  Subscription,
  UserProfile,
} from "../backend";
import type { SubscriptionPlan } from "../backend";
import { getOrderFrequency } from "../utils/orderFrequency";
import { useActor } from "./useActor";

// Local type for plan templates (backend.d.ts defines these but backend.ts doesn't export them yet)
export interface SubscriptionPlanTemplate {
  id: bigint;
  name: string;
  durationType: string;
  saladCount: bigint;
  price: number;
  deliveryFrequency: string;
  features: Array<string>;
  badge?: string;
  active: boolean;
}

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
  const isAuthenticated = !!(actor && !isFetching);

  return useQuery<UserProfile | null>({
    queryKey: ["myProfile", actor ? "ready" : "pending"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        // getMyProfile returns ?UserProfile in Motoko which becomes [] | [UserProfile] in JS
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = await (actor as any).getMyProfile();
        // Unwrap Motoko Option: [] means null, [value] means Some(value)
        if (Array.isArray(raw)) {
          const result = raw.length > 0 ? (raw[0] as UserProfile) : null;
          console.log(
            "[Profile] getMyProfile result:",
            result ? "found" : "empty",
          );
          return result;
        }
        // Fallback: direct value (shouldn't happen but handle gracefully)
        return (raw as UserProfile) ?? null;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        // If user is not yet registered (init call still in flight), retry
        if (msg.includes("not registered") || msg.includes("Unauthorized")) {
          console.warn(
            "[Profile] getMyProfile failed — user may not be registered yet, will retry:",
            msg,
          );
          throw err; // Let React Query retry
        }
        console.error("[Profile] getMyProfile unexpected error:", err);
        return null;
      }
    },
    enabled: isAuthenticated,
    // Retry up to 5 times with exponential backoff for "not registered" errors
    retry: (failureCount, err) => {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("not registered") || msg.includes("Unauthorized")) {
        return failureCount < 5;
      }
      return false;
    },
    retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 8000),
    staleTime: 0,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor)
        throw new Error(
          "Not connected to backend. Please refresh and try again.",
        );
      console.log("[Profile] Saving profile for principal:", profile.name);
      try {
        await actor.createOrUpdateProfile(profile);
        console.log("[Profile] Profile saved successfully");
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[Profile] createOrUpdateProfile failed:", msg, err);
        // Re-throw with a clean message for the UI
        if (msg.includes("not registered") || msg.includes("Unauthorized")) {
          throw new Error(
            "Session not ready. Please wait a moment and try again.",
          );
        }
        if (msg.includes("name")) throw new Error("name");
        if (msg.includes("mobile") || msg.includes("phone"))
          throw new Error("mobile");
        throw new Error(msg);
      }
    },
    onSuccess: () => {
      // Invalidate both possible query keys to ensure profile reloads
      void queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
    onError: (err) => {
      console.error("[Profile] useSaveProfile mutation error:", err);
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

export function useSubscribeToPlanTemplate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (templateId: bigint) => {
      if (!actor) throw new Error("Not connected");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).subscribeToPlanTemplate(templateId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["mySubscription"] });
    },
  });
}

export function useActiveSubscriptionPlanTemplates() {
  const { actor, isFetching } = useActor();
  return useQuery<SubscriptionPlanTemplate[]>({
    queryKey: ["activeSubscriptionPlanTemplates"],
    queryFn: async () => {
      if (!actor) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw: any[] = await (
        actor as any
      ).getActiveSubscriptionPlanTemplates();
      // Normalize Candid variant objects ({ weekly: null }) to plain strings
      return raw.map((p) => {
        let durationType = "weekly";
        if (p.durationType) {
          if (typeof p.durationType === "string") durationType = p.durationType;
          else if ("monthly" in p.durationType) durationType = "monthly";
          else durationType = "weekly";
        }
        let deliveryFrequency = "daily";
        if (p.deliveryFrequency) {
          if (typeof p.deliveryFrequency === "string")
            deliveryFrequency = p.deliveryFrequency;
          else if ("weekly" in p.deliveryFrequency)
            deliveryFrequency = "weekly";
          else deliveryFrequency = "daily";
        }
        return {
          ...p,
          saladCount:
            typeof p.saladCount === "bigint"
              ? Number(p.saladCount)
              : Number(p.saladCount ?? 0),
          price: typeof p.price === "number" ? p.price : Number(p.price ?? 0),
          badge: Array.isArray(p.badge)
            ? p.badge.length > 0
              ? p.badge[0]
              : undefined
            : (p.badge ?? undefined),
          features: Array.isArray(p.features) ? p.features : [],
          durationType,
          deliveryFrequency,
        } as SubscriptionPlanTemplate;
      });
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
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

// ─── Top Ordered Menu Items ───────────────────────────────────────────────────

/**
 * Returns up to `limit` active menu items sorted by order frequency (descending).
 * Falls back to featured/first items if no order history exists.
 */
export function useTopOrderedMenuItems(limit: number) {
  const menuQuery = useAllMenuItems();

  const topItems = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawItems = (menuQuery.data ?? []) as any[];
    const activeItems = rawItems.filter(
      (item) => item.isActive !== false && item.available !== false,
    ) as MenuItem[];

    const freq = getOrderFrequency();

    const sorted = [...activeItems].sort((a, b) => {
      const countA = freq[a.id.toString()] ?? 0;
      const countB = freq[b.id.toString()] ?? 0;
      if (countB !== countA) return countB - countA;
      return Number(a.id) - Number(b.id);
    });

    return sorted.slice(0, limit);
  }, [menuQuery.data, limit]);

  return { ...menuQuery, data: topItems };
}
