import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApprovedReviews } from "@/hooks/useReviewQueries";
import { Star } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";

function StarRating({
  rating,
  size = "sm",
}: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass =
    size === "lg" ? "h-6 w-6" : size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        const filled = s <= Math.floor(rating);
        const half = !filled && s - 0.5 <= rating;
        return (
          <Star
            key={s}
            className={`${sizeClass} ${
              filled
                ? "fill-amber-400 text-amber-400"
                : half
                  ? "fill-amber-200 text-amber-400"
                  : "fill-muted text-muted-foreground/20"
            }`}
          />
        );
      })}
    </div>
  );
}

function formatReviewDate(ts: bigint) {
  return new Date(Number(ts / 1_000_000n)).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const PAGE_SIZE = 12;

export default function ReviewsPage() {
  const { data: approvedReviews, isLoading } = useApprovedReviews();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const sortedReviews = useMemo(() => {
    if (!approvedReviews) return [];
    return [...approvedReviews].sort((a, b) =>
      Number(b.createdAt - a.createdAt),
    );
  }, [approvedReviews]);

  const avgRating = useMemo(() => {
    if (!sortedReviews.length) return 0;
    const sum = sortedReviews.reduce((acc, r) => acc + Number(r.rating), 0);
    return sum / sortedReviews.length;
  }, [sortedReviews]);

  const visibleReviews = sortedReviews.slice(0, visibleCount);
  const hasMore = visibleCount < sortedReviews.length;

  return (
    <main className="min-h-screen bg-background" data-ocid="reviews.page">
      {/* Page Header */}
      <section className="gradient-hero text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 bg-white/20 text-white border-white/30 text-xs font-medium px-3 py-1">
              What our customers say
            </Badge>
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
              Customer Reviews
            </h1>
            <p className="text-white/80 text-lg max-w-lg mx-auto">
              Real stories from real customers across India who love eating
              fresh with Salad Khatora.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Rating Summary */}
        {!isLoading && sortedReviews.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl border border-border p-8 mb-12 flex flex-col md:flex-row items-center gap-8 justify-center"
            data-ocid="reviews.rating_summary.section"
          >
            <div className="text-center">
              <p className="font-display text-7xl font-bold text-primary leading-none">
                {avgRating.toFixed(1)}
              </p>
              <p className="text-muted-foreground text-sm mt-1">out of 5</p>
            </div>
            <div className="flex flex-col items-center md:items-start gap-2">
              <StarRating rating={avgRating} size="lg" />
              <p className="text-muted-foreground text-sm">
                Based on{" "}
                <strong className="text-foreground">
                  {sortedReviews.length}
                </strong>{" "}
                customer review{sortedReviews.length !== 1 ? "s" : ""}
              </p>
            </div>
          </motion.section>
        )}

        {/* Loading State */}
        {isLoading && (
          <div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid="reviews.loading_state"
          >
            {(["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"] as const).map(
              (k) => (
                <div
                  key={k}
                  className="bg-white rounded-2xl p-6 border border-border"
                >
                  <Skeleton className="h-4 w-24 mb-4" />
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && sortedReviews.length === 0 && (
          <div className="text-center py-24" data-ocid="reviews.empty_state">
            <div className="flex items-center justify-center gap-0.5 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className="h-8 w-8 fill-muted text-muted-foreground/20"
                />
              ))}
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No reviews yet
            </h3>
            <p className="text-muted-foreground">
              Be the first to share your experience with Salad Khatora!
            </p>
          </div>
        )}

        {/* Reviews Grid */}
        {!isLoading && sortedReviews.length > 0 && (
          <>
            <div
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
              data-ocid="reviews.list"
            >
              {visibleReviews.map((review, i) => (
                <motion.div
                  key={review.id.toString()}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % PAGE_SIZE) * 0.04 }}
                  data-ocid={`reviews.item.${i + 1}`}
                  className="bg-white rounded-2xl p-6 border border-border card-hover flex flex-col"
                >
                  <StarRating rating={Number(review.rating)} />
                  <p className="text-foreground mt-4 mb-6 leading-relaxed flex-1 text-sm">
                    &ldquo;{review.reviewText}&rdquo;
                  </p>
                  <div className="flex items-center justify-between gap-3 mt-auto">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                        {review.reviewerName[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">
                          {review.reviewerName}
                        </p>
                        {review.profession && (
                          <p className="text-xs text-muted-foreground">
                            {review.profession}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatReviewDate(review.createdAt)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-primary text-primary hover:bg-primary hover:text-white transition-colors px-10"
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  data-ocid="reviews.load_more_button"
                >
                  Load More Reviews
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
