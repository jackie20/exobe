import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, handleApiError } from "@/lib/api-response";
import { requireVendor } from "@/lib/auth-helpers";
import { orderItemStatusUpdateSchema } from "@/lib/validations/order-status";
import { getVendorStore } from "@/lib/vendor";
import { logAudit } from "@/lib/audit";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderItemId: string }> }
) {
  try {
    const { session, error } = await requireVendor();
    if (error) return error;

    const store = await getVendorStore(session.user.id);
    if (!store) return apiError("Vendor store not found", 404);

    const { orderItemId } = await params;
    const body = orderItemStatusUpdateSchema.parse(await request.json());

    const item = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: { product: { select: { storeId: true } } },
    });
    if (!item || item.product.storeId !== store.id) return apiError("Order item not found", 404);

    const updated = await prisma.$transaction([
      prisma.orderItem.update({
        where: { id: orderItemId },
        data: {
          status: body.status,
          ...(body.courierName !== undefined && { courierName: body.courierName }),
          ...(body.trackingNumber !== undefined && { trackingNumber: body.trackingNumber }),
          ...(body.estimatedDeliveryDate !== undefined && { estimatedDeliveryDate: body.estimatedDeliveryDate }),
          ...(body.status === "SHIPPED" && { shippedAt: new Date() }),
          ...(body.status === "DELIVERED" && { deliveredAt: new Date() }),
        },
      }),
      prisma.orderStatusHistory.create({
        data: {
          orderId: item.orderId,
          orderItemId,
          status: body.status,
          note: `Vendor updated fulfillment to ${body.status}`,
        },
      }),
    ]);

    await logAudit({
      actorType: "VENDOR",
      actorId: session.user.id,
      action: "order_item.status_updated",
      targetType: "OrderItem",
      targetId: orderItemId,
      metadata: { status: body.status },
    });

    return NextResponse.json({ data: updated[0] });
  } catch (err) {
    return handleApiError(err);
  }
}
