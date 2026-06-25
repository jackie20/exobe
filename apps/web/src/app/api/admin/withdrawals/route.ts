import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-helpers";
import type { WithdrawalStatus } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const status = request.nextUrl.searchParams.get("status") as WithdrawalStatus | null;

    const withdrawals = await prisma.withdrawal.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      include: { store: { select: { name: true, slug: true } } },
    });

    return NextResponse.json({ data: withdrawals });
  } catch (err) {
    return handleApiError(err);
  }
}
