import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, handleApiError } from "@/lib/api-response";
import { vendorApplicationSchema } from "@/lib/validations/vendor";
import { requireSession } from "@/lib/auth-helpers";
import { slugify } from "@/lib/slug";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const existing = await prisma.store.findUnique({ where: { customerId: session.user.id } });
    if (existing) return apiError("You have already submitted a vendor application", 409);

    const body = vendorApplicationSchema.parse(await request.json());

    const baseSlug = slugify(body.storeName);
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.store.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const store = await prisma.store.create({
      data: {
        customerId: session.user.id,
        name: body.storeName,
        slug,
        email: body.email,
        phone: body.phone,
        country: body.country,
        businessRegistrationNumber: body.businessRegistrationNumber,
        taxNumber: body.taxNumber,
      },
    });

    await logAudit({
      actorType: "CUSTOMER",
      actorId: session.user.id,
      action: "vendor.application_submitted",
      targetType: "Store",
      targetId: store.id,
    });

    return NextResponse.json({ data: store }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
