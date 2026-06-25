import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiError, handleApiError } from "@/lib/api-response";
import { requireSession } from "@/lib/auth-helpers";

const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  comment: z.string().max(2000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const body = reviewSchema.parse(await request.json());

    const product = await prisma.product.findFirst({
      where: { id: body.productId, status: "PUBLISHED" },
      select: { id: true },
    });
    if (!product) return apiError("Product not found", 404);

    const existing = await prisma.review.findUnique({
      where: { productId_customerId: { productId: body.productId, customerId: session.user.id } },
      select: { id: true },
    });
    if (existing) return apiError("You have already reviewed this product", 409);

    const review = await prisma.review.create({
      data: {
        productId: body.productId,
        customerId: session.user.id,
        rating: body.rating,
        title: body.title,
        comment: body.comment,
        isApproved: false,
      },
    });

    return NextResponse.json({ data: review }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
