"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, X } from "lucide-react";
import { useCompare } from "@/hooks/use-compare";
import { useProducts } from "@/hooks/use-products";
import { formatMoney } from "@/lib/format";

export default function ComparePage() {
  const { ids, toggle } = useCompare();
  const { data, isLoading } = useProducts({ ids: ids.join(","), perPage: ids.length || 1 });
  const products = ids.length > 0 ? data?.data ?? [] : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Compare products</h1>

      {ids.length === 0 ? (
        <p className="mt-8 text-muted-foreground">
          No products to compare yet. Use the compare icon on a product card to add one.
        </p>
      ) : isLoading ? null : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="relative rounded-md border border-border p-4">
              <button
                aria-label="Remove from compare"
                onClick={() => toggle(product.id)}
                className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
              >
                <X className="size-4" />
              </button>
              <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                {product.image && <Image src={product.image} alt={product.name} fill className="object-cover" />}
              </div>
              <Link href={`/products/${product.slug}`} className="mt-3 block text-sm font-medium hover:text-primary">
                {product.name}
              </Link>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="size-3.5 fill-warning text-warning" />
                {product.avgRating.toFixed(1)} ({product.reviewCount})
              </div>
              <p className="mt-2 font-semibold text-primary">{formatMoney(product.price, product.currency)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
