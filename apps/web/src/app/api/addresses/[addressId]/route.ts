import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, handleApiError } from "@/lib/api-response";
import { requireSession } from "@/lib/auth-helpers";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ addressId: string }> }
) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const { addressId } = await params;

    const address = await prisma.address.findUnique({
      where: { id: addressId },
      select: { customerId: true },
    });

    if (!address) return apiError("Address not found", 404);
    if (address.customerId !== session.user.id) return apiError("Forbidden", 403);

    await prisma.address.delete({ where: { id: addressId } });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleApiError(err);
  }
}
