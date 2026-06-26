"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CONTAINER } from "@/lib/layout";
import { apiFetch, ApiError } from "@/lib/api/client";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError(null);
    try {
      await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className={`${CONTAINER} py-16 text-center`}>
        <p className="text-[15px] text-[#999]">Invalid reset link.</p>
        <Link href="/forgot-password" className="mt-4 inline-block text-primary hover:underline">Request a new one</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f7f7] min-h-screen">
      <div className="border-b border-[#ececec] bg-white">
        <div className={`${CONTAINER} flex items-center gap-1.5 py-3 text-[12px] text-[#999]`}>
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="size-3" />
          <span className="text-[#333]">Reset Password</span>
        </div>
      </div>

      <div className={`${CONTAINER} flex min-h-[70vh] items-center justify-center py-12`}>
        <div className="w-full max-w-[420px]">
          <div className="rounded bg-white border border-[#ececec] p-8">
            <div className="mb-6 flex justify-center">
              <Link href="/"><Image src="/exobe-logo.png" alt="Exobe Africa" width={130} height={40} className="h-10 w-auto object-contain" /></Link>
            </div>

            {success ? (
              <div className="text-center">
                <CheckCircle className="mx-auto mb-3 size-14 text-green-500" />
                <h1 className="text-[20px] font-bold text-[#333]">Password Reset!</h1>
                <p className="mt-2 text-[13px] text-[#999]">Your password has been changed. Redirecting to login…</p>
              </div>
            ) : (
              <>
                <h1 className="text-center text-[22px] font-bold text-[#333]">Set New Password</h1>
                <p className="mt-1 text-center text-[13px] text-[#999]">Choose a strong password for your account.</p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold uppercase text-[#666]">New Password *</Label>
                    <div className="relative">
                      <Input
                        type={showPw ? "text" : "password"}
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="border-[#ececec] pr-10 text-[13px] focus:border-primary"
                      />
                      <button type="button" onClick={() => setShowPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-[#555]">
                        {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold uppercase text-[#666]">Confirm Password *</Label>
                    <Input
                      type="password"
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat your password"
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
                    {loading ? "Resetting…" : "Reset Password"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
