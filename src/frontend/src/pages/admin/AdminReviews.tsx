import { ReviewStatus } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdminAllReviews,
  useAdminDeleteReview,
  useAdminUpdateReview,
} from "@/hooks/useReviewQueries";
import {
  Check,
  Loader2,
  MessageSquare,
  Pencil,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

type TabFilter = "pending" | "approved" | "rejected" | "all";

function StarRating({ rating }: { rating: bigint }) {
  const n = Number(rating);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${
            s <= n
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted-foreground/20"
          }`}
        />
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  const map: Record<ReviewStatus, { label: string; className: string }> = {
    [ReviewStatus.pending]: {
      label: "Pending",
      className: "bg-amber-50 border-amber-200 text-amber-700",
    },
    [ReviewStatus.approved]: {
      label: "Approved",
      className: "bg-emerald-50 border-emerald-200 text-emerald-700",
    },
    [ReviewStatus.rejected]: {
      label: "Rejected",
      className: "bg-red-50 border-red-200 text-red-700",
    },
  };
  const { label, className } = map[status] ?? map[ReviewStatus.pending];
  return (
    <Badge className={`border text-xs font-semibold ${className}`}>
      {label}
    </Badge>
  );
}

function formatDate(ts: bigint) {
  return new Date(Number(ts / 1_000_000n)).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminReviews() {
  const { data: reviews, isLoading } = useAdminAllReviews();
  const updateReview = useAdminUpdateReview();
  const deleteReview = useAdminDeleteReview();

  const [tab, setTab] = useState<TabFilter>("pending");
  const [deleteConfirm, setDeleteConfirm] = useState<bigint | null>(null);
  const [editModal, setEditModal] = useState<{
    open: boolean;
    id: bigint | null;
    status: ReviewStatus;
    profession: string;
  }>({ open: false, id: null, status: ReviewStatus.pending, profession: "" });

  const filteredReviews = (reviews ?? []).filter((r) => {
    if (tab === "all") return true;
    return r.status === tab;
  });

  const pendingCount = (reviews ?? []).filter(
    (r) => r.status === ReviewStatus.pending,
  ).length;

  function handleApprove(id: bigint, profession?: string) {
    updateReview.mutate(
      { id, status: ReviewStatus.approved, profession: profession ?? null },
      {
        onSuccess: () => toast.success("Review approved"),
        onError: () => toast.error("Failed to approve review"),
      },
    );
  }

  function handleReject(id: bigint, profession?: string) {
    updateReview.mutate(
      { id, status: ReviewStatus.rejected, profession: profession ?? null },
      {
        onSuccess: () => toast.success("Review rejected"),
        onError: () => toast.error("Failed to reject review"),
      },
    );
  }

  function handleDelete(id: bigint) {
    deleteReview.mutate(id, {
      onSuccess: () => {
        toast.success("Review deleted");
        setDeleteConfirm(null);
      },
      onError: () => toast.error("Failed to delete review"),
    });
  }

  function openEditProfession(
    id: bigint,
    currentStatus: ReviewStatus,
    currentProfession?: string,
  ) {
    setEditModal({
      open: true,
      id,
      status: currentStatus,
      profession: currentProfession ?? "",
    });
  }

  function handleSaveEdit() {
    if (!editModal.id) return;
    updateReview.mutate(
      {
        id: editModal.id,
        status: editModal.status,
        profession: editModal.profession.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success("Profession updated");
          setEditModal({
            open: false,
            id: null,
            status: ReviewStatus.pending,
            profession: "",
          });
        },
        onError: () => toast.error("Failed to update profession"),
      },
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">
            Reviews
          </h1>
          <p className="text-muted-foreground text-sm">
            {pendingCount > 0
              ? `${pendingCount} review${pendingCount !== 1 ? "s" : ""} awaiting approval`
              : "Manage customer reviews and testimonials"}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary/5 text-primary rounded-lg px-3 py-2 text-xs font-medium">
          <MessageSquare className="h-3.5 w-3.5" />
          {reviews?.length ?? 0} total
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as TabFilter)}
        className="mb-6"
      >
        <TabsList data-ocid="admin.reviews.tab" className="bg-muted/40">
          <TabsTrigger value="pending" data-ocid="admin.reviews.tab">
            Pending
            {pendingCount > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" data-ocid="admin.reviews.tab">
            Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" data-ocid="admin.reviews.tab">
            Rejected
          </TabsTrigger>
          <TabsTrigger value="all" data-ocid="admin.reviews.tab">
            All
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-2" data-ocid="admin.reviews.loading_state">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : filteredReviews.length === 0 ? (
        <div
          className="text-center py-20 text-muted-foreground"
          data-ocid="admin.reviews.empty_state"
        >
          <MessageSquare className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-lg font-medium">No reviews here</p>
          <p className="text-sm mt-1">
            {tab === "pending"
              ? "No reviews awaiting approval"
              : `No ${tab} reviews yet`}
          </p>
        </div>
      ) : (
        <div
          className="bg-white rounded-xl border border-border overflow-hidden"
          data-ocid="admin.reviews.table"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground w-8">
                  #
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Reviewer
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Profession
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Rating
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground max-w-[280px]">
                  Review
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Date
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map((review, i) => (
                <TableRow
                  key={review.id.toString()}
                  className={`hover:bg-muted/20 transition-colors ${
                    review.status === ReviewStatus.pending
                      ? "bg-amber-50/40"
                      : ""
                  }`}
                  data-ocid={`admin.reviews.row.${i + 1}`}
                >
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {i + 1}
                  </TableCell>
                  <TableCell className="font-semibold text-sm text-foreground whitespace-nowrap">
                    {review.reviewerName}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {review.profession ?? (
                      <span className="italic text-muted-foreground/50">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StarRating rating={review.rating} />
                  </TableCell>
                  <TableCell className="max-w-[280px]">
                    <p className="text-sm text-foreground line-clamp-2">
                      {review.reviewText}
                    </p>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(review.createdAt)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={review.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {/* Approve */}
                      {review.status !== ReviewStatus.approved && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 hover:bg-emerald-50 hover:text-emerald-600 text-xs gap-1"
                          onClick={() =>
                            handleApprove(review.id, review.profession)
                          }
                          disabled={updateReview.isPending}
                          data-ocid="admin.reviews.approve_button"
                          title="Approve"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Approve</span>
                        </Button>
                      )}
                      {/* Reject */}
                      {review.status !== ReviewStatus.rejected && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 hover:bg-red-50 hover:text-red-600 text-xs gap-1"
                          onClick={() =>
                            handleReject(review.id, review.profession)
                          }
                          disabled={updateReview.isPending}
                          title="Reject"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Reject</span>
                        </Button>
                      )}
                      {/* Edit Profession */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() =>
                          openEditProfession(
                            review.id,
                            review.status,
                            review.profession,
                          )
                        }
                        title="Edit profession"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        onClick={() => setDeleteConfirm(review.id)}
                        data-ocid="admin.reviews.delete_button"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Profession Modal */}
      <Dialog
        open={editModal.open}
        onOpenChange={(open) => setEditModal((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="max-w-sm" data-ocid="admin.reviews.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              Edit Profession
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="edit-profession" className="text-sm font-medium">
              Profession{" "}
              <span className="text-muted-foreground text-xs font-normal">
                (optional)
              </span>
            </Label>
            <Input
              id="edit-profession"
              className="mt-1.5"
              value={editModal.profession}
              onChange={(e) =>
                setEditModal((prev) => ({
                  ...prev,
                  profession: e.target.value,
                }))
              }
              placeholder="e.g. Fitness Coach"
              data-ocid="admin.reviews.profession.input"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setEditModal({
                  open: false,
                  id: null,
                  status: ReviewStatus.pending,
                  profession: "",
                })
              }
              data-ocid="admin.reviews.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateReview.isPending}
              className="bg-primary hover:bg-primary/90"
              data-ocid="admin.reviews.save_button"
            >
              {updateReview.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent className="max-w-sm" data-ocid="admin.reviews.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              Delete Review?
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm py-2">
            This action cannot be undone. The review will be permanently
            removed.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              data-ocid="admin.reviews.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteConfirm !== null && handleDelete(deleteConfirm)
              }
              disabled={deleteReview.isPending}
              data-ocid="admin.reviews.confirm_button"
            >
              {deleteReview.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
