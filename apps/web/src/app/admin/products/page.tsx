"use client";

import { useState } from "react";
import { useAdminProducts, useApproveProduct, useRejectProduct } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { ApiError } from "@/lib/api/client";

export default function AdminProductsPage() {
  const { data, isLoading } = useAdminProducts("PENDING_REVIEW");
  const approve = useApproveProduct();
  const reject = useRejectProduct();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [approvalError, setApprovalError] = useState<string | null>(null);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Product moderation</h1>

      {isLoading ? null : !data || data.data.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No products awaiting review.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {data.data.map((product) => (
            <div key={product.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    SKU {product.sku} · {formatMoney(Number(product.basePrice))} ·{" "}
                    {product.store?.name ?? "Platform"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={approve.isPending}
                    onClick={async () => {
                      setApprovalError(null);
                      try {
                        await approve.mutateAsync(product.id);
                      } catch (err) {
                        setApprovalError(err instanceof ApiError ? err.message : "Approval failed.");
                      }
                    }}
                  >
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setRejectingId(product.id)}>
                    Reject
                  </Button>
                </div>
              </div>

              {approvalError && rejectingId !== product.id && (
                <p className="mt-2 text-sm text-destructive">{approvalError}</p>
              )}

              {rejectingId === product.id && (
                <div className="mt-3 flex gap-2">
                  <input
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Reason for rejection"
                    className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      reject.mutate({ productId: product.id, reason });
                      setRejectingId(null);
                      setReason("");
                    }}
                    disabled={!reason || reject.isPending}
                  >
                    Confirm reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
