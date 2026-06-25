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
    if (withdrawal.status !== "APPROVED") return apiError("Only approved withdrawals can be marked as paid", 409);

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: { status: "PAID", paidAt: new Date() },
      });

      await tx.vendorWallet.update({
        where: { storeId: withdrawal.storeId },
        data: { withdrawnBalance: { increment: withdrawal.amount } },
      });

      return result;
    });

    await logAudit({
      actorType: "ADMIN",
      actorId: session.user.id,
      action: "withdrawal.paid",
      targetType: "Withdrawal",
      targetId: withdrawalId,
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
