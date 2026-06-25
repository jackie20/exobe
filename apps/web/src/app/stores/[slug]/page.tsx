import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Mail, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { effectivePrice } from "@/lib/pricing";
import { ProductCard } from "@/components/product-card";
import { CONTAINER } from "@/lib/layout";
import type { ProductSummary } from "@/lib/api/types";

export const dynamic = "force-dynamic";

async function getStore(slug: string) {
  return prisma.store.findUnique({
    where: { slug, status: "APPROVED" },
    include: {
      products: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        take: 48,
        include: {
          brand: { select: { name: true, slug: true } },
          images: { take: 1, orderBy: { position: "asc" } },
        },
      },
    },
  });
}

export default async function StoreProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await getStore(slug);
  if (!store) notFound();

  const products: ProductSummary[] = store.products.map((product) => {
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
    <div>
      {/* Banner */}
      <div className="relative h-48 w-full bg-secondary sm:h-64">
        {store.bannerUrl && (
          <Image src={store.bannerUrl} alt={`${store.name} banner`} fill className="object-cover" priority />
        )}
      </div>

      <div className={`${CONTAINER} py-8`}>
        {/* Store header */}
        <div className="-mt-12 flex flex-wrap items-end gap-5">
          <div className="relative size-24 shrink-0 overflow-hidden rounded-lg border-4 border-card bg-card shadow-sm">
            {store.logoUrl ? (
              <Image src={store.logoUrl} alt={store.name} fill className="object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center text-3xl font-bold text-primary">
                {store.name[0]}
              </span>
            )}
          </div>
          <div className="pb-1">
            <h1 className="text-2xl font-bold">{store.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {store.country}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="size-3.5" />
                {store.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="size-3.5" />
                {store.phone}
              </span>
            </div>
          </div>
        </div>

        {store.description && (
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">{store.description}</p>
        )}

        {/* Policies */}
        {(store.shippingPolicy || store.returnPolicy) && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {store.shippingPolicy && (
              <div className="rounded-lg border border-border p-5">
                <p className="text-sm font-semibold">Shipping policy</p>
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">{store.shippingPolicy}</p>
              </div>
            )}
            {store.returnPolicy && (
              <div className="rounded-lg border border-border p-5">
                <p className="text-sm font-semibold">Return policy</p>
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">{store.returnPolicy}</p>
              </div>
            )}
          </div>
        )}

        {/* Products */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold">
            Products ({products.length})
          </h2>
          {products.length === 0 ? (
            <p className="mt-4 text-muted-foreground">No products listed yet.</p>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
