import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiError, handleApiError } from "@/lib/api-response";
import { effectivePrice } from "@/lib/pricing";
import { z } from "zod";

const addWishlistSchema = z.object({ productId: z.string().min(1) });

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return apiError("Authentication required", 401);

    const items = await prisma.wishlistItem.findMany({
      where: { customerId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { product: { include: { images: { take: 1, orderBy: { position: "asc" } } } } },
    });

    return NextResponse.json({
      data: items.map((item) => ({
        id: item.id,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          image: item.product.images[0]?.url ?? null,
          currency: item.product.currency,
          ...effectivePrice(item.product),
        },
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return apiError("Authentication required", 401);

    const body = addWishlistSchema.parse(await request.json());
    const item = await prisma.wishlistItem.upsert({
      where: { customerId_productId: { customerId: session.user.id, productId: body.productId } },
      update: {},
      create: { customerId: session.user.id, productId: body.productId },
    });

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
