import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageSquare } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import ReviewModal from "./ReviewModal";

export default function FloatingReviewButton() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              type="button"
              aria-label="Leave a review"
              data-ocid="review.open_modal_button"
              onClick={() => setModalOpen(true)}
              className="fixed bottom-24 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 focus-visible:ring-offset-2 bg-primary"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 18,
                delay: 0.7,
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageSquare className="h-6 w-6 text-white" />
              {/* Pulse ring */}
              <motion.span
                className="absolute inset-0 rounded-full bg-primary"
                animate={{ scale: [1, 1.4], opacity: [0.35, 0] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 2.2,
                  ease: "easeOut",
                  delay: 1,
                }}
              />
            </motion.button>
          </TooltipTrigger>
          <TooltipContent
            side="left"
            className="font-medium text-xs bg-gray-900 text-white border-0 px-3 py-1.5"
          >
            Leave a Review
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <ReviewModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
