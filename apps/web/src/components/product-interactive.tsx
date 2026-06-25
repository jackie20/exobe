"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useAddToCart } from "@/hooks/use-cart";
import { apiFetch, ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";

/* ------------------------------------------------------------------ */
/* Product Image Gallery — vertical thumbnails + main image            */
/* ------------------------------------------------------------------ */

export function ProductGallery({ images, productName }: { images: string[]; productName: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="relative aspect-square w-full bg-[#f5f5f5] flex items-center justify-center">
        <span className="text-[#ccc] text-4xl">📦</span>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex w-[70px] shrink-0 flex-col gap-2">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-square w-full overflow-hidden border transition-colors",
                i === active ? "border-primary" : "border-[#ececec] hover:border-[#c9c9c9]"
              )}
            >
              <Image src={src} alt={`${productName} thumbnail ${i + 1}`} fill className="object-cover" sizes="70px" />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="relative flex-1 aspect-square overflow-hidden bg-[#f5f5f5] border border-[#ececec]">
        <Image
          src={images[active]!}
          alt={productName}
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 100vw, 500px"
          priority
        />
      </div>
    </div>
  );
}

type VariantAttribute = { name: string; value: string; colorHex: string | null };
type Variant = {
  id: string;
  sku: string;
  price?: number;
  stockQuantity: number;
  imageUrl: string | null;
  attributes: VariantAttribute[];
};

// Groups variants by attribute name so we can render option pickers per attribute.
function groupAttributes(variants: Variant[]) {
  const groups: Record<string, Set<string>> = {};
  for (const variant of variants) {
    for (const attr of variant.attributes) {
      if (!groups[attr.name]) groups[attr.name] = new Set();
      groups[attr.name].add(attr.value);
    }
  }
  return groups;
}

function findMatchingVariant(variants: Variant[], selected: Record<string, string>): Variant | null {
  return (
    variants.find((v) =>
      v.attributes.every((attr) => selected[attr.name] === attr.value)
    ) ?? null
  );
}

export function ProductAddSection({
  productId,
  currency,
  basePrice,
  variants,
  inStock,
}: {
  productId: string;
  currency: string;
  basePrice: number;
  variants: Variant[];
  inStock: boolean;
}) {
  const addToCart = useAddToCart();
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<Record<string, string>>({});

  const hasVariants = variants.length > 0;
  const attrGroups = hasVariants ? groupAttributes(variants) : {};
  const matchedVariant = hasVariants ? findMatchingVariant(variants, selected) : null;
  const allSelected = hasVariants
    ? Object.keys(attrGroups).every((attr) => selected[attr] !== undefined)
    : true;

  const effectiveInStock = hasVariants
    ? matchedVariant ? matchedVariant.stockQuantity > 0 : true
    : inStock;

  const displayPrice = matchedVariant?.price ?? basePrice;

  return (
    <div className="space-y-5">
      {hasVariants && (
        <div className="space-y-4">
          {Object.entries(attrGroups).map(([attrName, values]) => (
            <div key={attrName}>
              <p className="text-sm font-medium">
                {attrName}
                {selected[attrName] ? <span className="ml-2 font-normal text-muted-foreground">— {selected[attrName]}</span> : null}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {Array.from(values).map((val) => {
                  const matchingVariant = variants.find((v) =>
                    v.attributes.some((a) => a.name === attrName && a.value === val)
                  );
                  const colorHex = matchingVariant?.attributes.find(
                    (a) => a.name === attrName && a.value === val
                  )?.colorHex;

                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSelected((prev) => ({ ...prev, [attrName]: val }))}
                      className={cn(
                        "rounded-md border px-3 py-1.5 text-sm transition-colors",
                        selected[attrName] === val
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary"
                      )}
                    >
                      {colorHex && (
                        <span
                          className="mr-1.5 inline-block size-3 rounded-full border border-border align-middle"
                          style={{ backgroundColor: colorHex }}
                        />
                      )}
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {allSelected && matchedVariant && (
            <p className="text-sm text-muted-foreground">
              Price: <span className="font-semibold text-foreground">{formatMoney(displayPrice, currency)}</span>
              {" · "}
              {matchedVariant.stockQuantity > 0
                ? `${matchedVariant.stockQuantity} in stock`
                : "Out of stock"}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          type="number"
          min={1}
          max={99}
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
          className="h-10 w-16 rounded-md border border-input bg-background px-2 text-sm"
        />
        <Button
          size="lg"
          disabled={
            !effectiveInStock ||
            addToCart.isPending ||
            (hasVariants && !allSelected)
          }
          onClick={() =>
            addToCart.mutate({
              productId,
              quantity,
              ...(matchedVariant ? { variantId: matchedVariant.id } : {}),
            })
          }
        >
          {addToCart.isPending
            ? "Adding…"
            : hasVariants && !allSelected
              ? "Select options"
              : !effectiveInStock
                ? "Out of stock"
                : "Add to cart"}
        </Button>
        {addToCart.isSuccess && <span className="text-sm text-success">Added!</span>}
      </div>
    </div>
  );
}

export function ReviewForm({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session?.user) {
    return (
      <p className="text-sm text-muted-foreground">
        <a href="/login" className="underline hover:text-primary">Sign in</a> to leave a review.
      </p>
    );
  }

  if (done) {
    return (
      <p className="text-sm text-success">
        Review submitted! It will appear after moderation.
      </p>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (rating === 0) { setError("Please select a rating."); return; }
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    try {
      await apiFetch("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          productId,
          rating,
          title: String(formData.get("title") || ""),
          comment: String(formData.get("comment") || ""),
        }),
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-lg border border-border p-5">
      <p className="font-medium">Write a review</p>

      <div>
        <Label>Rating</Label>
        <div className="mt-1.5 flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={cn(
                "text-2xl leading-none transition-colors",
                star <= rating ? "text-warning" : "text-muted-foreground"
              )}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Title (optional)</Label>
        <Input name="title" maxLength={120} placeholder="Summarise your experience" />
      </div>

      <div className="space-y-1.5">
        <Label>Review</Label>
        <textarea
          name="comment"
          rows={4}
          maxLength={2000}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Share details about your experience…"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
