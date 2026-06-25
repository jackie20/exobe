"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, ChevronRight, ShoppingCart, ArrowRight } from "lucide-react";
import { useCart, useRemoveCartItem, useUpdateCartItem } from "@/hooks/use-cart";
import { formatMoney } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { CONTAINER } from "@/lib/layout";

export default function CartPage() {
  const { data, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  const cart = data?.data;

  return (
    <div className="bg-[#f7f7f7] min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-[#ececec] bg-white">
        <div className={`${CONTAINER} flex items-center gap-1.5 py-3 text-[12px] text-[#999]`}>
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="size-3" />
          <span className="text-[#333]">Shopping Cart</span>
        </div>
      </div>

      <div className={`${CONTAINER} py-8`}>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-5 rounded bg-white py-20 text-center">
            <ShoppingCart className="size-20 text-[#ddd]" strokeWidth={1} />
            <p className="text-[18px] font-semibold text-[#333]">Your cart is empty</p>
            <p className="text-[13px] text-[#999]">Looks like you haven't added anything to your cart yet.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-primary px-8 py-3 text-[13px] font-bold text-white hover:bg-primary/90 transition-colors"
            >
              Continue Shopping
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Cart table */}
            <div className="rounded bg-white">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#ececec]">
                      <th className="py-4 pl-5 pr-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#999]" colSpan={2}>
                        Product
                      </th>
                      <th className="hidden py-4 pr-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#999] md:table-cell">
                        Price
                      </th>
                      <th className="py-4 pr-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#999]">
                        Quantity
                      </th>
                      <th className="py-4 pr-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#999]">
                        Total
                      </th>
                      <th className="py-4 pr-5" />
                    </tr>
                  </thead>
                  <tbody>
                    {cart.items.map((item) => (
                      <tr key={item.id} className="border-b border-[#ececec] hover:bg-[#fafafa] transition-colors">
                        {/* Image */}
                        <td className="py-4 pl-5 pr-3 w-[90px]">
                          <Link href={`/products/${item.product.slug}`}>
                            <div className="relative size-[74px] overflow-hidden border border-[#ececec] bg-[#f5f5f5]">
                              {item.product.image ? (
                                <Image
                                  src={item.product.image}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover"
                                  sizes="74px"
                                />
                              ) : (
                                <div className="size-full bg-[#f5f5f5]" />
                              )}
                            </div>
                          </Link>
                        </td>

                        {/* Name */}
                        <td className="py-4 pr-3">
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="text-[13px] font-medium text-[#333] hover:text-primary transition-colors line-clamp-2"
                          >
                            {item.product.name}
                          </Link>
                          {item.variant && (
                            <p className="mt-1 text-[11px] text-[#999]">
                              {item.variant.attributes.map((a) => `${a.name}: ${a.value}`).join(", ")}
                            </p>
                          )}
                          <p className="mt-1 text-[12px] font-semibold text-primary md:hidden">
                            {formatMoney(item.unitPrice, cart.currency)}
                          </p>
                        </td>

                        {/* Unit price */}
                        <td className="hidden py-4 pr-3 md:table-cell">
                          <span className="text-[13px] text-[#555]">
                            {formatMoney(item.unitPrice, cart.currency)}
                          </span>
                        </td>

                        {/* Qty */}
                        <td className="py-4 pr-3">
                          <div className="flex items-center border border-[#ececec] w-fit">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() => {
                                if (item.quantity > 1) {
                                  updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1 });
                                }
                              }}
                              className="flex size-8 items-center justify-center text-[#999] hover:text-foreground hover:bg-[#f5f5f5] transition-colors"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={99}
                              defaultValue={item.quantity}
                              className="h-8 w-10 border-x border-[#ececec] bg-white text-center text-[13px] font-medium text-[#333] focus:outline-none"
                              onBlur={(e) => updateItem.mutate({ itemId: item.id, quantity: Number(e.target.value) })}
                            />
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                              className="flex size-8 items-center justify-center text-[#999] hover:text-foreground hover:bg-[#f5f5f5] transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Line total */}
                        <td className="py-4 pr-3">
                          <span className="text-[13px] font-semibold text-[#333]">
                            {formatMoney(item.lineTotal, cart.currency)}
                          </span>
                        </td>

                        {/* Remove */}
                        <td className="py-4 pr-5">
                          <button
                            aria-label="Remove item"
                            onClick={() => removeItem.mutate(item.id)}
                            className="flex size-6 items-center justify-center text-[#ccc] hover:text-primary transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Continue shopping */}
              <div className="flex items-center justify-between border-t border-[#ececec] px-5 py-4">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1.5 border border-[#1a1a1a] px-5 py-2.5 text-[12px] font-bold text-[#333] hover:border-primary hover:text-primary transition-colors"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order summary */}
            <div className="h-fit rounded bg-white">
              <div className="border-b border-[#ececec] px-5 py-4">
                <h2 className="text-[15px] font-bold text-[#333]">Cart Totals</h2>
              </div>
              <div className="px-5 py-4">
                <div className="flex justify-between py-2 text-[13px]">
                  <span className="text-[#999]">Subtotal</span>
                  <span className="font-semibold text-[#333]">{formatMoney(cart.subtotal, cart.currency)}</span>
                </div>
                <div className="flex justify-between border-t border-[#ececec] py-3 text-[13px]">
                  <span className="text-[#999]">Shipping</span>
                  <span className="text-[#555]">Calculated at checkout</span>
                </div>
                <div className="flex justify-between border-t-2 border-[#1a1a1a] pt-3 text-[15px] font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatMoney(cart.subtotal, cart.currency)}</span>
                </div>
                <Link
                  href="/checkout"
                  className="mt-5 flex w-full items-center justify-center gap-2 bg-primary py-3.5 text-[13px] font-bold text-white hover:bg-primary/90 transition-colors"
                >
                  Proceed to Checkout
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
