import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiError, handleApiError } from "@/lib/api-response";
import { checkoutSchema } from "@/lib/validations/checkout";
import { getCartIdentity, loadCart } from "@/lib/cart";
import { getPaymentGateway } from "@/lib/payments";
import { decrementStockOrThrow, InsufficientStockError } from "@/lib/stock";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return apiError("Authentication required", 401);
    const customerId = session.user.id;

    const body = checkoutSchema.parse(await request.json());

    const cart = await loadCart(await getCartIdentity());
    if (cart.items.length === 0) return apiError("Your cart is empty", 400);

    const [customer, shippingAddress, billingAddress, shippingMethod] = await Promise.all([
      prisma.customer.findUnique({ where: { id: customerId } }),
      prisma.address.findFirst({ where: { id: body.shippingAddressId, customerId } }),
      body.billingAddressId
        ? prisma.address.findFirst({ where: { id: body.billingAddressId, customerId } })
        : Promise.resolve(null),
      prisma.shippingMethod.findFirst({
        where: { id: body.shippingMethodId, isActive: true },
        include: { rates: true },
      }),
    ]);

    if (!customer) return apiError("Customer not found", 404);
    if (!shippingAddress) return apiError("Shipping address not found", 404);
    if (!shippingMethod) return apiError("Shipping method not found", 404);

    const rate =
      shippingMethod.rates.find((r) => r.country === shippingAddress.country) ?? shippingMethod.rates[0];
    const shippingFee = rate ? Number(rate.price) : 0;

    const taxRate = await prisma.taxRate.findFirst({
      where: { country: shippingAddress.country, OR: [{ state: shippingAddress.state }, { state: null }] },
      orderBy: { state: "desc" },
    });
    const taxAmount = taxRate ? cart.subtotal * Number(taxRate.rate) : 0;

    let discountAmount = 0;
    let coupon = null;
    if (body.couponCode) {
      coupon = await prisma.coupon.findUnique({ where: { code: body.couponCode } });
      if (!coupon || !coupon.isActive) return apiError("Coupon is not valid", 400);

      const now = new Date();
      if (coupon.startsAt && coupon.startsAt > now) return apiError("Coupon is not yet active", 400);
      if (coupon.endsAt && coupon.endsAt < now) return apiError("Coupon has expired", 400);
      if (coupon.minOrderAmount && cart.subtotal < Number(coupon.minOrderAmount)) {
        return apiError(`Coupon requires a minimum order of ${coupon.minOrderAmount}`, 400);
      }
      if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
        return apiError("Coupon usage limit reached", 400);
      }
      if (coupon.usageLimitPerCustomer) {
        const used = await prisma.couponRedemption.count({ where: { couponId: coupon.id, customerId } });
        if (used >= coupon.usageLimitPerCustomer) return apiError("You have already used this coupon", 400);
      }

      discountAmount =
        coupon.type === "PERCENT" ? cart.subtotal * (Number(coupon.value) / 100) : Number(coupon.value);
      discountAmount = Math.min(discountAmount, cart.subtotal);
    }

    const total = Math.max(0, cart.subtotal - discountAmount + shippingFee + taxAmount);
    const orderNumber = `EXB-${Date.now().toString(36).toUpperCase()}`;

    let order;
    try {
      order = await prisma.$transaction(async (tx) => {
        await decrementStockOrThrow(
          tx,
          cart.items.map((item) => ({
            productId: item.product.id,
            variantId: item.variant?.id,
            quantity: item.quantity,
            productName: item.product.name,
          }))
        );

        const created = await tx.order.create({
          data: {
            orderNumber,
            customerId,
            subtotal: cart.subtotal,
            shippingFee,
            taxAmount,
            discountAmount,
            total,
            currency: cart.currency,
            couponId: coupon?.id,
            shippingMethodId: shippingMethod.id,
            shippingAddressId: shippingAddress.id,
            billingAddressId: billingAddress?.id ?? shippingAddress.id,
            items: {
              create: cart.items.map((item) => ({
                productId: item.product.id,
                variantId: item.variant?.id,
                productNameSnapshot: item.product.name,
                skuSnapshot: item.variant?.sku ?? item.product.id,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                lineTotal: item.lineTotal,
              })),
            },
            statusHistory: { create: { status: "PENDING_PAYMENT", note: "Order placed" } },
          },
        });

        if (coupon) {
          await tx.couponRedemption.create({
            data: { couponId: coupon.id, customerId, orderId: created.id },
          });
          await tx.coupon.update({ where: { id: coupon.id }, data: { timesUsed: { increment: 1 } } });
        }

        await tx.cartItem.deleteMany({ where: { customerId } });

        return created;
      });
    } catch (err) {
      if (err instanceof InsufficientStockError) {
        return apiError(`${err.productName} no longer has enough stock for this order`, 409);
      }
      throw err;
    }

    const gateway = getPaymentGateway(body.paymentProvider);
    if (!gateway.isConfigured()) {
      return apiError(`${body.paymentProvider} is not configured`, 500);
    }

    const result = await gateway.initiate({
      order: { id: order.id, orderNumber: order.orderNumber, total, currency: cart.currency },
      customer: { name: customer.name, email: customer.email },
      successUrl: `${process.env.NEXTAUTH_URL}/checkout/success?order=${order.orderNumber}`,
      cancelUrl: `${process.env.NEXTAUTH_URL}/checkout?canceled=1`,
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: body.paymentProvider,
        providerReference: result.providerReference,
        amount: total,
        currency: cart.currency,
      },
    });

    return NextResponse.json({
      data: { orderId: order.id, orderNumber: order.orderNumber, payment: result },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
