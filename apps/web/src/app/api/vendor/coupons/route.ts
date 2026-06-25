import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, handleApiError } from "@/lib/api-response";
import { requireVendor } from "@/lib/auth-helpers";
import { vendorCouponInputSchema } from "@/lib/validations/vendor-coupon";
import { getVendorStore } from "@/lib/vendor";

export async function GET() {
  try {
    const { session, error } = await requireVendor();
    if (error) return error;

    const store = await getVendorStore(session.user.id);
    if (!store) return apiError("Vendor store not found", 404);

    const coupons = await prisma.coupon.findMany({ where: { storeId: store.id }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ data: coupons });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireVendor();
    if (error) return error;

    const store = await getVendorStore(session.user.id);
    if (!store) return apiError("Vendor store not found", 404);
    if (store.status !== "APPROVED") return apiError("Your store is not approved yet", 403);

    const body = vendorCouponInputSchema.parse(await request.json());

    const existing = await prisma.coupon.findUnique({ where: { code: body.code } });
    if (existing) return apiError("Coupon code already in use", 409);

    const coupon = await prisma.coupon.create({ data: { ...body, storeId: store.id } });
    return NextResponse.json({ data: coupon }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
