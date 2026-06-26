"use client";

import { useState } from "react";
import { toast } from "sonner";
import { apiFetch, ApiError } from "@/lib/api/client";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await apiFetch("/api/newsletter", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      toast.success("Subscribed! Welcome to Exobe Africa.");
      setEmail("");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        required
        disabled={loading}
        className="h-[40px] w-full border border-[#ececec] bg-[#f7f7f7] px-3 text-[12px] outline-none focus:border-primary disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={loading}
        className="h-[40px] shrink-0 bg-primary px-3 text-[12px] font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {loading ? "…" : "Subscribe"}
      </button>
    </form>
  );
}
