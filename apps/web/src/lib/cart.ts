import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { effectivePrice } from "@/lib/pricing";

const GUEST_CART_COOKIE = "exobe_guest_cart";

export type CartIdentity = { customerId?: string; sessionToken?: string };

export async function getCartIdentity() {
  const session = await auth();
  if (session?.user?.id) {
    return { customerId: session.user.id, sessionToken: undefined as string | undefined };
  }

  const cookieStore = await cookies();
  let token = cookieStore.get(GUEST_CART_COOKIE)?.value;
  if (!token) {
    token = crypto.randomUUID();
    cookieStore.set(GUEST_CART_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }
  return { customerId: undefined as string | undefined, sessionToken: token };
}

export async function findCartItem(identity: CartIdentity, productId: string, variantId?: string) {
  return prisma.cartItem.findFirst({
    where: {
      productId,
      variantId: variantId ?? null,
      ...(identity.customerId ? { customerId: identity.customerId } : { sessionToken: identity.sessionToken }),
    },
  });
}

export async function loadCart(identity: CartIdentity) {
  const items = await prisma.cartItem.findMany({
    where: identity.customerId
      ? { customerId: identity.customerId }
      : { sessionToken: identity.sessionToken },
    orderBy: { createdAt: "asc" },
    include: {
      product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } },
      variant: { include: { attributes: { include: { attributeValue: { include: { attribute: true } } } } } },
    },
  });

  let subtotal = 0;
  const currency = items[0]?.product.currency ?? "ZAR";

  const data = items.map((item) => {
    const { price } = effectivePrice(item.product);
    const unitPrice = item.variant?.priceOverride ? Number(item.variant.priceOverride) : price;
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    return {
      id: item.id,
      quantity: item.quantity,
      unitPrice,
      lineTotal,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        image: item.product.images[0]?.url ?? null,
      },
      variant: item.variant
        ? {
            id: item.variant.id,
            sku: item.variant.sku,
            attributes: item.variant.attributes.map((attribute) => ({
              name: attribute.attributeValue.attribute.name,
              value: attribute.attributeValue.value,
            })),
          }
        : null,
    };
  });

  return { items: data, subtotal, currency };
}
