"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api/client";

const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "PAYMENT_CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
] as const;

export function AdminOrderStatusControl({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="rounded-full border px-2 py-0.5 text-xs font-medium hover:border-primary hover:text-primary"
      >
        {status}
      </button>
    );
  }

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);
        const formData = new FormData(event.currentTarget);
        try {
          await apiFetch(`/api/admin/orders/${orderId}/status`, {
            method: "POST",
            body: JSON.stringify({ status: formData.get("status") }),
          });
          setEditing(false);
          router.refresh();
        } catch (err) {
          setError(err instanceof ApiError ? err.message : "Update failed.");
        } finally {
          setSaving(false);
        }
      }}
    >
      <select name="status" defaultValue={status} className="h-8 rounded-md border border-input bg-background px-1 text-xs">
        {ORDER_STATUSES.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      <button type="submit" disabled={saving} className="text-xs font-medium text-primary">
        Save
      </button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </form>
  );
}
