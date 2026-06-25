import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { position: "asc" },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { position: "asc" },
          select: { id: true, name: true, slug: true, imageUrl: true },
        },
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({
      data: categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        imageUrl: category.imageUrl,
        productCount: category._count.products,
        children: category.children,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
