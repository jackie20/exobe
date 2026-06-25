import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import type { ProductSummary } from "@/lib/api/types";

export function ProductGrid({
  title,
  viewAllHref,
  products,
}: {
  title: string;
  viewAllHref?: string;
  products: ProductSummary[];
}) {
  if (products.length === 0) return null;

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[20px] font-bold text-foreground">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-[13px] font-semibold text-primary hover:underline"
          >
            View all →
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
