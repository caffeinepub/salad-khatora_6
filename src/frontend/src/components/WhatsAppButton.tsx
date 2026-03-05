import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "motion/react";
import { SiWhatsapp } from "react-icons/si";

const WHATSAPP_NUMBER = "917660005766";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export default function WhatsAppButton() {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
            data-ocid="whatsapp.button"
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2"
            style={{ backgroundColor: "#25D366" }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 18,
              delay: 0.5,
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <SiWhatsapp className="h-7 w-7 text-white" />
            {/* Pulse ring */}
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: "#25D366" }}
              animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 2,
                ease: "easeOut",
              }}
            />
          </motion.a>
        </TooltipTrigger>
        <TooltipContent
          side="left"
          className="font-medium text-xs bg-gray-900 text-white border-0 px-3 py-1.5"
        >
          Chat with us on WhatsApp
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
