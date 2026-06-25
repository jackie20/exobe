import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-helpers";
import { checkProductForApproval } from "@/lib/moderation";
import { logAudit } from "@/lib/audit";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;

    const { productId } = await params;
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return apiError("Product not found", 404);

    const check = await checkProductForApproval(product);
    if (!check.ok) {
      return apiError("Product failed automated checks and cannot be approved", 422, { issues: check.issues });
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { status: "PUBLISHED", reviewedAt: new Date(), reviewedBy: session.user.id, rejectionReason: null },
    });

    await logAudit({
      actorType: "ADMIN",
      actorId: session.user.id,
      action: "product.approved",
      targetType: "Product",
      targetId: productId,
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
