import type { PaymentProvider } from "@/generated/prisma/client";

export type PaymentInitContext = {
  order: { id: string; orderNumber: string; total: number; currency: string };
  customer: { name: string; email: string };
  successUrl: string;
  cancelUrl: string;
};

// Different gateways hand the customer off differently — a redirect URL
// (Stripe, Yoco), an auto-submitted form POST (PayFast requires this), or
// no online step at all (manual EFT, pending admin verification).
export type PaymentInitResult =
  | { kind: "redirect"; url: string; providerReference?: string }
  | { kind: "form_post"; actionUrl: string; fields: Record<string, string>; providerReference?: string }
  | { kind: "manual"; instructions: string; providerReference?: string };

export interface PaymentGateway {
  provider: PaymentProvider;
  isConfigured(): boolean;
  initiate(context: PaymentInitContext): Promise<PaymentInitResult>;
}
