import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type {
  AdminUserRecord,
  AppSettings,
  Coupon,
  DashboardStats,
  DeliveryRider,
  IngredientItem,
  MenuItem,
  Order,
  OrderDelivery,
  SaladIngredient,
  Subscription,
  UserProfile,
} from "../backend";
import type {
  OrderStatus,
  SubscriptionPlan,
  SubscriptionStatus,
} from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

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

export function useAdminCreateSubscription() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      userId: Principal;
      plan: SubscriptionPlan;
      totalSalads: bigint;
      remainingSalads: bigint;
      startDate: bigint;
      endDate: bigint;
      status: SubscriptionStatus;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.adminCreateSubscription(
        args.userId,
        args.plan,
        args.totalSalads,
        args.remainingSalads,
        args.startDate,
        args.endDate,
        args.status,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allSubscriptions"] });
    },
  });
}

export function useAdminUpdateSubscription() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      id: bigint;
      plan: SubscriptionPlan;
      totalSalads: bigint;
      remainingSalads: bigint;
      startDate: bigint;
      endDate: bigint;
      status: SubscriptionStatus;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.adminUpdateSubscription(
        args.id,
        args.plan,
        args.totalSalads,
        args.remainingSalads,
        args.startDate,
        args.endDate,
        args.status,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allSubscriptions"] });
    },
  });
}

export function useAdminPauseSubscription() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.adminPauseSubscription(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allSubscriptions"] });
    },
  });
}

export function useAdminExtendSubscription() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      id: bigint;
      newEndDate: bigint;
      additionalSalads: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.adminExtendSubscription(
        args.id,
        args.newEndDate,
        args.additionalSalads,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allSubscriptions"] });
    },
  });
}

export function useAdminCancelSubscription() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.adminCancelSubscription(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allSubscriptions"] });
    },
  });
}

export function useAdminDeleteSubscription() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.adminDeleteSubscription(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allSubscriptions"] });
    },
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
      await (actor as any).updateDeliveryStatus(orderId, status);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allOrderDeliveries"] });
      void queryClient.invalidateQueries({ queryKey: ["allOrders"] });
    },
  });
}

// ─── Admin: Users (Customers) ─────────────────────────────────────────────────

export function useAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<AdminUserRecord[]>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminCreateUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user,
      profile,
    }: {
      user: Principal;
      profile: UserProfile;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.adminCreateUser(user, profile);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useAdminUpdateUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user,
      profile,
    }: {
      user: Principal;
      profile: UserProfile;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.adminUpdateUser(user, profile);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useAdminDeleteUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Not connected");
      await actor.adminDeleteUser(user);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

// ─── Admin: Menu Items ────────────────────────────────────────────────────────

export function useAllMenuItems() {
  const { actor, isFetching } = useActor();
  return useQuery<MenuItem[]>({
    queryKey: ["allMenuItems"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMenuItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: MenuItem) => {
      if (!actor) throw new Error("Not connected");
      await actor.addMenuItem(item);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allMenuItems"] });
    },
  });
}

export function useUpdateMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: MenuItem) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateMenuItem(item);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allMenuItems"] });
    },
  });
}

export function useDeleteMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteMenuItem(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allMenuItems"] });
    },
  });
}

export function useToggleAvailability() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.toggleAvailability(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allMenuItems"] });
    },
  });
}

// ─── Admin: Salad Ingredients ─────────────────────────────────────────────────

export function useGetSaladIngredients(saladId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<SaladIngredient[]>({
    queryKey: ["saladIngredients", saladId?.toString()],
    queryFn: async () => {
      if (!actor || saladId === null) return [];
      return actor.getSaladIngredients(saladId);
    },
    enabled: !!actor && !isFetching && saladId !== null,
  });
}

export function useGetAllSaladIngredients() {
  const { actor, isFetching } = useActor();
  return useQuery<
    Array<{ saladId: bigint; ingredients: Array<SaladIngredient> }>
  >({
    queryKey: ["allSaladIngredients"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSaladIngredients();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetSaladIngredients() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      saladId,
      ingredientList,
    }: {
      saladId: bigint;
      ingredientList: Array<SaladIngredient>;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.setSaladIngredients(saladId, ingredientList);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["saladIngredients", variables.saladId.toString()],
      });
      void queryClient.invalidateQueries({ queryKey: ["allSaladIngredients"] });
    },
  });
}

// ─── Admin: App Settings ──────────────────────────────────────────────────────

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

export function useSaveAppSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: AppSettings) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveAppSettings(settings);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["appSettings"] });
    },
  });
}

// ─── Admin: Auth Check ────────────────────────────────────────────────────────

const ADMIN_PRINCIPAL_STORAGE_KEY = "sk_admin_principals";

function getStoredAdminPrincipals(): string[] {
  try {
    const stored = localStorage.getItem(ADMIN_PRINCIPAL_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

function storeAdminPrincipal(principal: string) {
  try {
    const existing = getStoredAdminPrincipals();
    if (!existing.includes(principal)) {
      localStorage.setItem(
        ADMIN_PRINCIPAL_STORAGE_KEY,
        JSON.stringify([...existing, principal]),
      );
    }
  } catch {
    // ignore storage errors
  }
}

function removeAdminPrincipal(principal: string) {
  try {
    const existing = getStoredAdminPrincipals();
    localStorage.setItem(
      ADMIN_PRINCIPAL_STORAGE_KEY,
      JSON.stringify(existing.filter((p) => p !== principal)),
    );
  } catch {
    // ignore storage errors
  }
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const principal = identity?.getPrincipal().toString() ?? "anonymous";
  const isRealIdentity = !!identity && !identity.getPrincipal().isAnonymous();

  // Fast-path: if we have a stored admin principal, return true immediately
  // while the backend check runs in the background.
  const storedAdmins = getStoredAdminPrincipals();
  const isCachedAdmin = isRealIdentity && storedAdmins.includes(principal);

  // Force an immediate refetch whenever the principal changes (login/logout).
  useEffect(() => {
    if (isRealIdentity) {
      void queryClient.invalidateQueries({
        queryKey: ["isCallerAdmin", principal],
      });
    }
  }, [principal, isRealIdentity, queryClient]);

  const query = useQuery<boolean>({
    queryKey: ["isCallerAdmin", principal],
    queryFn: async () => {
      if (!actor) return isCachedAdmin;
      if (!isRealIdentity) return false;
      try {
        // isCallerAdmin() may throw a backend trap if the user is not yet
        // registered (i.e. _initializeAccessControlWithSecret hasn't been
        // called yet). Treat any error as "not admin" and retry.
        const result = await actor.isCallerAdmin();
        console.log("Logged user isAdmin:", result, "principal:", principal);
        if (result) {
          storeAdminPrincipal(principal);
        } else {
          removeAdminPrincipal(principal);
          console.warn(
            "Admin check: user is registered but not as admin. Use assignCallerUserRole to grant admin access. Principal:",
            principal,
          );
        }
        return result;
      } catch (err) {
        console.warn(
          "isCallerAdmin check failed (user may not be registered yet):",
          err,
        );
        // Fall back to localStorage cache while retrying
        return isCachedAdmin;
      }
    },
    // Seed the initial data from localStorage so the tab shows immediately on reload
    initialData: isCachedAdmin ? true : undefined,
    enabled: !!actor && !isFetching && !isInitializing && isRealIdentity,
    staleTime: 0,
    gcTime: 0,
    retry: 5,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return query;
}

// ─── Admin: Subscription Plan Templates ───────────────────────────────────────

// Helper: normalize a plan returned from backend (variants come as { weekly: null } objects)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizePlanTemplate(p: any) {
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
    else if ("weekly" in p.deliveryFrequency) deliveryFrequency = "weekly";
    else deliveryFrequency = "daily";
  }
  return {
    ...p,
    id: p.id,
    saladCount:
      typeof p.saladCount === "bigint"
        ? Number(p.saladCount)
        : Number(p.saladCount ?? 0),
    price: typeof p.price === "number" ? p.price : Number(p.price ?? 0),
    badge: Array.isArray(p.badge)
      ? p.badge.length > 0
        ? p.badge[0]
        : null
      : (p.badge ?? null),
    features: Array.isArray(p.features) ? p.features : [],
    durationType,
    deliveryFrequency,
  };
}

export function useAllSubscriptionPlanTemplates() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allSubscriptionPlanTemplates"],
    queryFn: async () => {
      if (!actor) return [];
      // Use the typed method on the actor - the method now exists in Backend class
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw: any[] = await (actor as any).getAllSubscriptionPlanTemplates();
      return raw.map(normalizePlanTemplate);
    },
    enabled: !!actor && !isFetching,
    retry: 2,
  });
}

export function useCreateSubscriptionPlanTemplate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      name: string;
      durationType: string;
      saladCount: bigint;
      price: number;
      deliveryFrequency: string;
      features: string[];
      badge: string | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).createSubscriptionPlanTemplate(
        args.name,
        args.durationType,
        args.saladCount,
        args.price,
        args.deliveryFrequency,
        args.features,
        args.badge,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["allSubscriptionPlanTemplates"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["activeSubscriptionPlanTemplates"],
      });
    },
    onError: (err: unknown) => {
      console.error("createSubscriptionPlanTemplate failed:", err);
    },
  });
}

export function useUpdateSubscriptionPlanTemplate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      id: bigint;
      name: string;
      durationType: string;
      saladCount: bigint;
      price: number;
      deliveryFrequency: string;
      features: string[];
      badge: string | null;
      active: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).updateSubscriptionPlanTemplate(
        args.id,
        args.name,
        args.durationType,
        args.saladCount,
        args.price,
        args.deliveryFrequency,
        args.features,
        args.badge,
        args.active,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["allSubscriptionPlanTemplates"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["activeSubscriptionPlanTemplates"],
      });
    },
  });
}

export function useDeleteSubscriptionPlanTemplate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).deleteSubscriptionPlanTemplate(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["allSubscriptionPlanTemplates"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["activeSubscriptionPlanTemplates"],
      });
    },
  });
}

export function useToggleSubscriptionPlanTemplateStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).toggleSubscriptionPlanTemplateStatus(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["allSubscriptionPlanTemplates"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["activeSubscriptionPlanTemplates"],
      });
    },
  });
}
