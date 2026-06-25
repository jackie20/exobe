import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-helpers";
import { vendorRejectionSchema } from "@/lib/validations/vendor";
import { logAudit } from "@/lib/audit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;

    const { productId } = await params;
    const body = vendorRejectionSchema.parse(await request.json());

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return apiError("Product not found", 404);

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { status: "REJECTED", rejectionReason: body.reason, reviewedAt: new Date(), reviewedBy: session.user.id },
    });

    await logAudit({
      actorType: "ADMIN",
      actorId: session.user.id,
      action: "product.rejected",
      targetType: "Product",
      targetId: productId,
      metadata: { reason: body.reason },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
