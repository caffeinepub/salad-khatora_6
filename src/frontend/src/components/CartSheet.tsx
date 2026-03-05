import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/context/CartContext";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { usePlaceOrder } from "@/hooks/useQueries";
import { Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { items, updateQuantity, removeItem, clearCart, total } = useCart();
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [notes, setNotes] = useState("");
  const placeOrder = usePlaceOrder();

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      login();
      return;
    }
    if (items.length === 0) return;

    const orderItems = items.map((item) => ({
      menuItemId: item.menuItemId,
      quantity: BigInt(item.quantity),
      unitPrice: item.unitPrice,
    }));

    try {
      await placeOrder.mutateAsync({
        items: orderItems,
        totalAmount: total,
        notes: notes.trim() || null,
      });
      clearCart();
      setNotes("");
      onOpenChange(false);
      toast.success("Order placed successfully! 🥗");
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0"
        data-ocid="cart.sheet"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="font-display text-xl flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Your Cart
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {items.length === 0
              ? "Your cart is empty"
              : `${items.length} item${items.length > 1 ? "s" : ""} in your cart`}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-primary/40" />
            </div>
            <p className="text-muted-foreground text-center text-sm">
              Add some fresh salads to get started!
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="py-4 space-y-4">
                <AnimatePresence>
                  {items.map((item, index) => (
                    <motion.div
                      key={item.menuItemId.toString()}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3"
                      data-ocid={`cart.item.${index + 1}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate text-foreground">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PKR {item.unitPrice.toLocaleString()} each
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.menuItemId, item.quantity - 1)
                          }
                          className="h-7 w-7 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.menuItemId, item.quantity + 1)
                          }
                          className="h-7 w-7 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="w-20 text-right">
                        <p className="text-sm font-semibold text-primary">
                          PKR{" "}
                          {(item.unitPrice * item.quantity).toLocaleString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.menuItemId)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>

            <div className="px-6 pb-6 space-y-4 border-t border-border pt-4">
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Subtotal</span>
                <span className="font-display font-bold text-lg text-primary">
                  PKR {total.toLocaleString()}
                </span>
              </div>

              <div>
                <label
                  htmlFor="cart-notes"
                  className="text-xs font-medium text-muted-foreground mb-1 block"
                >
                  Special instructions (optional)
                </label>
                <Textarea
                  id="cart-notes"
                  placeholder="Any special requests or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none text-sm"
                  rows={2}
                  data-ocid="cart.notes_input"
                />
              </div>
            </div>
          </>
        )}

        <SheetFooter className="px-6 pb-6 pt-0 gap-2">
          {items.length > 0 && (
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 gap-2"
              onClick={handlePlaceOrder}
              disabled={placeOrder.isPending || items.length === 0}
              data-ocid="cart.place_order_button"
            >
              {placeOrder.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Placing Order...
                </>
              ) : !isAuthenticated ? (
                "Login to Place Order"
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  Place Order · PKR {total.toLocaleString()}
                </>
              )}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
