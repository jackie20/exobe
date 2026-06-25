"use client";

import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AccountProfileForm({ name }: { name: string }) {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    const formData = new FormData(event.currentTarget);
    const payload: Record<string, string> = {};

    const newName = String(formData.get("name") ?? "").trim();
    if (newName) payload.name = newName;

    const currentPassword = String(formData.get("currentPassword") ?? "").trim();
    const newPassword = String(formData.get("newPassword") ?? "").trim();
    if (newPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    if (Object.keys(payload).length === 0) { setSaving(false); return; }

    try {
      await apiFetch("/api/profile", { method: "PATCH", body: JSON.stringify(payload) });
      setSuccess("Profile updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-5">
      <div className="space-y-1.5">
        <Label>Display name</Label>
        <Input name="name" defaultValue={name} />
      </div>

      <div className="space-y-4 rounded-lg border border-border p-5">
        <p className="text-sm font-semibold">Change password</p>
        <div className="space-y-1.5">
          <Label>Current password</Label>
          <Input name="currentPassword" type="password" autoComplete="current-password" />
        </div>
        <div className="space-y-1.5">
          <Label>New password</Label>
          <Input name="newPassword" type="password" autoComplete="new-password" minLength={8} />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-success">{success}</p>}

      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
