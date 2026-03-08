import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTopOrderedMenuItems } from "@/hooks/useQueries";
import { getOrderFrequency } from "@/utils/orderFrequency";
import { Link } from "@tanstack/react-router";
import {
  Clock,
  Flame,
  Heart,
  Leaf,
  Shield,
  ShoppingBag,
  Star,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

// Safely unwrap ICP Option<string> OR plain string image URL
function resolveImageUrl(raw: unknown): string {
  if (!raw) return "";
  if (typeof raw === "object" && raw !== null) {
    const opt = raw as { __kind__?: string; value?: unknown };
    if (opt.__kind__ === "Some" && typeof opt.value === "string")
      return opt.value;
    if (opt.__kind__ === "None") return "";
  }
  if (typeof raw === "string") return raw;
  return "";
}

const features = [
  {
    icon: Leaf,
    title: "100% Fresh Ingredients",
    description:
      "Sourced daily from local farms. Every leaf, every vegetable, picked at peak freshness.",
  },
  {
    icon: Zap,
    title: "Custom Orders",
    description:
      "Build your perfect bowl. Choose your base, toppings, dressings, and protein.",
  },
  {
    icon: Heart,
    title: "Healthy Metrics",
    description:
      "Track your BMI, calories, and nutritional goals with every meal you order.",
  },
];

const stats = [
  { value: "50+", label: "Fresh Items" },
  { value: "10k+", label: "Happy Customers" },
  { value: "4.9★", label: "Average Rating" },
  { value: "30min", label: "Avg Delivery" },
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

export default function LandingPage() {
  const { data: topItems, isLoading: topItemsLoading } =
    useTopOrderedMenuItems(3);
  const freq = getOrderFrequency();

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
                Eat Fresh. <span className="text-green-200">Feel Amazing.</span>
              </h1>
              <p className="text-white/80 text-lg mb-8 leading-relaxed max-w-md">
                Hand-crafted salads made with seasonal ingredients, delivered
                fresh in your city. Track your health metrics and build a better
                you — one bowl at a time.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg gap-2"
                  data-ocid="landing.browse_menu_button"
                >
                  <Link to="/menu">
                    <ShoppingBag className="h-5 w-5" />
                    Browse Menu
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-white text-green-800 border border-green-800 hover:bg-green-800 hover:text-white font-semibold gap-2"
                  data-ocid="landing.get_started_button"
                >
                  <Link to="/profile">
                    <Heart className="h-5 w-5" />
                    Get Started
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

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden md:block"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-white/10 blur-3xl transform scale-110" />
                <img
                  src="/assets/generated/hero-salad.dim_1200x700.jpg"
                  alt="Fresh Salad Bowl"
                  className="relative rounded-3xl w-full object-cover aspect-[4/3] shadow-2xl ring-1 ring-white/20"
                  onError={(e) => {
                    const t = e.currentTarget;
                    if (!t.src.includes("placeholder")) {
                      t.src =
                        "/assets/generated/placeholder-salad.dim_600x400.png";
                    }
                  }}
                />
                {/* Floating badge */}
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

      {/* Stats Bar */}
      <section className="bg-primary/5 border-y border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="font-display text-3xl font-bold text-primary">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </motion.div>
            ))}
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
                    <Icon className="h-7 w-7 text-primary" />
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
      <section className="bg-primary/5 border-y border-border py-20">
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
              // Loading skeletons — use stable string keys, not array index
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
                const imgSrc =
                  resolveImageUrl(rawImageUrl) ||
                  "/assets/generated/placeholder-salad.dim_600x400.png";
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
                      className="block bg-white rounded-2xl overflow-hidden border border-border card-hover group"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={imgSrc}
                          alt={item.name}
                          className="w-full aspect-[3/2] object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={(e) => {
                            const t = e.currentTarget;
                            if (!t.src.includes("placeholder")) {
                              t.src =
                                "/assets/generated/placeholder-salad.dim_600x400.png";
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
                      <div className="p-5">
                        <h3 className="font-display font-bold text-lg text-foreground mb-1 line-clamp-1">
                          {item.name}
                        </h3>
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

      {/* Testimonials */}
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

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-border card-hover"
            >
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: t.rating }, (_, j) => (
                  <Star
                    key={`star-${t.name}-${j}`}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-foreground mb-4 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
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
                data-ocid="landing.browse_menu_button"
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
                <Link to="/profile">
                  <Clock className="h-5 w-5" />
                  Set Up Profile
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
    </main>
  );
}
