import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Review, ReviewStatus } from "../backend";
import { useActor } from "./useActor";

// ─── Public: Approved Reviews (no auth required) ──────────────────────────────

export function useApprovedReviews() {
  const { actor, isFetching } = useActor();
  return useQuery<Review[]>({
    queryKey: ["approvedReviews"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getApprovedReviews();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000, // 30-second polling
  });
}

// ─── Admin: All Reviews ───────────────────────────────────────────────────────

export function useAdminAllReviews() {
  const { actor, isFetching } = useActor();
  return useQuery<Review[]>({
    queryKey: ["adminReviews"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllReviews();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Submit Review (open to all callers) ──────────────────────────────────────

export function useSubmitReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      reviewerName,
      profession,
      rating,
      reviewText,
    }: {
      reviewerName: string;
      profession: string | null;
      rating: bigint;
      reviewText: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitReview(reviewerName, profession, rating, reviewText);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["approvedReviews"] });
    },
  });
}

// ─── Admin: Update Review ─────────────────────────────────────────────────────

export function useAdminUpdateReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      profession,
    }: {
      id: bigint;
      status: ReviewStatus;
      profession: string | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.adminUpdateReview(id, status, profession);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminReviews"] });
      void queryClient.invalidateQueries({ queryKey: ["approvedReviews"] });
    },
  });
}

// ─── Admin: Delete Review ─────────────────────────────────────────────────────

export function useAdminDeleteReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.adminDeleteReview(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminReviews"] });
      void queryClient.invalidateQueries({ queryKey: ["approvedReviews"] });
    },
  });
}
