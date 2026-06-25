type Numeric = number | string | { toString(): string };

type PriceFields = {
  basePrice: Numeric;
  salePrice: Numeric | null;
  saleStartsAt: Date | null;
  saleEndsAt: Date | null;
};

export function effectivePrice(product: PriceFields, now = new Date()) {
  const base = Number(product.basePrice);
  if (product.salePrice == null) return { price: base, isOnSale: false };

  const startsOk = !product.saleStartsAt || product.saleStartsAt <= now;
  const endsOk = !product.saleEndsAt || product.saleEndsAt >= now;
  if (startsOk && endsOk) {
    return { price: Number(product.salePrice), isOnSale: true };
  }
  return { price: base, isOnSale: false };
}
