import { SubscriptionStatus } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useActiveSubscriptionPlanTemplates,
  useCancelSubscription,
  useMySubscription,
  useSubscribeToPlanTemplate,
} from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Leaf,
  Loader2,
  LogIn,
  Salad,
  Sparkles,
  Truck,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";

// Duration / delivery constants matching backend enum values
const DURATION_WEEKLY = "weekly";
const DURATION_MONTHLY = "monthly";
const DELIVERY_DAILY = "daily";

function SubscriptionSkeleton() {
  return (
    <div
      className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
      data-ocid="subscriptions.loading_state"
    >
      {[1, 2, 3].map((sk) => (
        <div
          key={sk}
          className="rounded-2xl border border-border p-8 space-y-5"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-24" />
          <div className="space-y-2.5 pt-2">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="h-4 w-full" />
            ))}
          </div>
          <Skeleton className="h-11 w-full rounded-xl mt-2" />
        </div>
      ))}
    </div>
  );
}

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp / BigInt(1_000_000));
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(ms));
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function SubscriptionsPage() {
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: subscription, isLoading: subLoading } = useMySubscription();
  const {
    data: plans,
    isLoading: plansLoading,
    isError: plansError,
  } = useActiveSubscriptionPlanTemplates();

  const subscribeMutation = useSubscribeToPlanTemplate();
  const cancelMutation = useCancelSubscription();

  const isLoading = subLoading || plansLoading;
  const hasActiveSub =
    subscription && subscription.status === SubscriptionStatus.active;

  // Group plans: weekly first, then monthly
  const weeklyPlans = (plans ?? []).filter(
    (p) => p.durationType === DURATION_WEEKLY,
  );
  const monthlyPlans = (plans ?? []).filter(
    (p) => p.durationType === DURATION_MONTHLY,
  );
  const sortedPlans = [...weeklyPlans, ...monthlyPlans];

  function handleSubscribe(templateId: bigint, planName: string) {
    subscribeMutation.mutate(templateId, {
      onSuccess: () => {
        toast.success("Subscription activated!", {
          description: `You're now subscribed to ${planName}.`,
        });
      },
      onError: () => {
        toast.error("Failed to subscribe", {
          description: "Please try again.",
        });
      },
    });
  }

  function handleCancel() {
    cancelMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Subscription cancelled", {
          description: "Your subscription has been cancelled.",
        });
      },
      onError: () => {
        toast.error("Failed to cancel", {
          description: "Please try again.",
        });
      },
    });
  }

  if (!isAuthenticated && !isInitializing) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card className="text-center border-border shadow-md">
            <CardContent className="pt-10 pb-8 px-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Salad className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                Sign in to subscribe
              </h2>
              <p className="text-muted-foreground mb-8 text-sm">
                Log in to access subscription plans and enjoy fresh salads
                delivered regularly.
              </p>
              <Button
                onClick={login}
                disabled={isLoggingIn}
                className="w-full bg-primary hover:bg-primary/90 gap-2"
                data-ocid="nav.login_button"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Login to continue
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Header */}
      <section className="gradient-hero py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-6 left-10 w-32 h-32 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-4 right-12 w-40 h-40 rounded-full bg-white blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 bg-white/15 text-white border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
            <Sparkles className="h-3.5 w-3.5" />
            Save more, eat healthier
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
            Fresh Salads, <br className="md:hidden" />
            Every Week
          </h1>
          <p className="text-white/80 text-lg max-w-md mx-auto">
            Subscribe to a plan and get fresh, nutritious salads delivered on
            your schedule.
          </p>
        </motion.div>
      </section>

      <div className="container mx-auto px-4 max-w-5xl -mt-6">
        {/* Active Subscription Banner */}
        <AnimatePresence>
          {hasActiveSub && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8"
            >
              <Card
                className="border-green-300 bg-green-50 shadow-sm"
                data-ocid="subscriptions.active_plan.card"
              >
                <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-green-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800 text-sm">
                        Active Subscription:{" "}
                        <span className="capitalize">{subscription.plan}</span>{" "}
                        Plan
                      </p>
                      {subscription.remainingSalads !== undefined && (
                        <p className="text-xs text-green-700/70 mt-0.5">
                          {subscription.remainingSalads.toString()} salads
                          remaining out of {subscription.totalSalads.toString()}
                        </p>
                      )}
                      {subscription.endDate !== undefined && (
                        <p className="text-xs text-green-700/70 mt-0.5">
                          Expires {formatDate(subscription.endDate)}
                        </p>
                      )}
                      <p className="text-xs text-green-700/70 mt-0.5">
                        Started {formatDate(subscription.startDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge className="bg-green-200 text-green-800 border-0 font-semibold">
                      Active
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      disabled={cancelMutation.isPending}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-1.5"
                      data-ocid="subscriptions.cancel.delete_button"
                    >
                      {cancelMutation.isPending ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5" />
                          Cancel Plan
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Plans */}
        {plansError ? (
          <div
            className="flex flex-col items-center justify-center py-20 gap-4 text-center"
            data-ocid="subscriptions.error_state"
          >
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <Salad className="h-8 w-8 text-destructive/50" />
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">
                Something went wrong
              </p>
              <p className="text-muted-foreground text-sm">
                Unable to load subscription plans. Please refresh the page.
              </p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="mt-8">
            <SubscriptionSkeleton />
          </div>
        ) : sortedPlans.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 gap-4 text-center"
            data-ocid="subscriptions.empty_state"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Salad className="h-8 w-8 text-primary/50" />
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">
                No plans available yet
              </p>
              <p className="text-muted-foreground text-sm">
                Check back soon — subscription plans are coming!
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
          >
            {sortedPlans.map((plan, i) => {
              const isWeekly = plan.durationType === DURATION_WEEKLY;
              const isHighlighted = !!plan.badge;
              const isSubscribing =
                subscribeMutation.isPending &&
                subscribeMutation.variables === plan.id;

              return (
                <motion.div
                  key={plan.id.toString()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  data-ocid={`subscriptions.plan.item.${i + 1}`}
                  className="h-full"
                >
                  <Card
                    className={`relative overflow-hidden h-full border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                      isHighlighted
                        ? "border-green-600 shadow-lg shadow-green-100"
                        : "border-green-200"
                    }`}
                  >
                    {/* Gradient background */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${
                        isHighlighted
                          ? "from-green-700 to-green-800"
                          : "from-emerald-50 to-green-100"
                      }`}
                    />

                    {/* Badge chip */}
                    {plan.badge && (
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-amber-400 text-amber-900 border-0 text-xs font-bold shadow-sm">
                          {plan.badge}
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="relative z-10 pb-2 pt-7 px-6">
                      {/* Duration type icon + label */}
                      <div className="flex items-center gap-2 mb-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isHighlighted ? "bg-white/15" : "bg-green-100"
                          }`}
                        >
                          {isWeekly ? (
                            <CalendarDays
                              className={`h-5 w-5 ${
                                isHighlighted ? "text-white" : "text-green-700"
                              }`}
                            />
                          ) : (
                            <CalendarCheck
                              className={`h-5 w-5 ${
                                isHighlighted ? "text-white" : "text-green-700"
                              }`}
                            />
                          )}
                        </div>
                        <span
                          className={`text-xs font-semibold uppercase tracking-wider ${
                            isHighlighted
                              ? "text-emerald-200"
                              : "text-green-600"
                          }`}
                        >
                          {plan.durationType === DURATION_WEEKLY
                            ? "Weekly"
                            : "Monthly"}
                        </span>
                      </div>

                      {/* Plan name */}
                      <h2
                        className={`font-display text-xl font-bold leading-tight ${
                          isHighlighted ? "text-white" : "text-foreground"
                        }`}
                      >
                        {plan.name}
                      </h2>

                      {/* Salad count + delivery frequency */}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <div
                          className={`flex items-center gap-1.5 text-sm font-medium ${
                            isHighlighted ? "text-white" : "text-green-700"
                          }`}
                        >
                          <Salad className="h-4 w-4" />
                          {plan.saladCount.toString()} salads
                        </div>
                        <div
                          className={`flex items-center gap-1.5 text-sm font-medium ${
                            isHighlighted
                              ? "text-white/80"
                              : "text-muted-foreground"
                          }`}
                        >
                          <Truck className="h-4 w-4" />
                          {plan.deliveryFrequency === DELIVERY_DAILY
                            ? "Daily delivery"
                            : "Weekly delivery"}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mt-3">
                        <span
                          className={`text-3xl font-display font-extrabold ${
                            isHighlighted ? "text-white" : "text-green-700"
                          }`}
                        >
                          {formatPrice(plan.price)}
                        </span>
                        <span
                          className={`text-xs font-normal ml-1 ${
                            isHighlighted
                              ? "text-white/60"
                              : "text-muted-foreground"
                          }`}
                        >
                          /
                          {plan.durationType === DURATION_WEEKLY
                            ? "week"
                            : "month"}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="relative z-10 px-6 pb-7">
                      {/* Features list */}
                      {plan.features.length > 0 && (
                        <ul className="space-y-2 mb-6">
                          {plan.features.map((feature) => (
                            <li
                              key={feature}
                              className="flex items-center gap-2.5 text-sm"
                            >
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  isHighlighted ? "bg-white/20" : "bg-green-100"
                                }`}
                              >
                                <Leaf
                                  className={`h-3 w-3 ${
                                    isHighlighted
                                      ? "text-white"
                                      : "text-green-700"
                                  }`}
                                />
                              </div>
                              <span
                                className={
                                  isHighlighted
                                    ? "text-white/90"
                                    : "text-foreground"
                                }
                              >
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Subscribe button */}
                      {hasActiveSub ? (
                        <div
                          className={`w-full py-3 rounded-xl text-center text-sm font-semibold flex items-center justify-center gap-2 ${
                            isHighlighted
                              ? "bg-white/20 text-white"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Already Subscribed
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleSubscribe(plan.id, plan.name)}
                          disabled={subscribeMutation.isPending}
                          className={`w-full h-11 font-semibold gap-2 rounded-xl transition-all duration-200 ${
                            isHighlighted
                              ? "bg-white text-green-800 hover:bg-white/90 shadow-md"
                              : "bg-primary hover:bg-primary/90 text-white"
                          }`}
                          data-ocid={`subscriptions.plan.primary_button.${i + 1}`}
                        >
                          {isSubscribing ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Subscribing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Subscribe Now
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Info strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-10 bg-white rounded-2xl border border-border p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-sm"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
            <Salad className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">
              Questions about subscriptions?
            </p>
            <p className="text-muted-foreground text-xs mt-0.5">
              Chat with us on WhatsApp or browse our{" "}
              <Link
                to="/menu"
                className="text-primary hover:underline font-medium"
                data-ocid="subscriptions.menu.link"
              >
                fresh menu
              </Link>{" "}
              to see what we offer.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
