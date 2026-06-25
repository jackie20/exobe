import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, handleApiError } from "@/lib/api-response";
import { effectivePrice } from "@/lib/pricing";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: {
        brand: { select: { name: true, slug: true } },
        categories: { select: { name: true, slug: true } },
        images: { orderBy: { position: "asc" } },
        variants: {
          include: { attributes: { include: { attributeValue: { include: { attribute: true } } } } },
        },
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            rating: true,
            title: true,
            comment: true,
            createdAt: true,
            customer: { select: { name: true } },
          },
        },
      },
    });

    if (!product) return apiError("Product not found", 404);

    return NextResponse.json({
      data: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        description: product.description,
        shortDescription: product.shortDescription,
        currency: product.currency,
        ...effectivePrice(product),
        basePrice: Number(product.basePrice),
        avgRating: Number(product.avgRating),
        reviewCount: product.reviewCount,
        inStock: product.stockQuantity > 0 || product.allowBackorder,
        stockQuantity: product.stockQuantity,
        brand: product.brand,
        categories: product.categories,
        images: product.images.map((image) => ({ url: image.url, altText: image.altText })),
        variants: product.variants.map((variant) => ({
          id: variant.id,
          sku: variant.sku,
          price: variant.priceOverride ? Number(variant.priceOverride) : undefined,
          stockQuantity: variant.stockQuantity,
          imageUrl: variant.imageUrl,
          attributes: variant.attributes.map((attribute) => ({
            name: attribute.attributeValue.attribute.name,
            value: attribute.attributeValue.value,
            colorHex: attribute.attributeValue.colorHex,
          })),
        })),
        reviews: product.reviews,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
