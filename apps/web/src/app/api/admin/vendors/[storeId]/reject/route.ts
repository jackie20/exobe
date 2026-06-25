import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-helpers";
import { vendorRejectionSchema } from "@/lib/validations/vendor";
import { logAudit } from "@/lib/audit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;

    const { storeId } = await params;
    const body = vendorRejectionSchema.parse(await request.json());

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return apiError("Store not found", 404);

    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: { status: "REJECTED", rejectionReason: body.reason },
    });

    await logAudit({
      actorType: "ADMIN",
      actorId: session.user.id,
      action: "vendor.rejected",
      targetType: "Store",
      targetId: storeId,
      metadata: { reason: body.reason },
    });

    return NextResponse.json({ data: updatedStore });
  } catch (err) {
    return handleApiError(err);
  }
}
