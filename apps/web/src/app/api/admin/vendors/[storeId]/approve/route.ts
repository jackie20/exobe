import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-helpers";
import { logAudit } from "@/lib/audit";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;

    const { storeId } = await params;
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return apiError("Store not found", 404);
    if (store.status === "APPROVED") return apiError("Store is already approved", 409);

    const [updatedStore] = await prisma.$transaction([
      prisma.store.update({
        where: { id: storeId },
        data: { status: "APPROVED", approvedAt: new Date(), approvedBy: session.user.id, rejectionReason: null },
      }),
      prisma.customer.update({ where: { id: store.customerId }, data: { isVendor: true } }),
      prisma.vendorWallet.upsert({
        where: { storeId },
        update: {},
        create: { storeId },
      }),
    ]);

    await logAudit({
      actorType: "ADMIN",
      actorId: session.user.id,
      action: "vendor.approved",
      targetType: "Store",
      targetId: storeId,
    });

    return NextResponse.json({ data: updatedStore });
  } catch (err) {
    return handleApiError(err);
  }
}
