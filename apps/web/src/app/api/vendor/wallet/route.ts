import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, handleApiError } from "@/lib/api-response";
import { requireVendor } from "@/lib/auth-helpers";
import { getVendorStore } from "@/lib/vendor";

export async function GET() {
  try {
    const { session, error } = await requireVendor();
    if (error) return error;

    const store = await getVendorStore(session.user.id);
    if (!store) return apiError("Vendor store not found", 404);

    const wallet = await prisma.vendorWallet.findUnique({ where: { storeId: store.id } });
    const transactions = await prisma.walletTransaction.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ data: { wallet, transactions } });
  } catch (err) {
    return handleApiError(err);
  }
}
