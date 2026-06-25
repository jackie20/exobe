import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { effectivePrice } from "@/lib/pricing";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ data: [] });

  const products = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { brand: { name: { contains: q, mode: "insensitive" } } },
        { categories: { some: { name: { contains: q, mode: "insensitive" } } } },
      ],
    },
    take: 8,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    include: {
      images: { take: 1, orderBy: { position: "asc" } },
    },
  });

  return NextResponse.json({
    data: products.map((p) => {
      const { price } = effectivePrice(p);
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price,
        currency: p.currency,
        image: p.images[0]?.url ?? null,
      };
    }),
  });
}
