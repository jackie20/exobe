import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-helpers";
import { orderStatusUpdateSchema } from "@/lib/validations/order-status";
import { logAudit } from "@/lib/audit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;

    const { orderId } = await params;
    const body = orderStatusUpdateSchema.parse(await request.json());

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return apiError("Order not found", 404);

    const updated = await prisma.$transaction([
      prisma.order.update({ where: { id: orderId }, data: { status: body.status } }),
      prisma.orderStatusHistory.create({
        data: {
          orderId,
          status: body.status,
          note: body.note ?? `Status updated to ${body.status} by admin`,
        },
      }),
    ]);

    await logAudit({
      actorType: "ADMIN",
      actorId: session.user.id,
      action: "order.status_overridden",
      targetType: "Order",
      targetId: orderId,
      metadata: { from: order.status, to: body.status },
    });

    return NextResponse.json({ data: updated[0] });
  } catch (err) {
    return handleApiError(err);
  }
}
