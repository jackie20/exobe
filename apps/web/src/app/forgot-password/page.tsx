"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CONTAINER } from "@/lib/layout";
import { apiFetch, ApiError } from "@/lib/api/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ message: string; resetUrl?: string }>("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      if (res.resetUrl) setDevLink(res.resetUrl);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#f7f7f7] min-h-screen">
      <div className="border-b border-[#ececec] bg-white">
        <div className={`${CONTAINER} flex items-center gap-1.5 py-3 text-[12px] text-[#999]`}>
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="size-3" />
          <Link href="/login" className="hover:text-primary">Login</Link>
          <ChevronRight className="size-3" />
          <span className="text-[#333]">Forgot Password</span>
        </div>
      </div>

      <div className={`${CONTAINER} flex min-h-[70vh] items-center justify-center py-12`}>
        <div className="w-full max-w-[420px]">
          <div className="rounded bg-white border border-[#ececec] p-8">
            <div className="mb-6 flex justify-center">
              <Link href="/"><Image src="/exobe-logo.png" alt="Exobe Africa" width={130} height={40} className="h-10 w-auto object-contain" /></Link>
            </div>

            {submitted ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-[#f0fff4]">
                  <Mail className="size-8 text-green-500" />
                </div>
                <h1 className="text-[20px] font-bold text-[#333]">Check your email</h1>
                <p className="mt-2 text-[13px] text-[#999]">
                  If an account exists for <strong>{email}</strong>, we sent a password reset link.
                </p>
                {devLink && (
                  <div className="mt-4 rounded border border-yellow-200 bg-yellow-50 px-4 py-3 text-left">
                    <p className="text-[11px] font-bold uppercase text-yellow-700">Dev mode — reset link:</p>
                    <Link href={devLink} className="mt-1 block break-all text-[12px] text-primary hover:underline">
                      {devLink}
                    </Link>
                  </div>
                )}
                <Link href="/login" className="mt-6 block text-[13px] font-semibold text-primary hover:underline">
                  ← Back to login
                </Link>
              </div>
            ) : (
              <>
                <h1 className="text-center text-[22px] font-bold text-[#333]">Forgot Password?</h1>
                <p className="mt-1 text-center text-[13px] text-[#999]">
                  Enter your email and we&apos;ll send you a reset link.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold uppercase text-[#666]">Email Address *</Label>
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="border-[#ececec] text-[13px] focus:border-primary"
                    />
                  </div>

                  {error && (
                    <div className="rounded border border-[#f79090] bg-[#ffe9e1] px-4 py-3 text-[13px] text-destructive">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary py-3 text-[13px] font-bold text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    {loading ? "Sending…" : "Send Reset Link"}
                  </button>
                </form>

                <p className="mt-6 text-center text-[13px] text-[#999]">
                  <Link href="/login" className="font-semibold text-primary hover:underline">
                    ← Back to login
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
