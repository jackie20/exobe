import type { Prisma } from "@/generated/prisma/client";

export class InsufficientStockError extends Error {
  constructor(public productName: string) {
    super(`${productName} is out of stock`);
  }
}

type StockCheckItem = { productId: string; variantId?: string | null; quantity: number; productName: string };

// Re-checks live stock right before placing the order (cart rows can go stale
// between add-to-cart and checkout) and decrements it as part of the same
// transaction that creates the order, so two concurrent checkouts can't both
// succeed against the last unit.
export async function decrementStockOrThrow(tx: Prisma.TransactionClient, items: StockCheckItem[]) {
  for (const item of items) {
    if (item.variantId) {
      const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
      if (!variant || variant.stockQuantity < item.quantity) {
        throw new InsufficientStockError(item.productName);
      }
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stockQuantity: { decrement: item.quantity } },
      });
      continue;
    }

    const product = await tx.product.findUnique({ where: { id: item.productId } });
    if (!product) throw new InsufficientStockError(item.productName);
    if (!product.allowBackorder && product.stockQuantity < item.quantity) {
      throw new InsufficientStockError(item.productName);
    }
    await tx.product.update({
      where: { id: item.productId },
      data: { stockQuantity: { decrement: item.quantity } },
    });
  }
}
