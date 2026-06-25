"use client";

import { useState } from "react";
import {
  useAdminWithdrawals,
  useApproveWithdrawal,
  useRejectWithdrawal,
  useMarkWithdrawalPaid,
} from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";

export default function AdminWithdrawalsPage() {
  const { data, isLoading } = useAdminWithdrawals();
  const approve = useApproveWithdrawal();
  const reject = useRejectWithdrawal();
  const markPaid = useMarkWithdrawalPaid();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  return (
    <div>
      <h1 className="text-2xl font-semibold">Withdrawals</h1>

      {isLoading ? null : !data || data.data.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No withdrawal requests yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {data.data.map((withdrawal) => (
            <div key={withdrawal.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{withdrawal.store.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatMoney(Number(withdrawal.amount))} ·{" "}
                    {new Date(withdrawal.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border px-2 py-0.5 text-xs font-medium">{withdrawal.status}</span>
                  {withdrawal.status === "PENDING" && (
                    <>
                      <Button size="sm" onClick={() => approve.mutate(withdrawal.id)} disabled={approve.isPending}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setRejectingId(withdrawal.id)}>
                        Reject
                      </Button>
                    </>
                  )}
                  {withdrawal.status === "APPROVED" && (
                    <Button size="sm" onClick={() => markPaid.mutate(withdrawal.id)} disabled={markPaid.isPending}>
                      Mark as paid
                    </Button>
                  )}
                </div>
              </div>

              {rejectingId === withdrawal.id && (
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
                      reject.mutate({ id: withdrawal.id, reason });
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
