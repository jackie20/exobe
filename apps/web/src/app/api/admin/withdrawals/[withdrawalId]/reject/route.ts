import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-helpers";
import { vendorRejectionSchema } from "@/lib/validations/vendor";
import { logAudit } from "@/lib/audit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ withdrawalId: string }> }
) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;

    const { withdrawalId } = await params;
    const body = vendorRejectionSchema.parse(await request.json());

    const withdrawal = await prisma.withdrawal.findUnique({ where: { id: withdrawalId } });
    if (!withdrawal) return apiError("Withdrawal not found", 404);
    if (withdrawal.status !== "PENDING") return apiError("Only pending withdrawals can be rejected", 409);

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: "REJECTED",
          rejectionReason: body.reason,
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
        },
      });

      // Refund the held amount back to the vendor's available balance.
      const wallet = await tx.vendorWallet.update({
        where: { storeId: withdrawal.storeId },
        data: { availableBalance: { increment: withdrawal.amount } },
      });

      await tx.walletTransaction.create({
        data: {
          storeId: withdrawal.storeId,
          type: "ADJUSTMENT",
          amount: withdrawal.amount,
          balanceAfter: wallet.availableBalance,
          withdrawalId,
          description: `Withdrawal rejected: ${body.reason}`,
        },
      });

      return result;
    });

    await logAudit({
      actorType: "ADMIN",
      actorId: session.user.id,
      action: "withdrawal.rejected",
      targetType: "Withdrawal",
      targetId: withdrawalId,
      metadata: { reason: body.reason },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
