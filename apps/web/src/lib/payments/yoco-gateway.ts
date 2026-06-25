import type { PaymentGateway, PaymentInitContext, PaymentInitResult } from "@/lib/payments/types";

export const yocoGateway: PaymentGateway = {
  provider: "YOCO",

  isConfigured() {
    return Boolean(process.env.YOCO_SECRET_KEY);
  },

  async initiate({ order, successUrl, cancelUrl }: PaymentInitContext): Promise<PaymentInitResult> {
    if (!this.isConfigured()) throw new Error("Yoco is not configured");

    const response = await fetch("https://payments.yoco.com/api/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.YOCO_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(order.total * 100),
        currency: order.currency,
        successUrl,
        cancelUrl,
        failureUrl: cancelUrl,
        metadata: { orderId: order.id },
      }),
    });

    if (!response.ok) {
      throw new Error(`Yoco checkout creation failed: ${response.status} ${await response.text()}`);
    }

    const data = (await response.json()) as { id: string; redirectUrl: string };
    return { kind: "redirect", url: data.redirectUrl, providerReference: data.id };
  },
};
