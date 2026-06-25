"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const PER_PAGE = 10;

export function NewArrivalsSection() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useProducts({ sort: "newest", page, perPage: PER_PAGE });

  const totalPages = data?.meta?.totalPages ?? 1;
  const products = data?.data ?? [];

  return (
    <section className="border-t border-[#ececec] bg-white py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[20px] font-bold text-foreground">New Arrivals</h2>
        <Link href="/products" className="text-[13px] font-semibold text-primary hover:underline">
          View all →
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: PER_PAGE }).map((_, i) => (
            <div key={i} className="border border-[#E5E5E5] bg-white">
              <Skeleton className="aspect-square w-full" />
              <div className="space-y-2 p-3">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-8 w-full mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-[14px] text-[#999]">No products yet.</p>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
            className="flex size-8 items-center justify-center border border-[#ececec] text-foreground transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            // Show first, last, current, and neighbours; ellipsis otherwise
            if (totalPages <= 7 || p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "flex size-8 items-center justify-center text-[13px] font-medium transition-colors",
                    p === page
                      ? "bg-primary text-white"
                      : "border border-[#ececec] text-foreground hover:border-primary hover:text-primary"
                  )}
                >
                  {p}
                </button>
              );
            }
            if (p === 2 && page > 4) return <span key="e1" className="px-1 text-[#bbb]">…</span>;
            if (p === totalPages - 1 && page < totalPages - 3) return <span key="e2" className="px-1 text-[#bbb]">…</span>;
            return null;
          })}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
            className="flex size-8 items-center justify-center border border-[#ececec] text-foreground transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </section>
  );
}
