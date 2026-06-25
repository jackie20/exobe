import { prisma } from "@/lib/prisma";
import { creditStoresForOrder } from "@/lib/wallet";
import type { PaymentProvider } from "@/generated/prisma/client";

export async function confirmOrderPayment(orderId: string, provider: PaymentProvider, providerReference?: string) {
  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: "PAYMENT_CONFIRMED", paymentStatus: "PAID" },
    }),
    prisma.orderStatusHistory.create({
      data: { orderId, status: "PAYMENT_CONFIRMED", note: `Payment confirmed via ${provider}` },
    }),
    prisma.orderItem.updateMany({ where: { orderId }, data: { status: "PAYMENT_CONFIRMED" } }),
    prisma.payment.updateMany({
      where: { orderId, provider },
      data: { status: "SUCCESS", ...(providerReference && { providerReference }) },
    }),
  ]);

  // See lib/wallet.ts — credits the vendor's available balance immediately on
  // payment confirmation rather than waiting for delivery, a scope simplification.
  await creditStoresForOrder(orderId);
}

export async function failOrderPayment(orderId: string, provider: PaymentProvider) {
  await prisma.payment.updateMany({ where: { orderId, provider }, data: { status: "FAILED" } });
}
