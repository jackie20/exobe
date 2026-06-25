import type { PaymentProvider } from "@/generated/prisma/client";
import type { PaymentGateway } from "@/lib/payments/types";
import { stripeGateway } from "@/lib/payments/stripe-gateway";
import { payfastGateway } from "@/lib/payments/payfast-gateway";
import { yocoGateway } from "@/lib/payments/yoco-gateway";
import { manualEftGateway } from "@/lib/payments/manual-eft-gateway";

const GATEWAYS: Record<PaymentProvider, PaymentGateway> = {
  STRIPE: stripeGateway,
  PAYFAST: payfastGateway,
  YOCO: yocoGateway,
  MANUAL_EFT: manualEftGateway,
};

export function getPaymentGateway(provider: PaymentProvider): PaymentGateway {
  return GATEWAYS[provider];
}

export type { PaymentInitContext, PaymentInitResult } from "@/lib/payments/types";
