import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, handleApiError } from "@/lib/api-response";
import { requireVendor } from "@/lib/auth-helpers";
import { withdrawalRequestSchema } from "@/lib/validations/withdrawal";
import { getVendorStore } from "@/lib/vendor";
import { MIN_WITHDRAWAL_AMOUNT } from "@/lib/commission";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    const { session, error } = await requireVendor();
    if (error) return error;

    const store = await getVendorStore(session.user.id);
    if (!store) return apiError("Vendor store not found", 404);

    const withdrawals = await prisma.withdrawal.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: withdrawals });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireVendor();
    if (error) return error;

    const store = await getVendorStore(session.user.id);
    if (!store) return apiError("Vendor store not found", 404);
    if (store.status !== "APPROVED") return apiError("Your store is not approved yet", 403);

    const body = withdrawalRequestSchema.parse(await request.json());
    if (body.amount < MIN_WITHDRAWAL_AMOUNT) {
      return apiError(`Minimum withdrawal amount is ${MIN_WITHDRAWAL_AMOUNT}`, 400);
    }

    const wallet = await prisma.vendorWallet.findUnique({ where: { storeId: store.id } });
    if (!wallet || Number(wallet.availableBalance) < body.amount) {
      return apiError("Insufficient available balance", 400);
    }

    const withdrawal = await prisma.$transaction(async (tx) => {
      const created = await tx.withdrawal.create({
        data: { storeId: store.id, amount: body.amount, paymentChannel: body.paymentChannel },
      });

      const updatedWallet = await tx.vendorWallet.update({
        where: { storeId: store.id },
        data: { availableBalance: { decrement: body.amount } },
      });

      await tx.walletTransaction.create({
        data: {
          storeId: store.id,
          type: "WITHDRAWAL",
          amount: -body.amount,
          balanceAfter: updatedWallet.availableBalance,
          withdrawalId: created.id,
          description: "Withdrawal requested",
        },
      });

      return created;
    });

    await logAudit({
      actorType: "VENDOR",
      actorId: session.user.id,
      action: "withdrawal.requested",
      targetType: "Withdrawal",
      targetId: withdrawal.id,
      metadata: { amount: body.amount },
    });

    return NextResponse.json({ data: withdrawal }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
