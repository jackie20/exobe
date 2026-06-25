"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ChevronRight, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch, ApiError } from "@/lib/api/client";
import { CONTAINER } from "@/lib/layout";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name"));
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    try {
      await apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) });
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) throw new Error("Login after registration failed. Please sign in manually.");
      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#f7f7f7] min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-[#ececec] bg-white">
        <div className={`${CONTAINER} flex items-center gap-1.5 py-3 text-[12px] text-[#999]`}>
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="size-3" />
          <span className="text-[#333]">Register</span>
        </div>
      </div>

      <div className={`${CONTAINER} flex min-h-[70vh] items-center justify-center py-12`}>
        <div className="w-full max-w-[460px]">
          <div className="rounded bg-white border border-[#ececec] p-8">
            {/* Logo */}
            <div className="mb-6 flex justify-center">
              <Link href="/">
                <Image src="/exobe-logo.png" alt="Exobe Africa" width={130} height={40} className="h-10 w-auto object-contain" />
              </Link>
            </div>

            <h1 className="text-center text-[22px] font-bold text-[#333]">Create Account</h1>
            <p className="mt-1 text-center text-[13px] text-[#999]">Join Exobe Africa — it&apos;s free!</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold uppercase text-[#666]">Full Name *</Label>
                <Input
                  name="name"
                  required
                  placeholder="Your full name"
                  className="border-[#ececec] text-[13px] focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold uppercase text-[#666]">Email Address *</Label>
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="border-[#ececec] text-[13px] focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold uppercase text-[#666]">Password *</Label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    minLength={8}
                    required
                    placeholder="At least 8 characters"
                    className="border-[#ececec] pr-10 text-[13px] focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-[#555]"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded border border-[#f79090] bg-[#ffe9e1] px-4 py-3 text-[13px] text-destructive">
                  {error}
                </div>
              )}

              <p className="text-[11px] text-[#bbb]">
                By registering, you agree to our{" "}
                <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary py-3 text-[13px] font-bold text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {loading ? "Creating Account…" : "Create Account"}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#ececec]" />
              <span className="text-[11px] text-[#bbb] uppercase">or sign up with</span>
              <div className="h-px flex-1 bg-[#ececec]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => signIn("google")}
                className="flex items-center justify-center gap-2 border border-[#ececec] py-2.5 text-[12px] font-semibold text-[#555] hover:border-primary hover:text-primary transition-colors"
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => signIn("facebook")}
                className="flex items-center justify-center gap-2 border border-[#ececec] py-2.5 text-[12px] font-semibold text-[#555] hover:border-primary hover:text-primary transition-colors"
              >
                Facebook
              </button>
            </div>

            <p className="mt-6 text-center text-[13px] text-[#999]">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
