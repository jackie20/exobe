import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-response";
import { productListQuerySchema } from "@/lib/validations/catalog";
import { effectivePrice } from "@/lib/pricing";

export async function GET(request: NextRequest) {
  try {
    const query = productListQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );

    const where: Prisma.ProductWhereInput = {
      status: "PUBLISHED",
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: "insensitive" } },
          { description: { contains: query.search, mode: "insensitive" } },
          { sku: { contains: query.search, mode: "insensitive" } },
        ],
      }),
      ...(query.category && { categories: { some: { slug: query.category } } }),
      ...(query.brand && { brand: { slug: query.brand } }),
      ...(query.featured !== undefined && { isFeatured: query.featured }),
      ...(query.ids && { id: { in: query.ids } }),
      ...((query.minPrice !== undefined || query.maxPrice !== undefined) && {
        basePrice: {
          ...(query.minPrice !== undefined && { gte: query.minPrice }),
          ...(query.maxPrice !== undefined && { lte: query.maxPrice }),
        },
      }),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      query.sort === "price-asc"
        ? { basePrice: "asc" }
        : query.sort === "price-desc"
          ? { basePrice: "desc" }
          : query.sort === "rating"
            ? { avgRating: "desc" }
            : { createdAt: "desc" };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.perPage,
        take: query.perPage,
        include: {
          brand: { select: { name: true, slug: true } },
          images: { orderBy: { position: "asc" }, take: 1 },
        },
      }),
    ]);

    return NextResponse.json({
      data: products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription,
        currency: product.currency,
        ...effectivePrice(product),
        basePrice: Number(product.basePrice),
        avgRating: Number(product.avgRating),
        reviewCount: product.reviewCount,
        isFeatured: product.isFeatured,
        inStock: product.stockQuantity > 0 || product.allowBackorder,
        brand: product.brand,
        image: product.images[0]?.url ?? null,
      })),
      meta: {
        page: query.page,
        perPage: query.perPage,
        total,
        totalPages: Math.ceil(total / query.perPage),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
