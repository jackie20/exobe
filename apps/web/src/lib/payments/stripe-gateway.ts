import { stripe } from "@/lib/stripe";
import type { PaymentGateway, PaymentInitContext, PaymentInitResult } from "@/lib/payments/types";

export const stripeGateway: PaymentGateway = {
  provider: "STRIPE",

  isConfigured() {
    return Boolean(stripe);
  },

  async initiate({ order, successUrl, cancelUrl }: PaymentInitContext): Promise<PaymentInitResult> {
    if (!stripe) throw new Error("Stripe is not configured");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: order.currency.toLowerCase(),
            unit_amount: Math.round(order.total * 100),
            product_data: { name: `Exobe Africa order ${order.orderNumber}` },
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { orderId: order.id },
    });

    return { kind: "redirect", url: session.url!, providerReference: session.id };
  },
};
