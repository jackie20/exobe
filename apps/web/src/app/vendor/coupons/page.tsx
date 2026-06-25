"use client";

import { useState } from "react";
import { useVendorCoupons, useCreateVendorCoupon } from "@/hooks/use-vendor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";

export default function VendorCouponsPage() {
  const { data, isLoading } = useVendorCoupons();
  const createCoupon = useCreateVendorCoupon();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Coupons</h1>

      <form
        className="mt-6 grid gap-4 rounded-lg border border-border p-6 sm:grid-cols-3"
        onSubmit={async (event) => {
          event.preventDefault();
          setError(null);
          const formData = new FormData(event.currentTarget);
          try {
            await createCoupon.mutateAsync({
              code: String(formData.get("code")).toUpperCase(),
              type: formData.get("type") as "PERCENT" | "FIXED",
              value: Number(formData.get("value")),
            });
            event.currentTarget.reset();
          } catch (err) {
            setError(err instanceof ApiError ? err.message : "Something went wrong.");
          }
        }}
      >
        <div className="space-y-1.5">
          <Label>Code</Label>
          <Input name="code" required />
        </div>
        <div className="space-y-1.5">
          <Label>Type</Label>
          <select name="type" className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
            <option value="PERCENT">Percent off</option>
            <option value="FIXED">Fixed amount off</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Value</Label>
          <Input name="value" type="number" min={0} step="0.01" required />
        </div>
        {error && <p className="text-sm text-destructive sm:col-span-3">{error}</p>}
        <Button type="submit" disabled={createCoupon.isPending} className="sm:col-span-3">
          Create coupon
        </Button>
      </form>

      {isLoading ? null : !data || data.data.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No coupons yet.</p>
      ) : (
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              <th className="py-2">Code</th>
              <th className="py-2">Type</th>
              <th className="py-2">Value</th>
              <th className="py-2">Active</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((coupon) => (
              <tr key={coupon.id} className="border-b border-border">
                <td className="py-3 font-medium">{coupon.code}</td>
                <td className="py-3">{coupon.type}</td>
                <td className="py-3">{coupon.value}</td>
                <td className="py-3">{coupon.isActive ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
