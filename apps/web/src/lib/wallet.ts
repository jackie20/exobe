import { prisma } from "@/lib/prisma";
import { PLATFORM_COMMISSION_RATE } from "@/lib/commission";

// Credits each vendor's wallet for their share of a paid order. Platform-owned
// products (storeId === null) are skipped — there's no vendor to pay out.
//
// Funds land directly in `availableBalance` for now. Once the full
// shipping/delivery state machine exists (see Order.status expansion), this
// should credit `pendingBalance` on payment and move to `availableBalance`
// only once the order reaches a final "delivered" state.
export async function creditStoresForOrder(orderId: string) {
  const items = await prisma.orderItem.findMany({
    where: { orderId },
    include: { product: { select: { storeId: true } } },
  });

  const byStore = new Map<string, number>();
  for (const item of items) {
    const storeId = item.product.storeId;
    if (!storeId) continue;
    byStore.set(storeId, (byStore.get(storeId) ?? 0) + Number(item.lineTotal));
  }

  for (const [storeId, gross] of byStore) {
    const commission = gross * PLATFORM_COMMISSION_RATE;
    const net = gross - commission;

    await prisma.$transaction(async (tx) => {
      const wallet = await tx.vendorWallet.upsert({
        where: { storeId },
        update: {
          grossRevenue: { increment: gross },
          platformCommission: { increment: commission },
          netEarnings: { increment: net },
          availableBalance: { increment: net },
        },
        create: {
          storeId,
          grossRevenue: gross,
          platformCommission: commission,
          netEarnings: net,
          availableBalance: net,
        },
      });

      await tx.walletTransaction.create({
        data: {
          storeId,
          type: "SALE",
          amount: net,
          balanceAfter: wallet.availableBalance,
          orderId,
          description: `Net earnings from order`,
        },
      });
    });
  }
}
