import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-helpers";
import { confirmOrderPayment } from "@/lib/orders";
import { logAudit } from "@/lib/audit";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;

    const { orderId } = await params;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: { where: { provider: "MANUAL_EFT" } } },
    });
    if (!order) return apiError("Order not found", 404);
    if (order.payments.length === 0) return apiError("This order has no manual EFT payment to confirm", 400);
    if (order.paymentStatus === "PAID") return apiError("Order is already paid", 409);

    await confirmOrderPayment(orderId, "MANUAL_EFT");

    await logAudit({
      actorType: "ADMIN",
      actorId: session.user.id,
      action: "order.manual_payment_confirmed",
      targetType: "Order",
      targetId: orderId,
    });

    const updated = await prisma.order.findUnique({ where: { id: orderId } });
    return NextResponse.json({ data: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
