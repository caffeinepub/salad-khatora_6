import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitReview } from "@/hooks/useReviewQueries";
import { Loader2, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReviewModal({ open, onOpenChange }: ReviewModalProps) {
  const [name, setName] = useState("");
  const [profession, setProfession] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const submitReview = useSubmitReview();

  function handleClose() {
    setName("");
    setProfession("");
    setRating(0);
    setHoverRating(0);
    setReviewText("");
    onOpenChange(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    if (reviewText.trim().length < 10) {
      toast.error("Review must be at least 10 characters");
      return;
    }

    submitReview.mutate(
      {
        reviewerName: name.trim(),
        profession: profession.trim() || null,
        rating: BigInt(rating),
        reviewText: reviewText.trim(),
      },
      {
        onSuccess: () => {
          toast.success(
            "Your review has been submitted and is awaiting approval",
          );
          handleClose();
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Failed to submit review",
          );
        },
      },
    );
  }

  const displayRating = hoverRating || rating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        data-ocid="review.modal"
        onInteractOutside={(e) => {
          if (submitReview.isPending) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">
            Leave a Review
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="reviewer-name" className="text-sm font-medium">
              Your Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="reviewer-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              required
              data-ocid="review.name.input"
            />
          </div>

          {/* Profession */}
          <div className="space-y-1.5">
            <Label
              htmlFor="reviewer-profession"
              className="text-sm font-medium"
            >
              Profession{" "}
              <span className="text-muted-foreground text-xs font-normal">
                (optional)
              </span>
            </Label>
            <Input
              id="reviewer-profession"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="e.g. Fitness Coach"
              data-ocid="review.profession.input"
            />
          </div>

          {/* Star Rating */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Rating <span className="text-destructive">*</span>
            </Label>
            <div
              className="flex items-center gap-1"
              role="radiogroup"
              aria-label="Star rating"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`${star} star${star !== 1 ? "s" : ""}`}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm transition-transform hover:scale-110"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= displayRating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {
                    ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][
                      rating
                    ]
                  }
                </span>
              )}
            </div>
          </div>

          {/* Review Text */}
          <div className="space-y-1.5">
            <Label htmlFor="review-text" className="text-sm font-medium">
              Your Review <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="review-text"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell us about your experience with Salad Khatora..."
              rows={4}
              maxLength={500}
              className="resize-none"
              data-ocid="review.text.textarea"
            />
            <p className="text-xs text-muted-foreground text-right">
              {reviewText.length}/500
            </p>
          </div>

          {/* Footer note */}
          <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
            ✓ Reviews are reviewed before publishing
          </p>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={submitReview.isPending}
              data-ocid="review.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={submitReview.isPending}
              data-ocid="review.submit_button"
            >
              {submitReview.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
