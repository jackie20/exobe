"use client";

import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Address = {
  id: string;
  fullName: string;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  country: string;
  zipCode: string | null;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
};

export function AccountAddresses({ initial }: { initial: Address[] }) {
  const [addresses, setAddresses] = useState<Address[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    try {
      await apiFetch(`/api/addresses/${id}`, { method: "DELETE" });
    } catch {
      // Refetch on failure — simple recovery
      const res = await apiFetch<{ data: Address[] }>("/api/addresses");
      setAddresses(res.data);
    }
  }

  async function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    const formData = new FormData(event.currentTarget);

    try {
      const res = await apiFetch<{ data: Address }>("/api/addresses", {
        method: "POST",
        body: JSON.stringify({
          fullName: String(formData.get("fullName")),
          phone: String(formData.get("phone")),
          line1: String(formData.get("line1")),
          line2: String(formData.get("line2") || ""),
          city: String(formData.get("city")),
          state: String(formData.get("state") || ""),
          country: String(formData.get("country")),
          zipCode: String(formData.get("zipCode") || ""),
        }),
      });
      setAddresses((prev) => [res.data, ...prev]);
      setShowForm(false);
      (event.target as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save address.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="space-y-3">
        {addresses.length === 0 && !showForm && (
          <p className="text-muted-foreground">No saved addresses yet.</p>
        )}
        {addresses.map((address) => (
          <div key={address.id} className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
            <div className="text-sm">
              <p className="font-medium">{address.fullName}</p>
              <p className="text-muted-foreground">
                {address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city}
                {address.state ? `, ${address.state}` : ""}, {address.country}
                {address.zipCode ? ` ${address.zipCode}` : ""}
              </p>
              <p className="text-muted-foreground">{address.phone}</p>
              <div className="mt-1 flex gap-2">
                {address.isDefaultShipping && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">Default shipping</span>
                )}
                {address.isDefaultBilling && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">Default billing</span>
                )}
              </div>
            </div>
            <button
              aria-label="Delete address"
              onClick={() => handleDelete(address.id)}
              className="shrink-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>

      {!showForm && (
        <Button variant="outline" className="mt-4" onClick={() => setShowForm(true)}>
          <Plus className="mr-2 size-4" />
          Add address
        </Button>
      )}

      {showForm && (
        <form onSubmit={handleAdd} className="mt-4 grid gap-3 rounded-lg border border-border p-5 sm:grid-cols-2">
          <p className="text-sm font-semibold sm:col-span-2">New address</p>
          <div className="space-y-1.5">
            <Label>Full name</Label>
            <Input name="fullName" required />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input name="phone" required />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Address line 1</Label>
            <Input name="line1" required />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Address line 2 (optional)</Label>
            <Input name="line2" />
          </div>
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input name="city" required />
          </div>
          <div className="space-y-1.5">
            <Label>Province / State</Label>
            <Input name="state" />
          </div>
          <div className="space-y-1.5">
            <Label>Country (2-letter code)</Label>
            <Input name="country" maxLength={2} placeholder="ZA" required />
          </div>
          <div className="space-y-1.5">
            <Label>Postal code</Label>
            <Input name="zipCode" />
          </div>
          {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save address"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
