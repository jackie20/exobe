import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { Brand, Category, PaginatedResponse, ProductDetail, ProductSummary } from "@/lib/api/types";

export type ProductFilters = {
  page?: number;
  perPage?: number;
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  ids?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "rating";
};

function toQueryString(filters: ProductFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => apiFetch<PaginatedResponse<ProductSummary>>(`/api/products${toQueryString(filters)}`),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => apiFetch<{ data: ProductDetail }>(`/api/products/${slug}`),
    enabled: Boolean(slug),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => apiFetch<{ data: Category[] }>("/api/categories"),
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: () => apiFetch<{ data: Brand[] }>("/api/brands"),
  });
}
