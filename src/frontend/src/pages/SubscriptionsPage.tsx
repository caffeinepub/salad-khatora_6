import { SubscriptionPlan, SubscriptionStatus } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useCancelSubscription,
  useMySubscription,
  useSubscribeToPlan,
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
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";

const PLANS = [
  {
    id: SubscriptionPlan.weekly,
    name: "Weekly Plan",
    saladCount: 6,
    period: "per week",
    price: "₹1,800",
    icon: CalendarDays,
    color: "from-emerald-50 to-green-100",
    borderColor: "border-green-200",
    accentColor: "text-green-700",
    badgeBg: "bg-green-100 text-green-700",
    highlight: false,
    features: [
      "6 freshly prepared salads",
      "Weekly delivery schedule",
      "Mix & match from menu",
      "Free delivery",
    ],
    ocidCard: "subscriptions.weekly_plan.card",
    ocidButton: "subscriptions.weekly.primary_button",
  },
  {
    id: SubscriptionPlan.monthly,
    name: "Monthly Plan",
    saladCount: 24,
    period: "per month",
    price: "₹6,000",
    icon: CalendarCheck,
    color: "from-green-700 to-green-800",
    borderColor: "border-green-600",
    accentColor: "text-white",
    badgeBg: "bg-white/20 text-white",
    highlight: true,
    features: [
      "24 freshly prepared salads",
      "Daily delivery available",
      "Priority menu selection",
      "Free delivery + bonus salad",
    ],
    ocidCard: "subscriptions.monthly_plan.card",
    ocidButton: "subscriptions.monthly.primary_button",
  },
];

function SubscriptionSkeleton() {
  return (
    <div
      className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
      data-ocid="subscriptions.loading_state"
    >
      {["sk1", "sk2"].map((sk) => (
        <div
          key={sk}
          className="rounded-2xl border border-border p-8 space-y-5"
        >
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-9 w-24" />
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
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(ms));
}

export default function SubscriptionsPage() {
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: subscription, isLoading, isError } = useMySubscription();
  const subscribeMutation = useSubscribeToPlan();
  const cancelMutation = useCancelSubscription();

  const hasActiveSub =
    subscription && subscription.status === SubscriptionStatus.active;

  function handleSubscribe(plan: SubscriptionPlan) {
    subscribeMutation.mutate(plan, {
      onSuccess: () => {
        toast.success("Subscription activated!", {
          description: `Your ${plan} plan is now active.`,
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

      <div className="container mx-auto px-4 max-w-4xl -mt-6">
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
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(subscription as any).remainingSalads !== undefined && (
                        <p className="text-xs text-green-700/70 mt-0.5">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(subscription as any).remainingSalads.toString()}{" "}
                          salads remaining out of{" "}
                          {(subscription as any).totalSalads.toString()}
                        </p>
                      )}
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(subscription as any).endDate !== undefined && (
                        <p className="text-xs text-green-700/70 mt-0.5">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          Expires {formatDate((subscription as any).endDate)}
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
        {isError ? (
          <div
            className="flex flex-col items-center justify-center py-20 gap-4 text-center"
            data-ocid="subscriptions.error_state"
          >
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <Salad className="h-8 w-8 text-destructive/50" />
            </div>
            <div>
              <p className="font-semibold text-white mb-1">
                Something went wrong
              </p>
              <p className="text-white/70 text-sm">
                Unable to load subscription plans. Please refresh the page.
              </p>
            </div>
          </div>
        ) : isLoading ? (
          <SubscriptionSkeleton />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mt-8"
          >
            {PLANS.map((plan, i) => {
              const PlanIcon = plan.icon;
              const isCurrentPlan =
                hasActiveSub && subscription?.plan === plan.id;
              const isHighlighted = plan.highlight;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  data-ocid={plan.ocidCard}
                >
                  <Card
                    className={`relative overflow-hidden h-full border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                      isHighlighted
                        ? "border-green-600 shadow-lg shadow-green-200"
                        : plan.borderColor
                    }`}
                  >
                    {isHighlighted && (
                      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-green-500 to-emerald-400" />
                    )}
                    {isHighlighted && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-amber-400 text-amber-900 border-0 text-xs font-bold">
                          Best Value
                        </Badge>
                      </div>
                    )}

                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-100`}
                    />

                    <CardHeader className="relative z-10 pb-2 pt-7 px-7">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                          isHighlighted ? "bg-white/15" : "bg-green-100"
                        }`}
                      >
                        <PlanIcon
                          className={`h-6 w-6 ${isHighlighted ? "text-white" : "text-green-700"}`}
                        />
                      </div>

                      <h2
                        className={`font-display text-2xl font-bold ${isHighlighted ? "text-white" : "text-foreground"}`}
                      >
                        {plan.name}
                      </h2>

                      <div className="flex items-end gap-1 mt-1">
                        <div
                          className={`flex items-center gap-2 text-3xl font-display font-extrabold ${isHighlighted ? "text-white" : "text-green-700"}`}
                        >
                          <Salad
                            className={`h-7 w-7 ${isHighlighted ? "text-white/80" : "text-green-600"}`}
                          />
                          {plan.saladCount}
                        </div>
                        <span
                          className={`text-sm pb-1 font-medium ${isHighlighted ? "text-white/70" : "text-muted-foreground"}`}
                        >
                          salads {plan.period}
                        </span>
                      </div>

                      <p
                        className={`text-lg font-bold mt-2 ${isHighlighted ? "text-emerald-200" : "text-green-700"}`}
                      >
                        {plan.price}
                        <span
                          className={`text-xs font-normal ml-1 ${isHighlighted ? "text-white/60" : "text-muted-foreground"}`}
                        >
                          {plan.period}
                        </span>
                      </p>
                    </CardHeader>

                    <CardContent className="relative z-10 px-7 pb-7">
                      <ul className="space-y-2.5 mb-6">
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
                                className={`h-3 w-3 ${isHighlighted ? "text-white" : "text-green-700"}`}
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

                      {isCurrentPlan ? (
                        <div
                          className={`w-full py-3 rounded-xl text-center text-sm font-semibold flex items-center justify-center gap-2 ${
                            isHighlighted
                              ? "bg-white/20 text-white"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Current Plan
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleSubscribe(plan.id)}
                          disabled={
                            subscribeMutation.isPending || !!hasActiveSub
                          }
                          className={`w-full h-11 font-semibold gap-2 rounded-xl transition-all duration-200 ${
                            isHighlighted
                              ? "bg-white text-green-800 hover:bg-white/90 shadow-md"
                              : "bg-primary hover:bg-primary/90 text-white"
                          }`}
                          data-ocid={plan.ocidButton}
                        >
                          {subscribeMutation.isPending &&
                          subscribeMutation.variables === plan.id ? (
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
          className="mt-10 max-w-3xl mx-auto bg-white rounded-2xl border border-border p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-sm"
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
