import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, handleApiError } from "@/lib/api-response";
import { requireVendor } from "@/lib/auth-helpers";
import { vendorProductInputSchema } from "@/lib/validations/vendor-product";
import { getVendorStore } from "@/lib/vendor";
import { logAudit } from "@/lib/audit";

async function loadOwnedProduct(storeId: string, productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.storeId !== storeId) return null;
  return product;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { session, error } = await requireVendor();
    if (error) return error;

    const store = await getVendorStore(session.user.id);
    if (!store) return apiError("Vendor store not found", 404);

    const { productId } = await params;
    const existing = await loadOwnedProduct(store.id, productId);
    if (!existing) return apiError("Product not found", 404);

    const body = vendorProductInputSchema.partial().parse(await request.json());

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.shortDescription !== undefined && { shortDescription: body.shortDescription }),
        ...(body.brandId !== undefined && { brandId: body.brandId }),
        ...(body.basePrice !== undefined && { basePrice: body.basePrice }),
        ...(body.salePrice !== undefined && { salePrice: body.salePrice }),
        ...(body.stockQuantity !== undefined && { stockQuantity: body.stockQuantity }),
        ...(body.weightKg !== undefined && { weightKg: body.weightKg }),
        ...(body.categoryIds && { categories: { set: body.categoryIds.map((id) => ({ id })) } }),
        // Edits to a published listing must be re-reviewed before going live again.
        ...(existing.status === "PUBLISHED" && { status: "PENDING_REVIEW", submittedAt: new Date() }),
      },
    });

    await logAudit({
      actorType: "VENDOR",
      actorId: session.user.id,
      action: "product.updated",
      targetType: "Product",
      targetId: product.id,
    });

    return NextResponse.json({ data: product });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { session, error } = await requireVendor();
    if (error) return error;

    const store = await getVendorStore(session.user.id);
    if (!store) return apiError("Vendor store not found", 404);

    const { productId } = await params;
    const existing = await loadOwnedProduct(store.id, productId);
    if (!existing) return apiError("Product not found", 404);

    const product = await prisma.product.update({ where: { id: productId }, data: { status: "ARCHIVED" } });

    await logAudit({
      actorType: "VENDOR",
      actorId: session.user.id,
      action: "product.archived",
      targetType: "Product",
      targetId: product.id,
    });

    return NextResponse.json({ data: product });
  } catch (err) {
    return handleApiError(err);
  }
}
