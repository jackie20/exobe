import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { apiError } from "@/lib/api-response";
import { confirmOrderPayment } from "@/lib/orders";

export async function POST(request: NextRequest) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return apiError("Stripe is not configured", 500);
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return apiError("Missing signature", 400);

  const payload = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return apiError("Invalid signature", 400);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { metadata?: { orderId?: string }; payment_intent?: string };
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await confirmOrderPayment(orderId, "STRIPE", String(session.payment_intent ?? ""));
    }
  }

  return NextResponse.json({ received: true });
}
