"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useApplyAsVendor, useVendorStore } from "@/hooks/use-vendor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";

export function VendorApplicationForm() {
  const { data: authSession } = useSession();
  const { data, isLoading } = useVendorStore();
  const apply = useApplyAsVendor();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  if (!authSession?.user) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <h2 className="text-2xl font-semibold">Apply to sell</h2>
        <p className="mt-3 text-muted-foreground">Sign in or create an account first to apply.</p>
        <Button asChild className="mt-4">
          <a href="/login?callbackUrl=/become-vendor%23apply">Sign in</a>
        </Button>
      </div>
    );
  }

  if (isLoading) return null;

  const store = data?.data;

  if (store) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <h2 className="text-2xl font-semibold">Your application</h2>
        <p className="mt-3 text-muted-foreground">
          Store: <span className="font-medium">{store.name}</span>
        </p>
        <p className="mt-2 inline-block rounded-full border px-3 py-1 text-sm font-medium">
          Status: {store.status}
        </p>
        {store.status === "REJECTED" && store.rejectionReason && (
          <p className="mt-3 text-sm text-destructive">Reason: {store.rejectionReason}</p>
        )}
        {store.status === "APPROVED" && (
          <Button className="mt-4" onClick={() => router.push("/vendor")}>
            Go to vendor dashboard
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h2 className="text-2xl font-semibold">Apply as a Retailer</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Tell us about your store. We&apos;ll review your application within 2-3 business days.
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setError(null);
          const formData = new FormData(event.currentTarget);
          try {
            await apply.mutateAsync({
              storeName: String(formData.get("storeName")),
              email: String(formData.get("email")),
              phone: String(formData.get("phone")),
              country: String(formData.get("country")),
            });
          } catch (err) {
            setError(err instanceof ApiError ? err.message : "Something went wrong.");
          }
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="storeName">Store name</Label>
          <Input id="storeName" name="storeName" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Business email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone number</Label>
          <Input id="phone" name="phone" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="country">Country (2-letter code)</Label>
          <Input id="country" name="country" maxLength={2} placeholder="ZA" required />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={apply.isPending}>
          {apply.isPending ? "Submitting..." : "Submit application"}
        </Button>
      </form>
    </div>
  );
}
