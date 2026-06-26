"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { apiFetch } from "@/lib/api/client";

const STORAGE_KEY = "exobe_newsletter_dismissed";
const SHOW_DELAY_MS = 3500;

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/api/newsletter", { method: "POST", body: JSON.stringify({ email }) });
    } catch { /* ignore duplicate / errors silently */ }
    setSubmitted(true);
    window.localStorage.setItem(STORAGE_KEY, "1");
    setLoading(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={dismiss}
        aria-hidden
      />

      {/* Modal */}
      <div className="relative z-10 flex w-full max-w-2xl overflow-hidden bg-white shadow-2xl">
        {/* Left — image panel */}
        <div className="relative hidden w-[45%] shrink-0 sm:block">
          <Image
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80&auto=format&fit=crop"
            alt="Exobe Africa special offers"
            fill
            className="object-cover"
            sizes="300px"
          />
          <div className="absolute inset-0 bg-[#D90429]/70" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white">
            <p className="text-[11px] font-bold uppercase tracking-[3px]">
              Special Offer
            </p>
            <p className="mt-3 text-[52px] font-extrabold leading-none">
              10%
            </p>
            <p className="text-[16px] font-bold">OFF</p>
            <p className="mt-2 text-[13px] text-white/80">
              on your first order
            </p>
          </div>
        </div>

        {/* Right — content */}
        <div className="flex flex-1 flex-col p-8">
          <button
            onClick={dismiss}
            aria-label="Close"
            className="absolute right-4 top-4 text-[#bbb] transition-colors hover:text-foreground"
          >
            <X className="size-5" />
          </button>

          {submitted ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-[#fbe7ea]">
                <svg
                  className="size-8 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h2 className="mt-4 text-[20px] font-extrabold text-foreground">
                You&apos;re on the list!
              </h2>
              <p className="mt-2 text-[13px] text-[#777]">
                Your 10% discount code has been sent to your inbox.
                <br />
                Happy shopping!
              </p>
              <button
                onClick={dismiss}
                className="mt-6 w-full bg-primary py-3 text-[13px] font-bold text-white transition-colors hover:bg-primary/90"
              >
                Start Shopping →
              </button>
            </div>
          ) : (
            <div className="flex flex-1 flex-col justify-center">
              {/* Mobile discount badge */}
              <div className="mb-4 flex items-center gap-2 sm:hidden">
                <span className="bg-primary px-3 py-1 text-[11px] font-bold text-white">
                  10% OFF
                </span>
                <span className="text-[12px] text-[#777]">your first order</span>
              </div>

              <p className="text-[11px] font-bold uppercase tracking-[2px] text-primary">
                Exclusive Subscriber Offer
              </p>
              <h2 className="mt-2 text-[22px] font-extrabold leading-snug text-foreground">
                Get 10% off your first order
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-[#777]">
                Subscribe to Exobe Africa for early access to sales, new
                arrivals, and local vendor spotlights.
              </p>

              <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="h-[46px] w-full border border-[#ececec] bg-[#f7f7f7] px-4 text-[13px] outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="h-[46px] w-full bg-primary text-[13px] font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {loading ? "Subscribing…" : "Claim My 10% Discount"}
                </button>
              </form>

              <button
                onClick={dismiss}
                className="mt-4 text-center text-[11px] text-[#bbb] transition-colors hover:text-[#777]"
              >
                No thanks, I&apos;ll pay full price
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
