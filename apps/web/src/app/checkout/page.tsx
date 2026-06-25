"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ChevronRight, ShieldCheck, Plus } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { apiFetch, ApiError } from "@/lib/api/client";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CONTAINER } from "@/lib/layout";
import type { PaymentInitResult } from "@/lib/payments/types";

type Address = {
  id: string;
  fullName: string;
  phone: string | null;
  line1: string;
  city: string;
  country: string;
};

type ShippingMethod = {
  id: string;
  name: string;
  description: string | null;
  rates: { country: string; price: number }[];
};

const PAYMENT_OPTIONS: { value: "STRIPE" | "PAYFAST" | "YOCO" | "MANUAL_EFT"; label: string; desc: string }[] = [
  { value: "STRIPE", label: "Credit / Debit Card", desc: "Powered by Stripe — Visa, Mastercard, Amex" },
  { value: "PAYFAST", label: "PayFast", desc: "South Africa's leading payment gateway" },
  { value: "YOCO", label: "Yoco", desc: "Fast card payments for South Africa" },
  { value: "MANUAL_EFT", label: "Manual EFT", desc: "Pay via direct bank transfer" },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 border-b border-[#ececec] pb-3 text-[14px] font-bold uppercase tracking-wide text-[#333]">
      {children}
    </h2>
  );
}

export default function CheckoutPage() {
  const { data: cartData } = useCart();
  const cart = cartData?.data;
  const formPostRef = useRef<HTMLFormElement>(null);

  const { data: addressesData, refetch: refetchAddresses } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => apiFetch<{ data: Address[] }>("/api/addresses"),
  });
  const { data: methodsData } = useQuery({
    queryKey: ["shipping-methods"],
    queryFn: () => apiFetch<{ data: ShippingMethod[] }>("/api/shipping-methods"),
  });

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [selectedMethodId, setSelectedMethodId] = useState<string>("");
  const [paymentProvider, setPaymentProvider] = useState<typeof PAYMENT_OPTIONS[number]["value"]>("STRIPE");
  const [couponCode, setCouponCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [formPost, setFormPost] = useState<{ actionUrl: string; fields: Record<string, string> } | null>(null);

  useEffect(() => {
    if (formPost) formPostRef.current?.submit();
  }, [formPost]);

  const createAddress = useMutation({
    mutationFn: (input: Record<string, string>) =>
      apiFetch<{ data: Address }>("/api/addresses", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: async (response) => {
      await refetchAddresses();
      setSelectedAddressId(response.data.id);
      setShowNewAddress(false);
    },
  });

  const placeOrder = useMutation({
    mutationFn: () =>
      apiFetch<{ data: { orderNumber: string; payment: PaymentInitResult } }>("/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          shippingAddressId: selectedAddressId,
          shippingMethodId: selectedMethodId,
          couponCode: couponCode || undefined,
          paymentProvider,
        }),
      }),
    onSuccess: (response) => {
      const { payment, orderNumber } = response.data;
      if (payment.kind === "redirect") {
        window.location.href = payment.url;
      } else if (payment.kind === "form_post") {
        setFormPost({ actionUrl: payment.actionUrl, fields: payment.fields });
      } else {
        window.location.href = `/checkout/success?order=${orderNumber}&manual=1`;
      }
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Checkout failed."),
  });

  function handleNewAddress(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    createAddress.mutate({
      fullName: String(formData.get("fullName")),
      phone: String(formData.get("phone")),
      line1: String(formData.get("line1")),
      city: String(formData.get("city")),
      country: String(formData.get("country")),
    });
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <p className="text-[15px] text-[#999]">Your cart is empty.</p>
        <Link href="/products" className="text-primary hover:underline">Continue shopping →</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f7f7] min-h-screen">
      {/* PayFast form */}
      {formPost && (
        <form ref={formPostRef} action={formPost.actionUrl} method="POST" className="hidden">
          {Object.entries(formPost.fields).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
        </form>
      )}

      {/* Breadcrumb */}
      <div className="border-b border-[#ececec] bg-white">
        <div className={`${CONTAINER} flex items-center gap-1.5 py-3 text-[12px] text-[#999]`}>
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="size-3" />
          <Link href="/cart" className="hover:text-primary">Cart</Link>
          <ChevronRight className="size-3" />
          <span className="text-[#333]">Checkout</span>
        </div>
      </div>

      <div className={`${CONTAINER} py-8`}>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

          {/* Left: Checkout form */}
          <div className="space-y-5">

            {/* Shipping address */}
            <div className="rounded bg-white p-6">
              <SectionTitle>Shipping Address</SectionTitle>
              <div className="space-y-3">
                {addressesData?.data.map((address) => (
                  <label
                    key={address.id}
                    className={`flex cursor-pointer items-start gap-3 rounded border p-3 transition-colors ${
                      selectedAddressId === address.id ? "border-primary bg-[#fef5f5]" : "border-[#ececec] hover:border-[#c9c9c9]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                      className="mt-0.5 accent-primary"
                    />
                    <div className="text-[13px]">
                      <p className="font-semibold text-[#333]">{address.fullName}</p>
                      <p className="text-[#666]">{address.line1}, {address.city}</p>
                      <p className="text-[#666]">{address.country}{address.phone ? ` · ${address.phone}` : ""}</p>
                    </div>
                  </label>
                ))}

                <button
                  type="button"
                  onClick={() => setShowNewAddress((v) => !v)}
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  <Plus className="size-4" />
                  {showNewAddress ? "Cancel" : "Add new address"}
                </button>
              </div>

              {showNewAddress && (
                <form onSubmit={handleNewAddress} className="mt-5 grid gap-4 border-t border-[#ececec] pt-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold uppercase text-[#666]">Full Name *</Label>
                    <Input name="fullName" required className="border-[#ececec] text-[13px] focus:border-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold uppercase text-[#666]">Phone *</Label>
                    <Input name="phone" required className="border-[#ececec] text-[13px] focus:border-primary" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-[12px] font-semibold uppercase text-[#666]">Address Line *</Label>
                    <Input name="line1" required className="border-[#ececec] text-[13px] focus:border-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold uppercase text-[#666]">City *</Label>
                    <Input name="city" required className="border-[#ececec] text-[13px] focus:border-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold uppercase text-[#666]">Country (2-letter) *</Label>
                    <Input name="country" maxLength={2} placeholder="ZA" required className="border-[#ececec] text-[13px] focus:border-primary uppercase" />
                  </div>
                  <Button
                    type="submit"
                    disabled={createAddress.isPending}
                    className="sm:col-span-2 bg-[#1a1a1a] text-white hover:bg-primary transition-colors"
                  >
                    {createAddress.isPending ? "Saving…" : "Save Address"}
                  </Button>
                </form>
              )}
            </div>

            {/* Shipping method */}
            <div className="rounded bg-white p-6">
              <SectionTitle>Shipping Method</SectionTitle>
              <div className="space-y-3">
                {methodsData?.data.map((method) => (
                  <label
                    key={method.id}
                    className={`flex cursor-pointer items-start gap-3 rounded border p-3 transition-colors ${
                      selectedMethodId === method.id ? "border-primary bg-[#fef5f5]" : "border-[#ececec] hover:border-[#c9c9c9]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={selectedMethodId === method.id}
                      onChange={() => setSelectedMethodId(method.id)}
                      className="mt-0.5 accent-primary"
                    />
                    <div className="text-[13px]">
                      <p className="font-semibold text-[#333]">{method.name}</p>
                      {method.description && <p className="text-[#666]">{method.description}</p>}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment method */}
            <div className="rounded bg-white p-6">
              <SectionTitle>Payment Method</SectionTitle>
              <div className="space-y-3">
                {PAYMENT_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-start gap-3 rounded border p-3 transition-colors ${
                      paymentProvider === option.value ? "border-primary bg-[#fef5f5]" : "border-[#ececec] hover:border-[#c9c9c9]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentProvider"
                      checked={paymentProvider === option.value}
                      onChange={() => setPaymentProvider(option.value)}
                      className="mt-0.5 accent-primary"
                    />
                    <div className="text-[13px]">
                      <p className="font-semibold text-[#333]">{option.label}</p>
                      <p className="text-[#999]">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Coupon */}
            <div className="rounded bg-white p-6">
              <SectionTitle>Coupon Code</SectionTitle>
              <div className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="border-[#ececec] text-[13px]"
                />
                <button
                  type="button"
                  className="shrink-0 bg-[#1a1a1a] px-5 text-[12px] font-bold text-white hover:bg-primary transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="h-fit">
            <div className="rounded bg-white">
              <div className="border-b border-[#ececec] px-5 py-4">
                <h2 className="text-[15px] font-bold text-[#333]">Your Order</h2>
              </div>

              {/* Items */}
              <div className="divide-y divide-[#f5f5f5] px-5">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 py-3">
                    {item.product.image && (
                      <div className="relative size-12 shrink-0 overflow-hidden border border-[#ececec] bg-[#f5f5f5]">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="line-clamp-2 text-[12px] text-[#555]">{item.product.name}</p>
                      <p className="text-[11px] text-[#999]">Qty: {item.quantity}</p>
                    </div>
                    <span className="shrink-0 text-[13px] font-semibold text-[#333]">
                      {formatMoney(item.lineTotal, cart.currency)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-[#ececec] px-5 py-4">
                <div className="flex justify-between py-1.5 text-[13px]">
                  <span className="text-[#999]">Subtotal</span>
                  <span className="text-[#333]">{formatMoney(cart.subtotal, cart.currency)}</span>
                </div>
                <div className="flex justify-between py-1.5 text-[13px]">
                  <span className="text-[#999]">Shipping</span>
                  <span className="text-[#555]">Calculated above</span>
                </div>
                {couponCode && (
                  <div className="flex justify-between py-1.5 text-[13px]">
                    <span className="text-[#999]">Coupon</span>
                    <span className="text-success font-medium">{couponCode}</span>
                  </div>
                )}
                <div className="mt-2 flex justify-between border-t-2 border-[#1a1a1a] pt-3 text-[15px] font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatMoney(cart.subtotal, cart.currency)}</span>
                </div>
              </div>

              {error && (
                <div className="mx-5 mb-4 rounded border border-[#f79090] bg-[#ffe9e1] px-4 py-3 text-[13px] text-destructive">
                  {error}
                </div>
              )}

              <div className="px-5 pb-5">
                <button
                  disabled={!selectedAddressId || !selectedMethodId || placeOrder.isPending}
                  onClick={() => placeOrder.mutate()}
                  className="flex w-full items-center justify-center gap-2 bg-primary py-3.5 text-[13px] font-bold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ShieldCheck className="size-4" />
                  {placeOrder.isPending ? "Placing Order…" : "Place Order"}
                </button>
                <p className="mt-3 text-center text-[11px] text-[#bbb]">
                  Your payment is secured by SSL encryption
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
