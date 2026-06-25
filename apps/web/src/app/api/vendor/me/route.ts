import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-response";
import { requireSession } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const store = await prisma.store.findUnique({
      where: { customerId: session.user.id },
      include: { wallet: true },
    });

    return NextResponse.json({ data: store });
  } catch (err) {
    return handleApiError(err);
  }
}
