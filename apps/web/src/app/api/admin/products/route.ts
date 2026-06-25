import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-helpers";
import type { ProductStatus } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const status = (request.nextUrl.searchParams.get("status") as ProductStatus | null) ?? "PENDING_REVIEW";

    const products = await prisma.product.findMany({
      where: { status },
      orderBy: { submittedAt: "asc" },
      include: {
        images: { take: 1, orderBy: { position: "asc" } },
        store: { select: { name: true, slug: true } },
      },
    });

    return NextResponse.json({ data: products });
  } catch (err) {
    return handleApiError(err);
  }
}
