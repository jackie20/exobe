import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { effectivePrice } from "@/lib/pricing";
import { ProductCard } from "@/components/product-card";
import { CONTAINER } from "@/lib/layout";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      children: { select: { id: true, name: true, slug: true } },
      parent: { select: { name: true, slug: true } },
    },
  });
  if (!category) notFound();

  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED", categories: { some: { slug } } },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    include: { brand: { select: { name: true, slug: true } }, images: { take: 1, orderBy: { position: "asc" } } },
  });

  const productList = products.map((product) => {
    const { price, isOnSale } = effectivePrice(product);
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      currency: product.currency,
      price,
      isOnSale,
      basePrice: Number(product.basePrice),
      avgRating: Number(product.avgRating),
      reviewCount: product.reviewCount,
      isFeatured: product.isFeatured,
      inStock: product.stockQuantity > 0 || product.allowBackorder,
      brand: product.brand,
      image: product.images[0]?.url ?? null,
    };
  });

  return (
    <div className="bg-[#f7f7f7] min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-[#ececec] bg-white">
        <div className={`${CONTAINER} flex items-center gap-1.5 py-3 text-[12px] text-[#999]`}>
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="size-3" />
          {category.parent && (
            <>
              <Link href={`/categories/${category.parent.slug}`} className="hover:text-primary">
                {category.parent.name}
              </Link>
              <ChevronRight className="size-3" />
            </>
          )}
          <span className="text-[#333]">{category.name}</span>
        </div>
      </div>

      <div className={`${CONTAINER} py-6`}>
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden w-[220px] shrink-0 lg:block">
            {category.children.length > 0 && (
              <div className="rounded bg-white border border-[#ececec]">
                <div className="border-b border-[#ececec] px-4 py-3">
                  <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#333]">Sub-categories</h3>
                </div>
                <ul className="divide-y divide-[#f5f5f5]">
                  {category.children.map((child) => (
                    <li key={child.id}>
                      <Link
                        href={`/categories/${child.slug}`}
                        className="flex items-center justify-between px-4 py-2.5 text-[13px] text-[#555] hover:text-primary hover:bg-[#f9f9f9] transition-colors"
                      >
                        {child.name}
                        <ChevronRight className="size-3.5 text-[#ccc]" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Category header */}
            <div className="mb-4 flex items-center justify-between rounded bg-white border border-[#ececec] px-4 py-3">
              <h1 className="text-[16px] font-bold text-[#333]">
                {category.name}
                <span className="ml-2 text-[13px] font-normal text-[#999]">({products.length} products)</span>
              </h1>
            </div>

            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded bg-white py-16 text-center">
                <p className="text-[15px] text-[#999]">No products in this category yet.</p>
                <Link href="/products" className="text-[13px] text-primary hover:underline">
                  Browse all products →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {productList.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
