"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2, ShoppingCart, ChevronRight } from "lucide-react";
import { useWishlist, useToggleWishlist } from "@/hooks/use-wishlist";
import { useAddToCart } from "@/hooks/use-cart";
import { formatMoney } from "@/lib/format";
import { CONTAINER } from "@/lib/layout";

export default function WishlistPage() {
  const { data, isLoading } = useWishlist();
  const toggleWishlist = useToggleWishlist();
  const addToCart = useAddToCart();

  return (
    <div className="bg-[#f7f7f7] min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-[#ececec] bg-white">
        <div className={`${CONTAINER} flex items-center gap-1.5 py-3 text-[12px] text-[#999]`}>
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="size-3" />
          <span className="text-[#333]">Wishlist</span>
        </div>
      </div>

      <div className={`${CONTAINER} py-8`}>
        <h1 className="farmart-section-title">My Wishlist</h1>

        {isLoading ? (
          <div className="text-[13px] text-[#999]">Loading…</div>
        ) : !data || data.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded bg-white py-20 text-center border border-[#ececec]">
            <Heart className="size-16 text-[#ddd]" strokeWidth={1} />
            <p className="text-[15px] text-[#333]">Your wishlist is empty</p>
            <p className="text-[13px] text-[#999]">Save items you love to find them here later.</p>
            <Link href="/products" className="bg-primary px-8 py-3 text-[13px] font-bold text-white hover:bg-primary/90 transition-colors">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded bg-white border border-[#ececec]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#ececec] bg-[#f9f9f9]">
                  <th className="py-3 pl-5 text-left text-[11px] font-bold uppercase tracking-wide text-[#999]" colSpan={2}>Product</th>
                  <th className="py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#999]">Price</th>
                  <th className="py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#999]">Status</th>
                  <th className="py-3 pr-5 text-right text-[11px] font-bold uppercase tracking-wide text-[#999]">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((entry) => (
                  <tr key={entry.id} className="border-b border-[#ececec] last:border-b-0 hover:bg-[#fafafa] transition-colors">
                    <td className="py-4 pl-5 pr-3 w-[80px]">
                      <Link href={`/products/${entry.product.slug}`}>
                        <div className="relative size-16 overflow-hidden border border-[#ececec] bg-[#f5f5f5]">
                          {entry.product.image && (
                            <Image
                              src={entry.product.image}
                              alt={entry.product.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="py-4 pr-3">
                      <Link
                        href={`/products/${entry.product.slug}`}
                        className="text-[13px] font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
                      >
                        {entry.product.name}
                      </Link>
                    </td>
                    <td className="py-4 pr-3">
                      <span className="text-[13px] font-semibold text-primary">
                        {formatMoney(entry.product.price, entry.product.currency)}
                      </span>
                    </td>
                    <td className="py-4 pr-3">
                      <span className="inline-flex items-center rounded border border-[#82d45e] bg-[#ebfae9] px-2 py-0.5 text-[11px] font-bold text-[#3a7d13]">
                        In Stock
                      </span>
                    </td>
                    <td className="py-4 pr-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => addToCart.mutate({ productId: entry.product.id })}
                          disabled={addToCart.isPending}
                          className="flex items-center gap-1.5 bg-primary px-3 py-1.5 text-[11px] font-bold text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
                        >
                          <ShoppingCart className="size-3.5" />
                          Add to Cart
                        </button>
                        <button
                          aria-label="Remove from wishlist"
                          onClick={() => toggleWishlist.mutate(entry.product.id)}
                          className="flex size-7 items-center justify-center border border-[#ececec] text-[#ccc] hover:text-primary hover:border-primary transition-colors"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
