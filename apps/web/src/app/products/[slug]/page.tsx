import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Truck, ShieldCheck, RotateCcw, Store, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { effectivePrice } from "@/lib/pricing";
import { formatMoney } from "@/lib/format";
import { ProductAddSection, ReviewForm, ProductGallery } from "@/components/product-interactive";
import { ProductRail } from "@/components/product-rail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CONTAINER } from "@/lib/layout";
import type { ProductSummary } from "@/lib/api/types";

export const revalidate = 60;

async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      brand: true,
      store: { select: { name: true, slug: true } },
      categories: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { position: "asc" } },
      variants: {
        include: { attributes: { include: { attributeValue: { include: { attribute: true } } } } },
      },
      reviews: {
        where: { isApproved: true },
        include: { customer: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

async function getRelatedProducts(categoryId: string | undefined, excludeId: string) {
  if (!categoryId) return [];
  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED", categories: { some: { id: categoryId } }, id: { not: excludeId } },
    take: 10,
    include: { brand: { select: { name: true, slug: true } }, images: { take: 1, orderBy: { position: "asc" } } },
  });

  return products.map((product): ProductSummary => {
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
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className={`size-3.5 ${i < Math.round(rating) ? "text-[#f5a623]" : "text-[#ddd]"}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      {count > 0 && (
        <a href="#product-reviews-tab" className="text-[12px] text-foreground hover:text-primary">
          ({count} reviews)
        </a>
      )}
    </div>
  );
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product.categories[0]?.id, product.id);

  const { price, isOnSale } = effectivePrice(product);
  const inStock = product.stockQuantity > 0 || product.allowBackorder;
  const discount = isOnSale
    ? Math.round((1 - price / Number(product.basePrice)) * 100)
    : 0;

  const variants = product.variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    price: v.priceOverride ? Number(v.priceOverride) : undefined,
    stockQuantity: v.stockQuantity,
    imageUrl: v.imageUrl,
    attributes: v.attributes.map((a) => ({
      name: a.attributeValue.attribute.name,
      value: a.attributeValue.value,
      colorHex: a.attributeValue.colorHex,
    })),
  }));

  const galleryImages = product.images.map((img) => img.url);

  return (
    <div className="bg-[#f7f7f7]">
      {/* Breadcrumb */}
      <div className="border-b border-[#ececec] bg-white">
        <div className={`${CONTAINER} flex items-center gap-1.5 py-3 text-[12px] text-[#999]`}>
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="size-3" />
          {product.categories[0] && (
            <>
              <Link href={`/categories/${product.categories[0].slug}`} className="hover:text-primary">
                {product.categories[0].name}
              </Link>
              <ChevronRight className="size-3" />
            </>
          )}
          <span className="text-[#333] line-clamp-1">{product.name}</span>
        </div>
      </div>

      {/* Main product area */}
      <div className={`${CONTAINER} py-6`}>
        <div className="rounded bg-white px-4 py-6 lg:px-8 lg:py-8">
          <div className="grid gap-8 lg:grid-cols-[5fr_5fr_3fr]">

            {/* Image gallery */}
            <ProductGallery images={galleryImages} productName={product.name} />

            {/* Product info */}
            <div className="border-l border-[#d2d2d2] pl-6">
              {/* Brand + title */}
              {product.brand && (
                <p className="mb-1 text-[12px] text-[#999]">
                  Brand: <span className="font-medium text-foreground">{product.brand.name}</span>
                </p>
              )}
              <h1 className="text-[22px] font-normal leading-snug text-[#333]">{product.name}</h1>

              {/* Meta: rating + SKU */}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-[#e1e1e1] pb-3">
                <StarRating rating={Number(product.avgRating)} count={product.reviewCount} />
                {product.sku && (
                  <span className="text-[12px] text-[#999]">
                    SKU: <span className="text-[#555]">{product.sku}</span>
                  </span>
                )}
              </div>

              {/* Sold by vendor */}
              {product.store && (
                <div className="mt-3 text-[13px]">
                  <span className="text-[#999]">Sold by: </span>
                  <Link
                    href={`/stores/${product.store.slug}`}
                    className="flex items-center gap-1 font-bold uppercase tracking-wide text-foreground hover:text-primary"
                  >
                    <Store className="size-3.5" />
                    {product.store.name}
                  </Link>
                </div>
              )}

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-[28px] font-bold text-primary">
                  {formatMoney(price, product.currency)}
                </span>
                {isOnSale && (
                  <>
                    <span className="text-[16px] text-[#999] line-through">
                      {formatMoney(Number(product.basePrice), product.currency)}
                    </span>
                    <span className="rounded bg-primary px-1.5 py-0.5 text-[11px] font-bold text-white">
                      -{discount}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock badge */}
              <div className="mt-3">
                {inStock ? (
                  <span className="inline-flex items-center rounded border border-[#82d45e] bg-[#ebfae9] px-3 py-1.5 text-[12px] font-bold text-[#3a7d13]">
                    In stock
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded border border-[#f79090] bg-[#ffe9e1] px-3 py-1.5 text-[12px] font-bold text-destructive">
                    Out of stock
                  </span>
                )}
              </div>

              {/* Short description */}
              {product.shortDescription && (
                <p className="mt-3 text-[13px] leading-relaxed text-[#666]">
                  {product.shortDescription}
                </p>
              )}

              {/* Add to cart section */}
              <div className="mt-5 border-b border-[#d2d2d2] pb-5">
                <ProductAddSection
                  productId={product.id}
                  currency={product.currency}
                  basePrice={Number(product.basePrice)}
                  variants={variants}
                  inStock={inStock}
                />
              </div>

              {/* Meta: categories */}
              <div className="mt-4 space-y-1.5 text-[12px] text-[#999]">
                {product.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <span>Categories:</span>
                    {product.categories.map((cat) => (
                      <Link key={cat.id} href={`/categories/${cat.slug}`} className="text-foreground hover:text-primary">
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
                {product.brand && (
                  <div>
                    <span>Brand: </span>
                    <span className="text-[#555]">{product.brand.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Trust badges sidebar */}
            <aside className="space-y-0 divide-y divide-[#ececec] rounded border border-[#ececec] bg-[#f9f9f9]">
              <div className="flex items-start gap-3 p-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded bg-primary/10">
                  <Truck className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#333]">Fast Delivery</p>
                  <p className="text-[11px] text-[#999]">Dispatched within 24 hours</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded bg-primary/10">
                  <RotateCcw className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#333]">Easy Returns</p>
                  <p className="text-[11px] text-[#999]">14-day return window</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded bg-primary/10">
                  <ShieldCheck className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#333]">Secure Payment</p>
                  <p className="text-[11px] text-[#999]">Stripe-protected checkout</p>
                </div>
              </div>

              {/* Social share placeholder */}
              <div className="p-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#999]">Share:</p>
                <div className="flex gap-2">
                  {["Facebook", "Twitter", "WhatsApp"].map((net) => (
                    <button
                      key={net}
                      aria-label={`Share on ${net}`}
                      className="rounded-[3px] bg-[#1a1a1a] px-2 py-1 text-[10px] font-bold text-white hover:bg-primary transition-colors"
                    >
                      {net[0]}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Tabs: Description, Reviews */}
        <div className="mt-6 rounded bg-white px-4 py-6 lg:px-8" id="product-reviews-tab">
          <Tabs defaultValue="description">
            <TabsList className="border-b border-[#ececec] bg-transparent pb-0">
              <TabsTrigger
                value="description"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-b-2 border-transparent pb-3 text-[14px] font-semibold"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-b-2 border-transparent pb-3 text-[14px] font-semibold"
              >
                Reviews ({product.reviewCount})
              </TabsTrigger>
              <TabsTrigger
                value="info"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-b-2 border-transparent pb-3 text-[14px] font-semibold"
              >
                Additional Info
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="pt-5 text-[13px] leading-relaxed text-[#666]">
              {product.description ?? "No description provided for this product yet."}
            </TabsContent>

            <TabsContent value="reviews" className="pt-5">
              {product.reviews.length === 0 ? (
                <p className="text-[13px] text-[#999]">No reviews yet. Be the first to review this product!</p>
              ) : (
                <div className="mb-6 space-y-4">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border-b border-[#ececec] pb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg key={i} className={`size-3.5 ${i < review.rating ? "text-[#f5a623]" : "text-[#ddd]"}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-[13px] font-semibold text-[#333]">{review.customer.name}</span>
                      </div>
                      {review.title && <p className="mt-1 text-[13px] font-semibold text-[#333]">{review.title}</p>}
                      {review.comment && <p className="mt-1 text-[13px] text-[#666]">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
              <ReviewForm productId={product.id} />
            </TabsContent>

            <TabsContent value="info" className="pt-5">
              <table className="w-full text-[13px]">
                <tbody className="divide-y divide-[#ececec]">
                  {product.brand && (
                    <tr>
                      <td className="py-2 pr-6 font-semibold text-[#555] w-32">Brand</td>
                      <td className="py-2 text-[#666]">{product.brand.name}</td>
                    </tr>
                  )}
                  {product.sku && (
                    <tr>
                      <td className="py-2 pr-6 font-semibold text-[#555]">SKU</td>
                      <td className="py-2 text-[#666]">{product.sku}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-2 pr-6 font-semibold text-[#555]">Availability</td>
                    <td className="py-2 text-[#666]">{inStock ? "In Stock" : "Out of Stock"}</td>
                  </tr>
                  {product.weightKg && (
                    <tr>
                      <td className="py-2 pr-6 font-semibold text-[#555]">Weight</td>
                      <td className="py-2 text-[#666]">{String(product.weightKg)} kg</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-6">
            <ProductRail title="Related Products" products={relatedProducts} />
          </div>
        )}
      </div>
    </div>
  );
}
