"use client";

import Image from "next/image";
import Link from "next/link";
import { X, ShoppingCart, Trash2 } from "lucide-react";
import { useCart, useRemoveCartItem } from "@/hooks/use-cart";
import { formatMoney } from "@/lib/format";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function MiniCartSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data } = useCart();
  const removeItem = useRemoveCartItem();
  const cart = data?.data;
  const itemCount =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-[380px]"
      >
        {/* Header */}
        <SheetHeader className="flex flex-row items-center justify-between border-b border-[#ececec] px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-[15px] font-bold text-foreground">
            <ShoppingCart className="size-5 text-primary" />
            Shopping Cart
            <span className="ml-1 inline-flex min-w-[22px] items-center justify-center rounded-[3px] bg-primary px-1.5 py-0.5 text-[11px] font-bold text-white">
              {itemCount}
            </span>
          </SheetTitle>
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Close cart"
            className="text-[#bbb] transition-colors hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </SheetHeader>

        {!cart || cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingCart
              className="size-16 text-[#ddd]"
              strokeWidth={1}
            />
            <p className="text-[15px] font-semibold text-foreground">
              Your cart is empty
            </p>
            <p className="text-[13px] text-[#999]">
              Add items to start shopping
            </p>
            <Link
              href="/products"
              onClick={() => onOpenChange(false)}
              className="bg-primary px-6 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-primary/90"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <ul className="flex-1 overflow-y-auto">
              {cart.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 border-b border-[#ececec] px-5 py-4"
                >
                  {/* Image */}
                  <div className="relative size-[70px] shrink-0 overflow-hidden border border-[#ececec] bg-[#f5f5f5]">
                    {item.product.image ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="70px"
                      />
                    ) : (
                      <div className="size-full bg-muted" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.product.slug}`}
                      onClick={() => onOpenChange(false)}
                      className="block text-[13px] font-medium leading-snug text-foreground transition-colors hover:text-primary line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                    <div className="mt-1.5 flex items-center gap-2 text-[12px]">
                      <span className="font-semibold text-primary">
                        {formatMoney(item.unitPrice, cart.currency)}
                      </span>
                      <span className="text-[#bbb]">×</span>
                      <span className="font-semibold text-foreground">
                        {item.quantity}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] font-bold text-foreground">
                      = {formatMoney(item.unitPrice * item.quantity, cart.currency)}
                    </p>
                  </div>

                  {/* Remove */}
                  <button
                    aria-label="Remove item"
                    onClick={() => removeItem.mutate(item.id)}
                    className="shrink-0 p-1 text-[#ccc] transition-colors hover:text-primary"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="border-t border-[#ececec] px-5 py-4">
              {/* Subtotal */}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[14px] font-semibold text-foreground">
                  Subtotal:
                </span>
                <span className="text-[18px] font-extrabold text-primary">
                  {formatMoney(cart.subtotal, cart.currency)}
                </span>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-2">
                <Link
                  href="/cart"
                  onClick={() => onOpenChange(false)}
                  className="flex h-[42px] items-center justify-center border border-[#1a1a1a] text-[13px] font-bold text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => onOpenChange(false)}
                  className="flex h-[42px] items-center justify-center bg-primary text-[13px] font-bold text-white transition-colors hover:bg-primary/90"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
