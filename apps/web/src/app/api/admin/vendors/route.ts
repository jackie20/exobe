import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-helpers";
import type { StoreStatus } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const status = request.nextUrl.searchParams.get("status") as StoreStatus | null;

    const stores = await prisma.store.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true, email: true } } },
    });

    return NextResponse.json({ data: stores });
  } catch (err) {
    return handleApiError(err);
  }
}
