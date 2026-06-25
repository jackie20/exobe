import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-response";
import { requireVendor } from "@/lib/auth-helpers";
import { storeOnboardingSchema } from "@/lib/validations/vendor";

export async function GET() {
  try {
    const { session, error } = await requireVendor();
    if (error) return error;

    const store = await prisma.store.findUnique({
      where: { customerId: session.user.id },
    });

    return NextResponse.json({ data: store });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { session, error } = await requireVendor();
    if (error) return error;

    const body = storeOnboardingSchema.parse(await request.json());

    const store = await prisma.store.update({
      where: { customerId: session.user.id },
      data: body,
    });

    return NextResponse.json({ data: store });
  } catch (err) {
    return handleApiError(err);
  }
}
