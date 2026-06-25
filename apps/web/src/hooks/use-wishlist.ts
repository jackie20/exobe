import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api/client";

type WishlistEntry = {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    currency: string;
    price: number;
    isOnSale: boolean;
  };
};

const WISHLIST_KEY = ["wishlist"];

export function useWishlist() {
  const { status } = useSession();
  return useQuery({
    queryKey: WISHLIST_KEY,
    queryFn: () => apiFetch<{ data: WishlistEntry[] }>("/api/wishlist"),
    enabled: status === "authenticated",
  });
}

export function useIsWishlisted(productId: string) {
  const { data } = useWishlist();
  return Boolean(data?.data.some((entry) => entry.product.id === productId));
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();
  const { data } = useWishlist();

  return useMutation({
    mutationFn: async (productId: string) => {
      const isWishlisted = data?.data.some((entry) => entry.product.id === productId);
      if (isWishlisted) {
        return apiFetch(`/api/wishlist/${productId}`, { method: "DELETE" });
      }
      return apiFetch("/api/wishlist", { method: "POST", body: JSON.stringify({ productId }) });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WISHLIST_KEY }),
  });
}
