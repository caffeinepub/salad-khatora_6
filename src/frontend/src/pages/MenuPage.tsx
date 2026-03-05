import type { MenuItem } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/context/CartContext";
import { useAllMenuItems } from "@/hooks/useQueries";
import {
  Check,
  Flame,
  Leaf,
  Search,
  ShoppingCart,
  SlidersHorizontal,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const CATEGORY_COLORS: Record<string, string> = {
  Vegetarian: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Classic: "bg-amber-100 text-amber-700 border-amber-200",
  Protein: "bg-blue-100 text-blue-700 border-blue-200",
  "Grain Bowl": "bg-orange-100 text-orange-700 border-orange-200",
  Caesar: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Seasonal: "bg-purple-100 text-purple-700 border-purple-200",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FALLBACK_ITEMS: MenuItem[] = [
  {
    id: BigInt(1),
    name: "Garden Fresh Bowl",
    description:
      "Mixed greens with cucumber, cherry tomatoes, radish, and our house tahini vinaigrette.",
    category: "Vegetarian",
    price: 450,
    calories: BigInt(285),
    protein: 8,
    image: "",
    isActive: true,
    available: true,
  },
  {
    id: BigInt(2),
    name: "Mediterranean Greek",
    description:
      "Crisp romaine with feta cheese, kalamata olives, cucumber, tomatoes, and herb dressing.",
    category: "Classic",
    price: 550,
    calories: BigInt(320),
    protein: 12,
    image: "",
    isActive: true,
    available: true,
  },
  {
    id: BigInt(3),
    name: "Grilled Chicken Bowl",
    description:
      "Juicy grilled chicken over mixed greens with avocado, corn, and honey mustard.",
    category: "Protein",
    price: 750,
    calories: BigInt(420),
    protein: 35,
    image: "",
    isActive: true,
    available: true,
  },
  {
    id: BigInt(4),
    name: "Mango Avocado Fiesta",
    description:
      "Fresh mango chunks, avocado, spinach, red cabbage, and citrus lime dressing.",
    category: "Seasonal",
    price: 620,
    calories: BigInt(310),
    protein: 6,
    image: "",
    isActive: true,
    available: true,
  },
  {
    id: BigInt(5),
    name: "Caesar Supreme",
    description:
      "Classic romaine with homemade caesar dressing, parmesan shavings, and herb croutons.",
    category: "Classic",
    price: 580,
    calories: BigInt(390),
    protein: 15,
    image: "",
    isActive: true,
    available: true,
  },
  {
    id: BigInt(6),
    name: "Quinoa Power Bowl",
    description:
      "Protein-packed quinoa with roasted sweet potato, chickpeas, kale, and tahini.",
    category: "Grain Bowl",
    price: 680,
    calories: BigInt(440),
    protein: 18,
    image: "",
    isActive: true,
    available: true,
  },
  {
    id: BigInt(7),
    name: "Shrimp Summer Salad",
    description:
      "Grilled shrimp over baby spinach with mango salsa, red onion, and lime dressing.",
    category: "Protein",
    price: 890,
    calories: BigInt(360),
    protein: 28,
    image: "",
    isActive: true,
    available: true,
  },
  {
    id: BigInt(8),
    name: "Detox Green Cleanse",
    description:
      "Kale, cucumber, celery, mint, green apple with apple cider vinaigrette.",
    category: "Vegetarian",
    price: 480,
    calories: BigInt(195),
    protein: 5,
    image: "",
    isActive: true,
    available: true,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
] as any;

const CATEGORY_IMAGES: Record<string, string> = {
  Vegetarian: "/assets/generated/salad-garden.dim_600x400.jpg",
  Classic: "/assets/generated/salad-greek.dim_600x400.jpg",
  Protein: "/assets/generated/salad-chicken.dim_600x400.jpg",
  "Grain Bowl": "/assets/generated/salad-garden.dim_600x400.jpg",
  Caesar: "/assets/generated/salad-caesar.dim_600x400.jpg",
  Seasonal: "/assets/generated/salad-garden.dim_600x400.jpg",
};

function MenuItemCard({
  item,
  index,
  onAdd,
  isAdded,
}: {
  item: MenuItem;
  index: number;
  onAdd: (item: MenuItem) => void;
  isAdded: boolean;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyItem = item as any;
  const itemImage: string = anyItem.imageUrl ?? anyItem.image ?? "";
  const itemProtein: number = Number(anyItem.protein ?? 0);
  const itemCalories: number = Number(anyItem.calories ?? 0);
  const itemPrice: number = Number(anyItem.price ?? 0);
  const itemIsActive: boolean =
    anyItem.isActive !== false && anyItem.available !== false;

  const imgSrc =
    itemImage && itemImage.length > 0
      ? itemImage
      : (CATEGORY_IMAGES[item.category] ??
        "/assets/generated/salad-garden.dim_600x400.jpg");
  const categoryClass =
    CATEGORY_COLORS[item.category] ??
    "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4) }}
      className="bg-white rounded-2xl overflow-hidden border border-border card-hover group flex flex-col"
      data-ocid={`menu.item.${index + 1}`}
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={imgSrc}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <span
          className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full border ${categoryClass}`}
        >
          {item.category}
        </span>
        {!itemIsActive && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="secondary" className="text-sm">
              Currently Unavailable
            </Badge>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display font-bold text-lg text-foreground mb-1.5 leading-tight">
          {item.name}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
          {item.description}
        </p>

        <div className="flex items-center gap-2 flex-wrap mb-4">
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-1">
            <Flame className="h-3 w-3 text-orange-500" />
            {itemCalories.toString()} kcal
          </div>
          {itemProtein > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-1">
              <Leaf className="h-3 w-3 text-blue-500" />
              {itemProtein.toFixed(0)}g protein
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-1">
            <Leaf className="h-3 w-3 text-primary" />
            Fresh daily
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="font-display font-bold text-2xl text-primary">
            ₹{itemPrice.toLocaleString("en-IN")}
          </span>
          <Button
            size="sm"
            onClick={() => onAdd(item)}
            disabled={!itemIsActive || isAdded}
            className={`gap-2 transition-all duration-300 ${
              isAdded
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : "bg-primary hover:bg-primary/90 text-white"
            }`}
            data-ocid={`menu.add_button.${index + 1}`}
          >
            {isAdded ? (
              <>
                <Check className="h-4 w-4" />
                Added
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                Add
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

function MenuSkeleton() {
  return (
    <>
      {["s1", "s2", "s3", "s4", "s5", "s6"].map((sk) => (
        <div
          key={sk}
          className="rounded-2xl overflow-hidden border border-border"
        >
          <Skeleton className="aspect-[4/3] w-full" />
          <div className="p-5 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-9 w-20 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export default function MenuPage() {
  const { data: menuItems, isLoading, isError } = useAllMenuItems();
  const { addItem, items: cartItems } = useCart();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Only show active/available items to customers
  const allItems =
    menuItems && menuItems.length > 0 ? menuItems : FALLBACK_ITEMS;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const displayItems = allItems.filter((item) => {
    const anyItem = item as any;
    return anyItem.available !== false && anyItem.isActive !== false;
  });

  const categories = useMemo(() => {
    const cats = new Set<string>(["All"]);
    for (const item of displayItems) cats.add(item.category);
    return Array.from(cats);
  }, [displayItems]);

  const filtered = useMemo(() => {
    return displayItems.filter((item) => {
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [displayItems, search, activeCategory]);

  const cartItemIds = new Set(cartItems.map((i) => i.menuItemId.toString()));

  const handleAdd = (item: MenuItem) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyItem = item as any;
    addItem({
      menuItemId: item.id,
      name: item.name,
      unitPrice: Number(anyItem.price ?? 0),
    });
    toast.success(`${item.name} added to cart`);
  };

  if (isError) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div
          className="max-w-md w-full text-center bg-white rounded-2xl border border-border p-10 shadow-sm"
          data-ocid="menu.error_state"
        >
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-5">
            <Search className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            Something went wrong
          </h2>
          <p className="text-muted-foreground text-sm">
            Unable to load the menu. Please refresh the page.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-primary/5 border-b border-border py-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge
              variant="outline"
              className="mb-3 border-primary/30 text-primary"
            >
              Fresh today
            </Badge>
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">
              Our Menu
            </h1>
            <p className="text-muted-foreground">
              Handcrafted salads made fresh every day
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search salads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-border"
              data-ocid="menu.search_input"
            />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground mr-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
                data-ocid="menu.filter.tab"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          data-ocid="menu.list"
        >
          {isLoading ? (
            <MenuSkeleton />
          ) : filtered.length === 0 ? (
            <div
              className="col-span-full flex flex-col items-center justify-center py-20 gap-4"
              data-ocid="menu.empty_state"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground mb-1">
                  No results found
                </p>
                <p className="text-muted-foreground text-sm">
                  Try a different search or category
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.map((item, i) => (
                <MenuItemCard
                  key={item.id.toString()}
                  item={item}
                  index={i}
                  onAdd={handleAdd}
                  isAdded={cartItemIds.has(item.id.toString())}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </main>
  );
}
