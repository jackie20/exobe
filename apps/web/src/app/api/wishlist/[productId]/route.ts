import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiError, handleApiError } from "@/lib/api-response";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return apiError("Authentication required", 401);

    const { productId } = await params;
    await prisma.wishlistItem.deleteMany({ where: { customerId: session.user.id, productId } });

    return NextResponse.json({ data: { removed: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
