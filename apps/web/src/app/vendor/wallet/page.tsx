"use client";

import { useState } from "react";
import { useVendorWallet, useVendorWithdrawals, useRequestWithdrawal } from "@/hooks/use-vendor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/format";
import { ApiError } from "@/lib/api/client";
import { MIN_WITHDRAWAL_AMOUNT } from "@/lib/commission";

export default function VendorWalletPage() {
  const { data } = useVendorWallet();
  const { data: withdrawals } = useVendorWithdrawals();
  const requestWithdrawal = useRequestWithdrawal();
  const [error, setError] = useState<string | null>(null);

  const wallet = data?.data.wallet;

  const stats = [
    { label: "Gross revenue", value: wallet?.grossRevenue },
    { label: "Platform commission", value: wallet?.platformCommission },
    { label: "Net earnings", value: wallet?.netEarnings },
    { label: "Available balance", value: wallet?.availableBalance },
    { label: "Withdrawn", value: wallet?.withdrawnBalance },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Wallet</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-lg font-semibold">{formatMoney(Number(stat.value ?? 0))}</p>
          </div>
        ))}
      </div>

      <form
        className="mt-8 flex max-w-sm items-end gap-3"
        onSubmit={async (event) => {
          event.preventDefault();
          setError(null);
          const formData = new FormData(event.currentTarget);
          try {
            await requestWithdrawal.mutateAsync(Number(formData.get("amount")));
            event.currentTarget.reset();
          } catch (err) {
            setError(err instanceof ApiError ? err.message : "Something went wrong.");
          }
        }}
      >
        <div className="flex-1 space-y-1.5">
          <label className="text-sm font-medium">Request withdrawal (min {formatMoney(MIN_WITHDRAWAL_AMOUNT)})</label>
          <Input name="amount" type="number" min={MIN_WITHDRAWAL_AMOUNT} step="0.01" required />
        </div>
        <Button type="submit" disabled={requestWithdrawal.isPending}>
          Request
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      <h2 className="mt-10 text-lg font-semibold">Withdrawal history</h2>
      {!withdrawals || withdrawals.data.length === 0 ? (
        <p className="mt-3 text-muted-foreground">No withdrawals yet.</p>
      ) : (
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              <th className="py-2">Date</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.data.map((withdrawal) => (
              <tr key={withdrawal.id} className="border-b border-border">
                <td className="py-3">{new Date(withdrawal.createdAt).toLocaleDateString()}</td>
                <td className="py-3">{formatMoney(Number(withdrawal.amount))}</td>
                <td className="py-3">
                  <span className="rounded-full border px-2 py-0.5 text-xs font-medium">{withdrawal.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
