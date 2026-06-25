"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import { useProducts, useCategories, useBrands, type ProductFilters } from "@/hooks/use-products";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CONTAINER } from "@/lib/layout";

const SORT_OPTIONS: { value: ProductFilters["sort"]; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsList />
    </Suspense>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-[#ececec] pb-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-3 text-[13px] font-bold uppercase tracking-wide text-foreground"
      >
        {title}
        {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>
      {open && <div className="pt-1">{children}</div>}
    </div>
  );
}

function ProductsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const filters: ProductFilters = {
    search: searchParams.get("search") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    brand: searchParams.get("brand") ?? undefined,
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    featured: searchParams.get("featured") === "true" ? true : undefined,
    sort: (searchParams.get("sort") as ProductFilters["sort"]) ?? "newest",
    page: Number(searchParams.get("page") ?? 1),
  };

  const { data, isLoading } = useProducts(filters);
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  function clearAllFilters() {
    router.push("/products");
  }

  const hasActiveFilters = filters.category || filters.brand || filters.minPrice || filters.maxPrice || filters.search;

  const SidebarContent = () => (
    <div className="space-y-0">
      <FilterSection title="Categories">
        <ul className="space-y-1.5 text-[13px]">
          <li>
            <button
              onClick={() => updateParam("category", "")}
              className={cn(
                "flex items-center gap-2 transition-colors hover:text-primary",
                !filters.category ? "font-semibold text-primary" : "text-[#555]"
              )}
            >
              <span
                className={cn(
                  "size-3 rounded-full border",
                  !filters.category
                    ? "border-primary bg-primary"
                    : "border-[#ccc]"
                )}
              />
              All Categories
            </button>
          </li>
          {categories?.data.map((category) => (
            <li key={category.id}>
              <button
                onClick={() => updateParam("category", category.slug)}
                className={cn(
                  "flex items-center gap-2 transition-colors hover:text-primary",
                  filters.category === category.slug
                    ? "font-semibold text-primary"
                    : "text-[#555]"
                )}
              >
                <span
                  className={cn(
                    "size-3 rounded-full border",
                    filters.category === category.slug
                      ? "border-primary bg-primary"
                      : "border-[#ccc]"
                  )}
                />
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      <FilterSection title="Brands">
        <ul className="space-y-1.5 text-[13px]">
          <li>
            <button
              onClick={() => updateParam("brand", "")}
              className={cn(
                "flex items-center gap-2 transition-colors hover:text-primary",
                !filters.brand ? "font-semibold text-primary" : "text-[#555]"
              )}
            >
              <span
                className={cn(
                  "size-3 rounded-full border",
                  !filters.brand ? "border-primary bg-primary" : "border-[#ccc]"
                )}
              />
              All Brands
            </button>
          </li>
          {brands?.data.map((brand) => (
            <li key={brand.id}>
              <button
                onClick={() => updateParam("brand", brand.slug)}
                className={cn(
                  "flex items-center gap-2 transition-colors hover:text-primary",
                  filters.brand === brand.slug
                    ? "font-semibold text-primary"
                    : "text-[#555]"
                )}
              >
                <span
                  className={cn(
                    "size-3 rounded-full border",
                    filters.brand === brand.slug
                      ? "border-primary bg-primary"
                      : "border-[#ccc]"
                  )}
                />
                {brand.name}
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      <FilterSection title="Price Range">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const params = new URLSearchParams(searchParams.toString());
            const min = String(fd.get("min") ?? "");
            const max = String(fd.get("max") ?? "");
            if (min) params.set("minPrice", min);
            else params.delete("minPrice");
            if (max) params.set("maxPrice", max);
            else params.delete("maxPrice");
            params.delete("page");
            router.push(`/products?${params.toString()}`);
          }}
        >
          <input
            name="min"
            type="number"
            placeholder="Min"
            defaultValue={filters.minPrice}
            className="h-8 w-full border border-[#ececec] bg-[#f7f7f7] px-2 text-[12px] outline-none focus:border-primary"
          />
          <span className="text-[#ccc]">–</span>
          <input
            name="max"
            type="number"
            placeholder="Max"
            defaultValue={filters.maxPrice}
            className="h-8 w-full border border-[#ececec] bg-[#f7f7f7] px-2 text-[12px] outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="shrink-0 bg-primary px-3 py-1.5 text-[11px] font-bold text-white"
          >
            OK
          </button>
        </form>
      </FilterSection>

      {hasActiveFilters && (
        <div className="pt-4">
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1.5 text-[12px] text-[#999] transition-colors hover:text-primary"
          >
            <X className="size-3.5" />
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className={`${CONTAINER} py-6`}>
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-[12px] text-[#999]">
        <a href="/" className="hover:text-primary">
          Home
        </a>
        <span>/</span>
        <span className="text-foreground">
          {filters.category
            ? categories?.data.find((c) => c.slug === filters.category)?.name ??
              "Products"
            : "All Products"}
        </span>
      </nav>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-[240px] shrink-0 lg:block">
          <div className="sticky top-[120px]">
            <p className="mb-4 border-b border-[#ececec] pb-3 text-[15px] font-bold text-foreground">
              Filters
            </p>
            <SidebarContent />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#ececec] pb-4">
            <div className="flex items-center gap-3">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="flex items-center gap-1.5 border border-[#ececec] px-3 py-1.5 text-[12px] font-semibold transition-colors hover:border-primary hover:text-primary lg:hidden"
              >
                <SlidersHorizontal className="size-3.5" />
                Filters
              </button>

              {data && (
                <p className="text-[13px] text-[#999]">
                  <span className="font-semibold text-foreground">
                    {data.meta?.total ?? data.data.length}
                  </span>{" "}
                  product{(data.meta?.total ?? data.data.length) !== 1 ? "s" : ""}
                  {filters.search && (
                    <span> for &ldquo;{filters.search}&rdquo;</span>
                  )}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <select
                value={filters.sort}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="h-8 border border-[#ececec] bg-white px-2 text-[12px] outline-none focus:border-primary"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="flex items-center border border-[#ececec]">
                <button
                  aria-label="Grid view"
                  onClick={() => setView("grid")}
                  className={cn(
                    "flex size-8 items-center justify-center transition-colors",
                    view === "grid"
                      ? "bg-primary text-white"
                      : "text-[#999] hover:text-primary"
                  )}
                >
                  <LayoutGrid className="size-4" />
                </button>
                <button
                  aria-label="List view"
                  onClick={() => setView("list")}
                  className={cn(
                    "flex size-8 items-center justify-center transition-colors",
                    view === "list"
                      ? "bg-primary text-white"
                      : "text-[#999] hover:text-primary"
                  )}
                >
                  <List className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="border border-[#E5E5E5] bg-white">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-8 w-full mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : data && data.data.length > 0 ? (
            <div
              className={cn(
                view === "grid"
                  ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
                  : "grid grid-cols-1 gap-3"
              )}
            >
              {data.data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-[15px] font-semibold text-foreground">
                No products found
              </p>
              <p className="mt-1 text-[13px] text-[#999]">
                Try adjusting your filters or search terms
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="mt-4 bg-primary px-5 py-2 text-[13px] font-bold text-white"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {Array.from({ length: data.meta.totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => updateParam("page", String(i + 1))}
                  className={cn(
                    "flex size-8 items-center justify-center text-[13px] transition-colors",
                    filters.page === i + 1
                      ? "bg-primary text-white"
                      : "bg-[#f5f5f5] text-foreground hover:bg-primary hover:text-white"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter sidebar overlay */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="panel-sidebar lg:hidden">
            <div className="flex items-center justify-between border-b border-[#ececec] px-4 py-3.5">
              <p className="text-[15px] font-bold">Filters</p>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                aria-label="Close"
                className="text-[#999] hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="p-4">
              <SidebarContent />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
