"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, Heart, GitCompare, ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { useAddToCart } from "@/hooks/use-cart";
import { useIsWishlisted, useToggleWishlist } from "@/hooks/use-wishlist";
import { useCompare } from "@/hooks/use-compare";
import { QuickViewDialog } from "@/components/quick-view-dialog";
import type { ProductSummary } from "@/lib/api/types";

function Stars({ avg, count }: { avg: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={cn("size-3 shrink-0", i < Math.round(avg) ? "fill-[#f5a623] text-[#f5a623]" : "fill-[#e0e0e0] text-[#e0e0e0]")}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {count > 0 && <span className="ml-0.5 text-[11px] text-[#999]">({count})</span>}
    </div>
  );
}

export function ProductCard({ product }: { product: ProductSummary }) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const addToCart = useAddToCart();
  const isWishlisted = useIsWishlisted(product.id);
  const toggleWishlist = useToggleWishlist();
  const { isComparing, toggle: toggleCompare } = useCompare();
  const comparing = isComparing(product.id);

  const discountPct =
    product.isOnSale && product.basePrice > 0
      ? Math.round(((product.basePrice - product.price) / product.basePrice) * 100)
      : 0;

  function handleAddToCart() {
    if (!product.inStock || addToCart.isPending) return;
    addToCart.mutate(
      { productId: product.id },
      {
        onSuccess: () => {
          setAdded(true);
          setTimeout(() => setAdded(false), 2000);
          toast.success(`${product.name} added to cart!`);
        },
        onError: () => {
          toast.error("Failed to add to cart. Please try again.");
        },
      }
    );
  }

  return (
    <article className="product-card group relative flex flex-col border border-[#E5E5E5] bg-white transition-all duration-200 hover:border-primary hover:shadow-md">
      {/* Image area */}
      <Link href={`/products/${product.slug}`} className="relative block overflow-hidden bg-[#f8f8f8]" style={{ paddingBottom: "100%" }}>
        <div className="absolute inset-0">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-[#ccc] text-[11px]">No image</div>
          )}
        </div>

        {/* Badges */}
        <div className="absolute left-0 top-0 flex flex-col gap-1 p-2">
          {!product.inStock && (
            <span className="bg-[#1a1a1a] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              Out of Stock
            </span>
          )}
          {product.inStock && discountPct > 0 && (
            <span className="bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
              -{discountPct}%
            </span>
          )}
          {product.inStock && product.isFeatured && discountPct === 0 && (
            <span className="bg-[#1a1a1a] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              Featured
            </span>
          )}
        </div>

        {/* Hover action buttons (top-right) */}
        <div className="absolute right-2 top-2 flex flex-col gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            type="button"
            aria-label="Quick view"
            onClick={(e) => { e.preventDefault(); setQuickViewOpen(true); }}
            className="flex size-8 items-center justify-center border border-[#E5E5E5] bg-white text-[#555] shadow-sm transition-colors hover:border-primary hover:bg-primary hover:text-white"
          >
            <Eye className="size-[14px]" />
          </button>
          <button
            type="button"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            onClick={(e) => { e.preventDefault(); toggleWishlist.mutate(product.id); }}
            className={cn(
              "flex size-8 items-center justify-center border bg-white shadow-sm transition-colors hover:border-primary hover:bg-primary hover:text-white",
              isWishlisted ? "border-primary text-primary" : "border-[#E5E5E5] text-[#555]"
            )}
          >
            <Heart className={cn("size-[14px]", isWishlisted && "fill-current")} />
          </button>
          <button
            type="button"
            aria-label="Compare"
            onClick={(e) => { e.preventDefault(); toggleCompare(product.id); }}
            className={cn(
              "flex size-8 items-center justify-center border bg-white shadow-sm transition-colors hover:border-primary hover:bg-primary hover:text-white",
              comparing ? "border-primary text-primary" : "border-[#E5E5E5] text-[#555]"
            )}
          >
            <GitCompare className="size-[14px]" />
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col p-3">
        {/* Brand — always present so cards align across grid rows */}
        <p className="mb-0.5 h-[16px] truncate text-[10px] font-semibold uppercase tracking-wide text-[#999]">
          {product.brand?.name ?? " "}
        </p>
        <Link href={`/products/${product.slug}`}>
          {/* min-h forces 2-line reserve so single-line titles don't push price up */}
          <h3 className="line-clamp-2 min-h-[38px] text-[13px] font-medium leading-snug text-[#1a1a1a] transition-colors hover:text-primary">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5">
          <Stars avg={product.avgRating} count={product.reviewCount} />
        </div>

        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-[15px] font-extrabold text-primary">
            {formatMoney(product.price, product.currency)}
          </span>
          {product.isOnSale && discountPct > 0 && (
            <span className="text-[12px] text-[#bbb] line-through">
              {formatMoney(product.basePrice, product.currency)}
            </span>
          )}
        </div>

        {/* Always-visible Add to Cart button */}
        <button
          type="button"
          disabled={!product.inStock || addToCart.isPending}
          onClick={handleAddToCart}
          className={cn(
            "mt-3 flex w-full items-center justify-center gap-2 py-2 text-[12px] font-semibold transition-colors",
            added
              ? "bg-[#16a34a] text-white"
              : product.inStock
                ? "bg-[#1a1a1a] text-white hover:bg-primary"
                : "cursor-not-allowed bg-[#f0f0f0] text-[#999]"
          )}
        >
          {added ? (
            <>
              <Check className="size-3.5" />
              Added
            </>
          ) : (
            <>
              <ShoppingCart className="size-3.5" />
              {addToCart.isPending ? "Adding…" : product.inStock ? "Add to Cart" : "Out of Stock"}
            </>
          )}
        </button>
      </div>

      <QuickViewDialog slug={product.slug} open={quickViewOpen} onOpenChange={setQuickViewOpen} />
    </article>
  );
}
