import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { effectivePrice } from "@/lib/pricing";
import { HeroSlider } from "@/components/hero-slider";
import { SideBannerSlider } from "@/components/side-banner-slider";
import { ProductCard } from "@/components/product-card";
import { ProductRail } from "@/components/product-rail";
import { NewArrivalsSection } from "@/components/new-arrivals-section";
import { CONTAINER } from "@/lib/layout";
import { getCategoryIcon } from "@/lib/category-icons";
import type { ProductSummary } from "@/lib/api/types";

export const revalidate = 60;

type Numeric = number | string | { toString(): string };

function toSummary(product: {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  currency: string;
  basePrice: Numeric;
  salePrice: Numeric | null;
  saleStartsAt: Date | null;
  saleEndsAt: Date | null;
  avgRating: Numeric;
  reviewCount: number;
  isFeatured: boolean;
  stockQuantity: number;
  allowBackorder: boolean;
  brand: { name: string; slug: string } | null;
  images: { url: string }[];
}): ProductSummary {
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
}

async function getHomeData() {
  const productInclude = {
    brand: { select: { name: true, slug: true } },
    images: { take: 1, orderBy: { position: "asc" as const } },
  };

  const [
    categories,
    brands,
    featuredProducts,
    saleProducts,
    categoriesWithProducts,
  ] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { position: "asc" },
      take: 8,
    }),
    prisma.brand.findMany({ where: { isActive: true }, take: 10 }),
    prisma.product.findMany({
      where: { status: "PUBLISHED", isFeatured: true },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: productInclude,
    }),
    prisma.product.findMany({
      where: { status: "PUBLISHED", salePrice: { not: null } },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: productInclude,
    }),
    prisma.category.findMany({
      where: {
        isActive: true,
        parentId: null,
        products: { some: { status: "PUBLISHED" } },
      },
      orderBy: { position: "asc" },
      take: 2,
      include: {
        products: {
          where: { status: "PUBLISHED" },
          take: 10,
          include: productInclude,
        },
      },
    }),
  ]);

  return {
    categories,
    brands,
    featuredProducts: featuredProducts.map(toSummary),
    saleProducts: saleProducts.map(toSummary),
    categoryRails: categoriesWithProducts.map((category) => ({
      title: category.name,
      slug: category.slug,
      products: category.products.map(toSummary),
    })),
  };
}

const AD_BANNERS = [
  {
    title: "Fresh Groceries",
    subtitle: "Delivered to your door weekly",
    cta: "Shop Groceries",
    href: "/categories",
    image:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80&auto=format&fit=crop",
    badge: "Weekly deals",
  },
  {
    title: "Tech Deals",
    subtitle: "Up to 30% off electronics",
    cta: "View Tech",
    href: "/products",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80&auto=format&fit=crop",
    badge: "Savings",
  },
  {
    title: "Home & Living",
    subtitle: "Refresh your space this season",
    cta: "Shop Home",
    href: "/categories",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&auto=format&fit=crop",
    badge: "New in",
  },
];

const BLOG_TEASERS = [
  {
    title: "5 tips for smarter online shopping",
    excerpt: "Get the most out of every order on Exobe Africa.",
    image:
      "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=500&q=80&auto=format&fit=crop",
    category: "Shopping Tips",
  },
  {
    title: "Supporting local vendors",
    excerpt: "How Exobe Africa connects you to South African sellers.",
    image:
      "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=500&q=80&auto=format&fit=crop",
    category: "Community",
  },
  {
    title: "Packing for delivery, the right way",
    excerpt: "What top vendors do to keep your order safe in transit.",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80&auto=format&fit=crop",
    category: "Vendor Tips",
  },
];


export default async function HomePage() {
  const {
    categories,
    brands,
    featuredProducts,
    saleProducts,
    categoryRails,
  } = await getHomeData();

  return (
    <main>
      {/* ── 1. Hero slider + side banner slider ───────────────────── */}
      <div className={`${CONTAINER} py-4`}>
        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <HeroSlider />
          <div className="hidden lg:block" style={{ height: "400px" }}>
            <SideBannerSlider />
          </div>
        </div>
      </div>

      {/* ── 2. Browse by Category ────────────────────────────────── */}
      <section className={`${CONTAINER} py-8`}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="farmart-section-title text-[20px] font-bold text-foreground">
            Shop by Category
          </h2>
          <Link
            href="/categories"
            className="text-[13px] font-semibold text-primary hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.name);
            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group flex flex-col items-center gap-2 border border-[#ececec] bg-white p-3 text-center transition-all hover:border-primary hover:shadow-sm"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-[#fbe7ea] text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon className="size-6" />
                </span>
                <span className="text-[12px] font-medium leading-tight text-foreground group-hover:text-primary">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── 3. Flash / Top Sale section ──────────────────────────── */}
      {saleProducts.length > 0 && (
        <section className="border-t border-[#ececec] bg-white py-8">
          <div className={CONTAINER}>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-[20px] font-bold text-foreground">
                  Top Savers Today
                </h2>
                <span className="rounded bg-primary px-2 py-0.5 text-[11px] font-bold uppercase text-white">
                  On Sale
                </span>
              </div>
              <Link
                href="/products?sale=true"
                className="text-[13px] font-semibold text-primary hover:underline"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {saleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 4. Featured brands strip ─────────────────────────────── */}
      {brands.length > 0 && (
        <section className="border-t border-[#ececec] bg-[#f7f7f7] py-6">
          <div className={CONTAINER}>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <p className="mr-4 text-[13px] font-semibold text-[#999] uppercase tracking-wide">
                Trusted Brands:
              </p>
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/products?brand=${brand.slug}`}
                  className="border border-[#ececec] bg-white px-4 py-2 text-[12px] font-semibold text-[#555] transition-all hover:border-primary hover:text-primary"
                >
                  {brand.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. Category product rail #1 ──────────────────────────── */}
      {categoryRails[0] && (
        <section className="border-t border-[#ececec] py-8">
          <div className={CONTAINER}>
            <ProductRail
              title={`Just Landed: ${categoryRails[0].title}`}
              viewAllHref={`/categories/${categoryRails[0].slug}`}
              products={categoryRails[0].products}
            />
          </div>
        </section>
      )}

      {/* ── 6. Three-banner ad row ───────────────────────────────── */}
      <section className="border-t border-[#ececec] py-8">
        <div className={CONTAINER}>
          <div className="grid gap-4 sm:grid-cols-3">
            {AD_BANNERS.map((banner) => (
              <Link
                key={banner.title}
                href={banner.href}
                className="group relative flex h-[160px] overflow-hidden"
              >
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    {banner.badge}
                  </p>
                  <p className="text-[16px] font-bold text-white">
                    {banner.title}
                  </p>
                  <p className="text-[12px] text-white/80">{banner.subtitle}</p>
                  <span className="mt-2 inline-block bg-primary px-3 py-1 text-[11px] font-bold text-white transition-colors group-hover:bg-white group-hover:text-primary">
                    {banner.cta} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Featured products ─────────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="border-t border-[#ececec] bg-white py-8">
          <div className={CONTAINER}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-[20px] font-bold text-foreground">
                Featured Products
              </h2>
              <Link
                href="/products?featured=true"
                className="text-[13px] font-semibold text-primary hover:underline"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 8. Category product rail #2 ──────────────────────────── */}
      {categoryRails[1] && (
        <section className="border-t border-[#ececec] py-8">
          <div className={CONTAINER}>
            <ProductRail
              viewAllHref={`/categories/${categoryRails[1].slug}`}
              title={categoryRails[1].title}
              products={categoryRails[1].products}
            />
          </div>
        </section>
      )}

      {/* ── 9. New Arrivals — client component with pagination ──── */}
      <div className={CONTAINER}>
        <NewArrivalsSection />
      </div>

      {/* ── 10. Blog posts + app CTA ─────────────────────────────── */}
      <section className="border-t border-[#ececec] bg-[#f7f7f7] py-10">
        <div className={CONTAINER}>
          <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-[20px] font-bold text-foreground">
                  From the Blog
                </h2>
                <Link
                  href="/blog"
                  className="text-[13px] font-semibold text-primary hover:underline"
                >
                  View all posts →
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {BLOG_TEASERS.map((post) => (
                  <Link
                    key={post.title}
                    href="/blog"
                    className="group overflow-hidden bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                      <span className="absolute left-0 top-0 bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        {post.category}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-[13px] font-semibold leading-snug text-foreground group-hover:text-primary">
                        {post.title}
                      </p>
                      <p className="mt-1 text-[12px] text-[#777]">
                        {post.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* App CTA / Newsletter */}
            <div className="flex flex-col gap-4">
              <div className="relative overflow-hidden bg-[#1a1a1a] p-6 text-white">
                <Image
                  src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80&auto=format&fit=crop"
                  alt="Mobile app"
                  fill
                  className="object-cover opacity-20"
                  sizes="280px"
                />
                <div className="relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Coming soon
                  </p>
                  <p className="mt-1 text-[18px] font-extrabold leading-tight">
                    The Exobe Africa Mobile App
                  </p>
                  <p className="mt-2 text-[12px] text-white/70">
                    Shop on the go. Get notified when we launch.
                  </p>
                  <Link
                    href="/register"
                    className="mt-4 inline-block bg-primary px-4 py-2 text-[12px] font-bold text-white transition-colors hover:bg-primary/90"
                  >
                    Join Waitlist →
                  </Link>
                </div>
              </div>

              <div className="bg-white p-6 shadow-sm">
                <p className="text-[15px] font-bold text-foreground">
                  Newsletter
                </p>
                <p className="mt-1 text-[12px] text-[#777]">
                  Get 10% off your first order when you subscribe.
                </p>
                <form className="mt-3 flex flex-col gap-2">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="h-[40px] w-full border border-[#ececec] bg-[#f7f7f7] px-3 text-[12px] outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="h-[40px] w-full bg-primary text-[12px] font-bold text-white transition-colors hover:bg-primary/90"
                  >
                    Subscribe & Save 10%
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. Become a Vendor CTA banner ────────────────────────── */}
      <section className="relative overflow-hidden border-t border-[#ececec]">
        <Image
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=80&auto=format&fit=crop"
          alt="Sell on Exobe Africa"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#D90429]/85" />
        <div className={`${CONTAINER} relative z-10 py-16 text-center text-white`}>
          <h2 className="text-[28px] font-extrabold sm:text-[36px]">
            Start Selling on Exobe Africa
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] text-white/85">
            Join hundreds of vendors reaching customers across South Africa. Low
            commission, easy setup, instant payouts.
          </p>
          <Link
            href="/become-vendor"
            className="mt-6 inline-block border-2 border-white bg-white px-8 py-3 text-[14px] font-bold text-primary transition-colors hover:bg-transparent hover:text-white"
          >
            Start selling today →
          </Link>
        </div>
      </section>
    </main>
  );
}
