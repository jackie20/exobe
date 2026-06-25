import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, handleApiError } from "@/lib/api-response";
import { requireVendor } from "@/lib/auth-helpers";
import { vendorCouponInputSchema } from "@/lib/validations/vendor-coupon";
import { getVendorStore } from "@/lib/vendor";

async function loadOwnedCoupon(storeId: string, couponId: string) {
  const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
  if (!coupon || coupon.storeId !== storeId) return null;
  return coupon;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ couponId: string }> }
) {
  try {
    const { session, error } = await requireVendor();
    if (error) return error;

    const store = await getVendorStore(session.user.id);
    if (!store) return apiError("Vendor store not found", 404);

    const { couponId } = await params;
    if (!(await loadOwnedCoupon(store.id, couponId))) return apiError("Coupon not found", 404);

    const body = vendorCouponInputSchema.partial().parse(await request.json());
    const coupon = await prisma.coupon.update({ where: { id: couponId }, data: body });

    return NextResponse.json({ data: coupon });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ couponId: string }> }
) {
  try {
    const { session, error } = await requireVendor();
    if (error) return error;

    const store = await getVendorStore(session.user.id);
    if (!store) return apiError("Vendor store not found", 404);

    const { couponId } = await params;
    if (!(await loadOwnedCoupon(store.id, couponId))) return apiError("Coupon not found", 404);

    const coupon = await prisma.coupon.update({ where: { id: couponId }, data: { isActive: false } });
    return NextResponse.json({ data: coupon });
  } catch (err) {
    return handleApiError(err);
  }
}
