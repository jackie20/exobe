import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";
import { confirmOrderPayment, failOrderPayment } from "@/lib/orders";

// Yoco signs webhooks using the Svix scheme: headers `webhook-id`,
// `webhook-timestamp`, `webhook-signature`; signature = base64(HMAC-SHA256(
// base64Decode(secret), `${id}.${timestamp}.${body}`)), prefixed "v1,".
function verifySignature(rawBody: string, headers: Headers, secret: string) {
  const id = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signatureHeader = headers.get("webhook-signature");
  if (!id || !timestamp || !signatureHeader) return false;

  const signedContent = `${id}.${timestamp}.${rawBody}`;
  const secretBytes = Buffer.from(secret.split("_").pop() ?? secret, "base64");
  const expected = crypto.createHmac("sha256", secretBytes).update(signedContent).digest("base64");

  return signatureHeader.split(" ").some((sig) => sig.split(",")[1] === expected);
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const webhookSecret = process.env.YOCO_WEBHOOK_SECRET;

  if (webhookSecret) {
    if (!verifySignature(rawBody, request.headers, webhookSecret)) {
      return apiError("Invalid signature", 400);
    }
  } else {
    console.warn("YOCO_WEBHOOK_SECRET is not set — accepting webhook without signature verification");
  }

  const event = JSON.parse(rawBody) as {
    type: string;
    payload: { id: string; metadata?: { orderId?: string } };
  };

  const orderId = event.payload.metadata?.orderId;
  if (orderId) {
    if (event.type === "payment.succeeded") {
      await confirmOrderPayment(orderId, "YOCO", event.payload.id);
    } else if (event.type === "payment.failed") {
      await failOrderPayment(orderId, "YOCO");
    }
  }

  return NextResponse.json({ received: true });
}
