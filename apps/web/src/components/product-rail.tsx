import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import type { ProductSummary } from "@/lib/api/types";

export function ProductRail({
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
      <div className="mb-5 flex items-center justify-between border-b border-[#ececec] pb-4">
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
      <div className="overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
        <div className="flex gap-3" style={{ minWidth: "max-content" }}>
          {products.map((product) => (
            <div key={product.id} className="w-[210px] shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
