import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";

export type AdminStore = {
  id: string;
  name: string;
  slug: string;
  status: string;
  email: string;
  country: string;
  createdAt: string;
  customer: { name: string; email: string };
};

export function useAdminVendors(status?: string) {
  return useQuery({
    queryKey: ["admin", "vendors", status],
    queryFn: () => apiFetch<{ data: AdminStore[] }>(`/api/admin/vendors${status ? `?status=${status}` : ""}`),
  });
}

export function useApproveVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (storeId: string) => apiFetch(`/api/admin/vendors/${storeId}/approve`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "vendors"] }),
  });
}

export function useRejectVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ storeId, reason }: { storeId: string; reason: string }) =>
      apiFetch(`/api/admin/vendors/${storeId}/reject`, { method: "POST", body: JSON.stringify({ reason }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "vendors"] }),
  });
}

export type AdminProduct = {
  id: string;
  name: string;
  sku: string;
  basePrice: string;
  store: { name: string; slug: string } | null;
  images: { url: string }[];
};

export function useAdminProducts(status = "PENDING_REVIEW") {
  return useQuery({
    queryKey: ["admin", "products", status],
    queryFn: () => apiFetch<{ data: AdminProduct[] }>(`/api/admin/products?status=${status}`),
  });
}

export function useApproveProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => apiFetch(`/api/admin/products/${productId}/approve`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "products"] }),
  });
}

export function useRejectProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, reason }: { productId: string; reason: string }) =>
      apiFetch(`/api/admin/products/${productId}/reject`, { method: "POST", body: JSON.stringify({ reason }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "products"] }),
  });
}

export type AdminWithdrawal = {
  id: string;
  amount: string;
  status: string;
  createdAt: string;
  store: { name: string; slug: string };
};

export function useAdminWithdrawals(status?: string) {
  return useQuery({
    queryKey: ["admin", "withdrawals", status],
    queryFn: () =>
      apiFetch<{ data: AdminWithdrawal[] }>(`/api/admin/withdrawals${status ? `?status=${status}` : ""}`),
  });
}

export function useApproveWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/admin/withdrawals/${id}/approve`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "withdrawals"] }),
  });
}

export function useRejectWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiFetch(`/api/admin/withdrawals/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "withdrawals"] }),
  });
}

export function useMarkWithdrawalPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/admin/withdrawals/${id}/mark-paid`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "withdrawals"] }),
  });
}
