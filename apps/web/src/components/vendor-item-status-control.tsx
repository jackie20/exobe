"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api/client";

const FULFILLMENT_STATUSES = ["PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"] as const;

export function VendorItemStatusControl({
  orderItemId,
  status,
  trackingNumber,
}: {
  orderItemId: string;
  status: string;
  trackingNumber: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
          await apiFetch(`/api/vendor/orders/${orderItemId}/status`, {
            method: "PATCH",
            body: JSON.stringify({
              status: formData.get("status"),
              trackingNumber: formData.get("trackingNumber") || undefined,
            }),
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
        {FULFILLMENT_STATUSES.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      <input
        name="trackingNumber"
        defaultValue={trackingNumber ?? ""}
        placeholder="Tracking #"
        className="h-8 w-28 rounded-md border border-input bg-background px-2 text-xs"
      />
      <button type="submit" disabled={saving} className="text-xs font-medium text-primary">
        Save
      </button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </form>
  );
}
