"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api/client";

export function AdminConfirmManualPayment({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError(null);
          try {
            await apiFetch(`/api/admin/orders/${orderId}/confirm-manual-payment`, { method: "POST" });
            router.refresh();
          } catch (err) {
            setError(err instanceof ApiError ? err.message : "Failed to confirm payment.");
          } finally {
            setPending(false);
          }
        }}
        className="text-xs font-medium text-primary hover:underline"
      >
        Confirm EFT received
      </button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
