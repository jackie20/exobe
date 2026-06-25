"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type StoreProfile = {
  name: string;
  slug: string;
  email: string;
  phone: string;
  country: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  shippingPolicy: string | null;
  returnPolicy: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
};

export default function VendorStoreSettingsPage() {
  const [store, setStore] = useState<StoreProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: StoreProfile }>("/api/vendor/store")
      .then((res) => setStore(res.data))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);
    const formData = new FormData(event.currentTarget);

    const payload: Record<string, string> = {};
    for (const [key, val] of formData.entries()) {
      if (typeof val === "string" && val.trim()) payload[key] = val.trim();
    }

    try {
      await apiFetch("/api/vendor/store", { method: "PATCH", body: JSON.stringify(payload) });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!store) return <p className="text-sm text-destructive">Store not found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Store settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Public URL: <span className="font-mono">/stores/{store.slug}</span>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-10">
        <section className="space-y-4">
          <h2 className="text-base font-semibold">Branding</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Logo URL</Label>
              <Input name="logoUrl" type="url" defaultValue={store.logoUrl ?? ""} placeholder="https://…" />
            </div>
            <div className="space-y-1.5">
              <Label>Banner URL</Label>
              <Input name="bannerUrl" type="url" defaultValue={store.bannerUrl ?? ""} placeholder="https://…" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Store description</Label>
            <textarea
              name="description"
              rows={4}
              maxLength={2000}
              defaultValue={store.description ?? ""}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Tell customers about your store…"
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-semibold">Policies</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Shipping policy</Label>
              <textarea
                name="shippingPolicy"
                rows={4}
                maxLength={2000}
                defaultValue={store.shippingPolicy ?? ""}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Return policy</Label>
              <textarea
                name="returnPolicy"
                rows={4}
                maxLength={2000}
                defaultValue={store.returnPolicy ?? ""}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-semibold">Payout details</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Bank name</Label>
              <Input name="bankName" defaultValue={store.bankName ?? ""} placeholder="FNB, ABSA…" />
            </div>
            <div className="space-y-1.5">
              <Label>Account holder name</Label>
              <Input name="bankAccountName" defaultValue={store.bankAccountName ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label>Account number</Label>
              <Input name="bankAccountNumber" defaultValue={store.bankAccountNumber ?? ""} />
            </div>
          </div>
        </section>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-success">Saved.</p>}

        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
