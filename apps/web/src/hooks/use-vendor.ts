import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";

export type Store = {
  id: string;
  name: string;
  slug: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  rejectionReason: string | null;
  email: string;
  phone: string;
  country: string;
  description: string | null;
};

export function useVendorStore() {
  return useQuery({
    queryKey: ["vendor", "me"],
    queryFn: () => apiFetch<{ data: Store | null }>("/api/vendor/me"),
  });
}

export function useApplyAsVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { storeName: string; email: string; phone: string; country: string }) =>
      apiFetch("/api/vendor/apply", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vendor", "me"] }),
  });
}

export type VendorProduct = {
  id: string;
  name: string;
  sku: string;
  status: string;
  basePrice: string;
  stockQuantity: number;
  images: { url: string }[];
};

export function useVendorProducts() {
  return useQuery({
    queryKey: ["vendor", "products"],
    queryFn: () => apiFetch<{ data: VendorProduct[] }>("/api/vendor/products"),
  });
}

export type VendorCoupon = {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: string;
  isActive: boolean;
};

export function useVendorCoupons() {
  return useQuery({
    queryKey: ["vendor", "coupons"],
    queryFn: () => apiFetch<{ data: VendorCoupon[] }>("/api/vendor/coupons"),
  });
}

export function useCreateVendorCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { code: string; type: "PERCENT" | "FIXED"; value: number }) =>
      apiFetch("/api/vendor/coupons", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vendor", "coupons"] }),
  });
}

export type WalletData = {
  wallet: {
    grossRevenue: string;
    platformCommission: string;
    netEarnings: string;
    availableBalance: string;
    withdrawnBalance: string;
  } | null;
  transactions: { id: string; type: string; amount: string; createdAt: string; description: string | null }[];
};

export function useVendorWallet() {
  return useQuery({
    queryKey: ["vendor", "wallet"],
    queryFn: () => apiFetch<{ data: WalletData }>("/api/vendor/wallet"),
  });
}

export function useVendorWithdrawals() {
  return useQuery({
    queryKey: ["vendor", "withdrawals"],
    queryFn: () => apiFetch<{ data: { id: string; amount: string; status: string; createdAt: string }[] }>(
      "/api/vendor/withdrawals"
    ),
  });
}

export function useRequestWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) =>
      apiFetch("/api/vendor/withdrawals", { method: "POST", body: JSON.stringify({ amount }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor", "wallet"] });
      queryClient.invalidateQueries({ queryKey: ["vendor", "withdrawals"] });
    },
  });
}
