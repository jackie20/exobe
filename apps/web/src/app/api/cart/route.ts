import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, handleApiError } from "@/lib/api-response";
import { addCartItemSchema } from "@/lib/validations/cart";
import { findCartItem, getCartIdentity, loadCart } from "@/lib/cart";

export async function GET() {
  try {
    const identity = await getCartIdentity();
    const cart = await loadCart(identity);
    return NextResponse.json({ data: cart });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = addCartItemSchema.parse(await request.json());
    const identity = await getCartIdentity();

    const product = await prisma.product.findUnique({ where: { id: body.productId } });
    if (!product || product.status !== "PUBLISHED") return apiError("Product not found", 404);

    if (body.variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: body.variantId } });
      if (!variant || variant.productId !== product.id) return apiError("Variant not found", 404);
    }

    const existing = await findCartItem(identity, body.productId, body.variantId);

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + body.quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          productId: body.productId,
          variantId: body.variantId,
          quantity: body.quantity,
          customerId: identity.customerId,
          sessionToken: identity.sessionToken,
        },
      });
    }

    const cart = await loadCart(identity);
    return NextResponse.json({ data: cart }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
