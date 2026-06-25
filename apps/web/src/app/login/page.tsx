"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ChevronRight, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CONTAINER } from "@/lib/layout";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    try {
      const result = await signIn("credentials", {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        redirect: false,
      });

      if (!result || result.error) {
        setError("Invalid email or password. Please try again.");
        return;
      }
      const callback = searchParams.get("callbackUrl") ?? "/account";
      router.push(callback);
      router.refresh();
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
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
          <span className="text-[#333]">Login</span>
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

            <h1 className="text-center text-[22px] font-bold text-[#333]">Sign In</h1>
            <p className="mt-1 text-center text-[13px] text-[#999]">Welcome back to Exobe Africa</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label className="text-[12px] font-semibold uppercase text-[#666]">Password *</Label>
                  <Link href="/forgot-password" className="text-[11px] text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary py-3 text-[13px] font-bold text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#ececec]" />
              <span className="text-[11px] text-[#bbb] uppercase">or continue with</span>
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
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Register now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
