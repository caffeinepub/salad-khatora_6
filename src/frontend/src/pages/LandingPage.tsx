import BuildYourBowlModal from "@/components/BuildYourBowlModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { useTopOrderedMenuItems } from "@/hooks/useQueries";
import { useApprovedReviews } from "@/hooks/useReviewQueries";
import { getOrderFrequency } from "@/utils/orderFrequency";
import { Link } from "@tanstack/react-router";
import {
  Apple,
  Clock,
  Flame,
  Heart,
  Leaf,
  Shield,
  ShoppingBag,
  Sprout,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

// Safely unwrap ICP Option<string> OR plain string image URL
function resolveImageUrl(raw: unknown): string {
  if (!raw) return "";
  if (Array.isArray(raw)) {
    return raw.length > 0 && typeof raw[0] === "string" ? raw[0] : "";
  }
  if (typeof raw === "object" && raw !== null) {
    const opt = raw as { __kind__?: string; value?: unknown };
    if (opt.__kind__ === "Some" && typeof opt.value === "string")
      return opt.value;
    if (opt.__kind__ === "None") return "";
  }
  if (typeof raw === "string") return raw;
  return "";
}

const DEFAULT_FOOD_IMG =
  "/assets/generated/default-food-transparent.dim_600x400.png";

const features = [
  {
    icon: Leaf,
    title: "100% Fresh Ingredients",
    description:
      "Sourced daily from local farms. Every leaf, every vegetable, picked at peak freshness.",
  },
  {
    icon: UtensilsCrossed,
    title: "Customizable Bowls",
    description:
      "Build your perfect bowl. Choose your base, toppings, dressings, and protein — live calorie updates.",
  },
  {
    icon: Heart,
    title: "Healthy Metrics",
    description:
      "Track your BMI, calories, and nutritional goals with every meal you order.",
  },
];

const valueCards = [
  {
    icon: Leaf,
    label: "Fresh Ingredients",
    desc: "Sourced daily from local farms",
  },
  {
    icon: Heart,
    label: "Healthy Meals",
    desc: "Balanced nutrition in every bowl",
  },
  {
    icon: Apple,
    label: "Nutrition Focused",
    desc: "Track calories & macros",
  },
  {
    icon: Clock,
    label: "Quick Delivery",
    desc: "Fast delivery to your door",
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Fitness Coach",
    text: "Finally a salad place that gets nutrition right. The BMI tracker is a game-changer!",
    rating: 5,
  },
  {
    name: "Rohan Mehta",
    role: "Software Engineer",
    text: "Order daily for lunch. The Caesar is incredible and delivery is always on time.",
    rating: 5,
  },
  {
    name: "Ananya Iyer",
    role: "Yoga Instructor",
    text: "The custom bowl builder lets me hit my macros perfectly. Absolutely love it.",
    rating: 5,
  },
];

function formatReviewDate(ts: bigint) {
  return new Date(Number(ts / 1_000_000n)).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function LandingPage() {
  const { data: topItems, isLoading: topItemsLoading } =
    useTopOrderedMenuItems(3);
  const freq = getOrderFrequency();
  const { data: approvedReviews, isLoading: reviewsLoading } =
    useApprovedReviews();
  const [buildBowlOpen, setBuildBowlOpen] = useState(false);

  // Carousel auto-scroll
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const scrollNext = useCallback(() => {
    if (carouselApi) carouselApi.scrollNext();
  }, [carouselApi]);

  useEffect(() => {
    const timer = setInterval(scrollNext, 4000);
    return () => clearInterval(timer);
  }, [scrollNext]);

  return (
    <main className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero text-white">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 bg-white translate-x-32 -translate-y-16" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-5 bg-white -translate-x-16 translate-y-16" />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs font-medium px-3 py-1">
                🥗 Your City's Freshest Salad Bar
              </Badge>
              <h1 className="font-display text-5xl md:text-6xl font-bold leading-[1.1] mb-6 text-balance">
                Fresh Salads.{" "}
                <span className="text-green-200">Healthy Daily Meals.</span>
              </h1>
              <p className="text-white/80 text-lg mb-8 leading-relaxed max-w-md">
                Hand-crafted salads with fresh seasonal ingredients. Build your
                perfect customizable bowl or choose a subscription meal plan —
                delivered fresh, every day.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg gap-2"
                  onClick={() =>
                    document
                      .getElementById("menu-preview")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  data-ocid="landing.order_now_button"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Order Now
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white/60 text-white hover:bg-white/10 font-semibold gap-2"
                  data-ocid="landing.view_menu_button"
                >
                  <Link to="/menu">
                    <Leaf className="h-5 w-5" />
                    View Menu
                  </Link>
                </Button>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-2 mt-8">
                <div className="flex -space-x-2">
                  {["AK", "HR", "SM"].map((initials) => (
                    <div
                      key={initials}
                      className="w-8 h-8 rounded-full bg-white/30 border-2 border-white/50 flex items-center justify-center text-[10px] font-bold"
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <p className="text-white/80 text-sm">
                  <strong className="text-white">10,000+</strong> happy
                  customers
                </p>
              </div>
            </motion.div>

            {/* Hero image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex items-center justify-center"
            >
              <div className="relative w-full">
                <div className="absolute inset-0 rounded-3xl bg-white/10 blur-3xl transform scale-110" />
                <img
                  src="/assets/generated/hero-salad-bowl.dim_1200x900.jpg"
                  alt="Fresh Salad Bowl"
                  className="relative rounded-3xl w-full max-h-[440px] object-cover aspect-[4/3] shadow-2xl ring-1 ring-white/20"
                  onError={(e) => {
                    const t = e.currentTarget;
                    if (!t.src.includes("default-food")) {
                      t.src = DEFAULT_FOOD_IMG;
                    }
                  }}
                />
                {/* Floating calorie badge */}
                <motion.div
                  animate={{ y: [-4, 4, -4] }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 3,
                    ease: "easeInOut",
                  }}
                  className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-4 py-3 shadow-xl"
                >
                  <p className="text-xs text-muted-foreground font-medium">
                    Avg. Calories
                  </p>
                  <p className="font-display text-2xl font-bold text-primary">
                    320 kcal
                  </p>
                </motion.div>
                <motion.div
                  animate={{ y: [4, -4, 4] }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 3.5,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-4 -right-4 bg-white rounded-2xl px-4 py-3 shadow-xl"
                >
                  <div className="flex items-center gap-1">
                    {["s1", "s2", "s3", "s4", "s5"].map((k) => (
                      <Star
                        key={k}
                        className="h-3 w-3 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    4.9 / 5 stars
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Value Cards Bar */}
      <section className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {valueCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 border border-border flex flex-col items-center text-center gap-3 hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <div className="w-12 h-12 rounded-xl border-2 border-primary/20 bg-primary/5 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-display font-bold text-foreground text-sm">
                      {card.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {card.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Build Your Bowl Section */}
      <section className="bg-primary/5 border-b border-border py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge
                variant="outline"
                className="mb-4 border-primary/30 text-primary"
              >
                Customizable
              </Badge>
              <h2 className="font-display text-4xl font-bold text-foreground mb-4">
                Build Your Perfect Bowl
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Choose your base, vegetables, protein, and dressing. See live
                calorie &amp; price updates as you build.
              </p>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 font-semibold gap-2"
                onClick={() => setBuildBowlOpen(true)}
                data-ocid="landing.build_bowl_button"
              >
                <Sprout className="h-5 w-5" />
                Start Building
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                {
                  step: "1",
                  label: "Choose Base",
                  desc: "Lettuce, Quinoa, Brown Rice",
                  icon: Leaf,
                },
                {
                  step: "2",
                  label: "Add Vegetables",
                  desc: "Up to 4 fresh picks",
                  icon: Sprout,
                },
                {
                  step: "3",
                  label: "Pick Protein",
                  desc: "Paneer, Tofu, Chickpeas & more",
                  icon: Heart,
                },
                {
                  step: "4",
                  label: "Select Dressing",
                  desc: "Tahini, Caesar, Citrus...",
                  icon: UtensilsCrossed,
                },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.step}
                    className="bg-white rounded-2xl p-5 border border-border flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {s.step}
                      </span>
                      <Icon
                        className="h-4 w-4 text-primary"
                        strokeWidth={1.5}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        {s.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <Badge
            variant="outline"
            className="mb-4 border-primary/30 text-primary"
          >
            Why choose us
          </Badge>
          <h2 className="font-display text-4xl font-bold text-foreground mb-4">
            Freshness is our promise
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Every bowl starts with a commitment to quality, nutrition, and
            taste.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative group"
              >
                <div className="bg-white rounded-2xl p-8 border border-border card-hover h-full">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-7 w-7 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-3 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Menu Preview */}
      <section
        id="menu-preview"
        className="bg-primary/5 border-y border-border py-20"
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between mb-14 gap-6"
          >
            <div>
              <Badge
                variant="outline"
                className="mb-4 border-primary/30 text-primary"
              >
                Our menu
              </Badge>
              <h2 className="font-display text-4xl font-bold text-foreground">
                Fresh picks today
              </h2>
            </div>
            <Button
              asChild
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white transition-colors"
            >
              <Link to="/menu">View Full Menu →</Link>
            </Button>
          </motion.div>

          <div
            className="grid md:grid-cols-3 gap-6"
            data-ocid="landing.fresh_picks.list"
          >
            {topItemsLoading ? (
              (["sk-a", "sk-b", "sk-c"] as const).map((skKey) => (
                <div
                  key={skKey}
                  className="bg-white rounded-2xl overflow-hidden border border-border"
                >
                  <Skeleton className="w-full aspect-[3/2]" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                  </div>
                </div>
              ))
            ) : topItems.length === 0 ? (
              <div
                className="md:col-span-3 text-center py-12 rounded-2xl border border-dashed border-border bg-muted/20"
                data-ocid="landing.fresh_picks.empty_state"
              >
                <Leaf className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Menu items coming soon — check back shortly!
                </p>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="mt-4 border-primary text-primary hover:bg-primary hover:text-white"
                >
                  <Link to="/menu">Browse Menu</Link>
                </Button>
              </div>
            ) : (
              topItems.map((item, i) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const anyItem = item as any;
                const rawImageUrl = anyItem.imageUrl ?? anyItem.image;
                const resolved = resolveImageUrl(rawImageUrl);
                const imgSrc =
                  resolved.length > 0 ? resolved : DEFAULT_FOOD_IMG;
                const itemPrice = Number(anyItem.price ?? 0);
                const itemCalories = Number(anyItem.calories ?? 0);
                const itemCategory: string = anyItem.category ?? "Fresh";
                const orderCount = freq[item.id.toString()] ?? 0;

                return (
                  <motion.div
                    key={item.id.toString()}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    data-ocid={`landing.fresh_picks.item.${i + 1}`}
                  >
                    <Link
                      to="/menu"
                      className="block bg-white rounded-2xl overflow-hidden border border-border card-hover group flex flex-col h-full"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={imgSrc}
                          alt={item.name}
                          className="w-full aspect-[3/2] object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={(e) => {
                            const t = e.currentTarget;
                            if (!t.src.includes("default-food")) {
                              t.src = DEFAULT_FOOD_IMG;
                            }
                          }}
                        />
                        <Badge className="absolute top-3 left-3 bg-primary text-white border-0 text-xs capitalize">
                          {itemCategory}
                        </Badge>
                        {orderCount > 0 && (
                          <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
                            <Flame className="h-3 w-3" />
                            Popular
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-display font-bold text-lg text-foreground mb-1 line-clamp-1">
                          {item.name}
                        </h3>
                        <div className="flex-1" />
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-primary font-bold text-xl font-display">
                            ₹{itemPrice.toFixed(0)}
                          </span>
                          <span className="text-xs text-muted-foreground bg-muted rounded-full px-3 py-1">
                            {itemCalories} kcal
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Testimonials / Reviews Carousel */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <Badge
            variant="outline"
            className="mb-4 border-primary/30 text-primary"
          >
            Customer love
          </Badge>
          <h2 className="font-display text-4xl font-bold text-foreground">
            Real people, real results
          </h2>
        </motion.div>

        {reviewsLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {(["sk-r1", "sk-r2", "sk-r3"] as const).map((k) => (
              <div
                key={k}
                className="bg-white rounded-2xl p-6 border border-border"
              >
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-16 w-full mb-4" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          (() => {
            const hasLiveReviews =
              approvedReviews && approvedReviews.length > 0;
            const reviewCards = hasLiveReviews
              ? [...approvedReviews]
                  .sort((a, b) => Number(b.createdAt - a.createdAt))
                  .slice(0, 8)
                  .map((r) => ({
                    key: r.id.toString(),
                    rating: Number(r.rating),
                    text: r.reviewText,
                    name: r.reviewerName,
                    role: r.profession ?? "",
                    date: formatReviewDate(r.createdAt),
                  }))
              : testimonials.map((t, i) => ({
                  key: `static-${i}`,
                  rating: t.rating,
                  text: t.text,
                  name: t.name,
                  role: t.role,
                  date: "",
                }));

            return (
              <>
                <div className="relative px-10">
                  <Carousel
                    opts={{ loop: true, align: "start" }}
                    setApi={setCarouselApi}
                  >
                    <CarouselContent>
                      {reviewCards.map((card) => (
                        <CarouselItem
                          key={card.key}
                          className="basis-full md:basis-1/3"
                        >
                          <div className="bg-white rounded-2xl p-6 border border-border card-hover h-full flex flex-col">
                            <div className="flex items-center gap-0.5 mb-4">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`h-4 w-4 ${
                                    s <= card.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "fill-muted text-muted-foreground/20"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-foreground mb-4 leading-relaxed flex-1">
                              &ldquo;{card.text}&rdquo;
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                                  {card.name[0]?.toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-sm text-foreground">
                                    {card.name}
                                  </p>
                                  {card.role && (
                                    <p className="text-xs text-muted-foreground">
                                      {card.role}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {card.date && (
                                <span className="text-[10px] text-muted-foreground">
                                  {card.date}
                                </span>
                              )}
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="border-border hover:bg-primary hover:text-white hover:border-primary transition-colors" />
                    <CarouselNext className="border-border hover:bg-primary hover:text-white hover:border-primary transition-colors" />
                  </Carousel>
                </div>
                <div className="flex justify-center mt-8">
                  <Button
                    asChild
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                    data-ocid="landing.view_all_reviews_button"
                  >
                    <Link to="/reviews">View All Reviews →</Link>
                  </Button>
                </div>
              </>
            );
          })()
        )}
      </section>

      {/* CTA Section */}
      <section className="gradient-hero text-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Ready to eat fresh?
            </h2>
            <p className="text-white/80 mb-8 max-w-md mx-auto">
              Join hundreds of health-conscious people who've made Salad Khatora
              their go-to daily meal.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-semibold gap-2"
                data-ocid="landing.cta_order_button"
              >
                <Link to="/menu">
                  <ShoppingBag className="h-5 w-5" />
                  Order Now
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/50 text-white hover:bg-white/10 font-semibold gap-2"
              >
                <Link to="/subscriptions">
                  <Clock className="h-5 w-5" />
                  View Meal Plans
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
              <Leaf className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-foreground">
              Salad Khatora
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()}. Built with{" "}
            <Heart className="inline h-3.5 w-3.5 text-red-500 mx-0.5" /> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              className="text-primary hover:underline font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            Secured by Internet Computer
          </div>
        </div>
      </footer>

      <BuildYourBowlModal
        open={buildBowlOpen}
        onOpenChange={setBuildBowlOpen}
      />
    </main>
  );
}
