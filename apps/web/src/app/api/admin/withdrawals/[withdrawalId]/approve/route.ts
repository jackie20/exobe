import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-helpers";
import { logAudit } from "@/lib/audit";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ withdrawalId: string }> }
) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;

    const { withdrawalId } = await params;
    const withdrawal = await prisma.withdrawal.findUnique({ where: { id: withdrawalId } });
    if (!withdrawal) return apiError("Withdrawal not found", 404);
    if (withdrawal.status !== "PENDING") return apiError("Only pending withdrawals can be approved", 409);

    const updated = await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: "APPROVED", reviewedBy: session.user.id, reviewedAt: new Date() },
    });

    await logAudit({
      actorType: "ADMIN",
      actorId: session.user.id,
      action: "withdrawal.approved",
      targetType: "Withdrawal",
      targetId: withdrawalId,
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
