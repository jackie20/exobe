"use client";

import { useState } from "react";
import { useAdminVendors, useApproveVendor, useRejectVendor } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";

export default function AdminVendorsPage() {
  const { data, isLoading } = useAdminVendors("PENDING");
  const approve = useApproveVendor();
  const reject = useRejectVendor();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  return (
    <div>
      <h1 className="text-2xl font-semibold">Vendor applications</h1>

      {isLoading ? null : !data || data.data.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No pending applications.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {data.data.map((store) => (
            <div key={store.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{store.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {store.customer.name} · {store.customer.email} · {store.country}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => approve.mutate(store.id)} disabled={approve.isPending}>
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setRejectingId(store.id)}>
                    Reject
                  </Button>
                </div>
              </div>

              {rejectingId === store.id && (
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
                      reject.mutate({ storeId: store.id, reason });
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
