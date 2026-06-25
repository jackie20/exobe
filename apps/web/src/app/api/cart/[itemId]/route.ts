import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, handleApiError } from "@/lib/api-response";
import { updateCartItemSchema } from "@/lib/validations/cart";
import { getCartIdentity, loadCart } from "@/lib/cart";

async function assertOwnership(itemId: string) {
  const identity = await getCartIdentity();
  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
  if (!item) return { identity, item: null };

  const owns = identity.customerId
    ? item.customerId === identity.customerId
    : item.sessionToken === identity.sessionToken;

  return { identity, item: owns ? item : null };
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const { itemId } = await params;
    const body = updateCartItemSchema.parse(await request.json());
    const { identity, item } = await assertOwnership(itemId);
    if (!item) return apiError("Cart item not found", 404);

    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity: body.quantity } });
    return NextResponse.json({ data: await loadCart(identity) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const { itemId } = await params;
    const { identity, item } = await assertOwnership(itemId);
    if (!item) return apiError("Cart item not found", 404);

    await prisma.cartItem.delete({ where: { id: itemId } });
    return NextResponse.json({ data: await loadCart(identity) });
  } catch (error) {
    return handleApiError(error);
  }
}
