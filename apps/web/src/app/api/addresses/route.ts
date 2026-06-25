import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiError, handleApiError } from "@/lib/api-response";
import { addressInputSchema } from "@/lib/validations/checkout";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return apiError("Authentication required", 401);

    const addresses = await prisma.address.findMany({
      where: { customerId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: addresses });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return apiError("Authentication required", 401);

    const body = addressInputSchema.parse(await request.json());
    const address = await prisma.address.create({
      data: { ...body, customerId: session.user.id },
    });

    return NextResponse.json({ data: address }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
