import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-response";
import { confirmOrderPayment, failOrderPayment } from "@/lib/orders";

function pfEncode(value: string) {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

function verifySignature(fields: Record<string, string>, passphrase?: string) {
  const { signature, ...rest } = fields;
  let pairs = Object.entries(rest)
    .filter(([, value]) => value !== "")
    .map(([key, value]) => `${key}=${pfEncode(value)}`)
    .join("&");

  if (passphrase) pairs += `&passphrase=${pfEncode(passphrase)}`;

  const expected = crypto.createHash("md5").update(pairs).digest("hex");
  return expected === signature;
}

// PayFast's Instant Transaction Notification — form-encoded POST, not JSON.
// Production should also re-validate the payload against PayFast's server
// (https://www.payfast.co.za/eng/query/validate) and check the source IP is
// in PayFast's published range; both are skipped here for the sandbox flow.
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const fields: Record<string, string> = {};
  formData.forEach((value, key) => {
    fields[key] = String(value);
  });

  if (!verifySignature(fields, process.env.PAYFAST_PASSPHRASE)) {
    return apiError("Invalid signature", 400);
  }

  const orderNumber = fields.m_payment_id;
  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order) return apiError("Order not found", 404);

  if (fields.payment_status === "COMPLETE") {
    await confirmOrderPayment(order.id, "PAYFAST", fields.pf_payment_id);
  } else {
    await failOrderPayment(order.id, "PAYFAST");
  }

  return NextResponse.json({ received: true });
}
