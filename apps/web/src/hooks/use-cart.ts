import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { Cart } from "@/lib/api/types";

const CART_KEY = ["cart"];

export function useCart() {
  return useQuery({
    queryKey: CART_KEY,
    queryFn: () => apiFetch<{ data: Cart }>("/api/cart"),
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { productId: string; variantId?: string; quantity?: number }) =>
      apiFetch<{ data: Cart }>("/api/cart", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: (response) => queryClient.setQueryData(CART_KEY, response),
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { itemId: string; quantity: number }) =>
      apiFetch<{ data: Cart }>(`/api/cart/${input.itemId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity: input.quantity }),
      }),
    onSuccess: (response) => queryClient.setQueryData(CART_KEY, response),
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) =>
      apiFetch<{ data: Cart }>(`/api/cart/${itemId}`, { method: "DELETE" }),
    onSuccess: (response) => queryClient.setQueryData(CART_KEY, response),
  });
}
