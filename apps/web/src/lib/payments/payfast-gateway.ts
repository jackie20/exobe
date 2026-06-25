import crypto from "node:crypto";
import type { PaymentGateway, PaymentInitContext, PaymentInitResult } from "@/lib/payments/types";

// PayFast wants PHP-style urlencode (space as "+"), not encodeURIComponent's "%20".
function pfEncode(value: string) {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

function buildSignature(fields: Record<string, string>, passphrase?: string) {
  let pairs = Object.entries(fields)
    .filter(([, value]) => value !== "")
    .map(([key, value]) => `${key}=${pfEncode(value)}`)
    .join("&");

  if (passphrase) pairs += `&passphrase=${pfEncode(passphrase)}`;

  return crypto.createHash("md5").update(pairs).digest("hex");
}

export const payfastGateway: PaymentGateway = {
  provider: "PAYFAST",

  isConfigured() {
    return Boolean(process.env.PAYFAST_MERCHANT_ID && process.env.PAYFAST_MERCHANT_KEY);
  },

  async initiate({ order, customer, successUrl, cancelUrl }: PaymentInitContext): Promise<PaymentInitResult> {
    if (!this.isConfigured()) throw new Error("PayFast is not configured");

    const [firstName, ...rest] = customer.name.split(" ");

    const fields: Record<string, string> = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID!,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY!,
      return_url: successUrl,
      cancel_url: cancelUrl,
      notify_url: `${process.env.NEXTAUTH_URL}/api/webhooks/payfast`,
      name_first: firstName,
      name_last: rest.join(" ") || firstName,
      email_address: customer.email,
      m_payment_id: order.orderNumber,
      amount: order.total.toFixed(2),
      item_name: `Exobe Africa order ${order.orderNumber}`,
    };

    const signature = buildSignature(fields, process.env.PAYFAST_PASSPHRASE);
    const actionUrl =
      process.env.PAYFAST_MODE === "live"
        ? "https://www.payfast.co.za/eng/process"
        : "https://sandbox.payfast.co.za/eng/process";

    return { kind: "form_post", actionUrl, fields: { ...fields, signature }, providerReference: order.orderNumber };
  },
};
