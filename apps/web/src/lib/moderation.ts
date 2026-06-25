import { prisma } from "@/lib/prisma";

const MIN_DESCRIPTION_LENGTH = 20;

export async function checkProductForApproval(product: {
  id: string;
  name: string;
  description: string | null;
  storeId: string | null;
  basePrice: unknown;
}) {
  const issues: string[] = [];

  const images = await prisma.productImage.count({ where: { productId: product.id } });
  if (images === 0) issues.push("Missing product images");

  if (!product.description || product.description.trim().length < MIN_DESCRIPTION_LENGTH) {
    issues.push("Description is missing or too short");
  }

  if (Number(product.basePrice) <= 0) issues.push("Price must be greater than zero");

  if (product.storeId) {
    const duplicate = await prisma.product.findFirst({
      where: {
        storeId: product.storeId,
        name: product.name,
        id: { not: product.id },
        status: { in: ["PUBLISHED", "PENDING_REVIEW"] },
      },
    });
    if (duplicate) issues.push(`Possible duplicate of an existing listing ("${duplicate.name}")`);
  }

  return { ok: issues.length === 0, issues };
}
