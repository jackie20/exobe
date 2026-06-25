import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, handleApiError, parsePagination } from "@/lib/api-response";
import { requireVendor } from "@/lib/auth-helpers";
import { vendorProductInputSchema } from "@/lib/validations/vendor-product";
import { getVendorStore } from "@/lib/vendor";
import { logAudit } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const { session, error } = await requireVendor();
    if (error) return error;

    const store = await getVendorStore(session.user.id);
    if (!store) return apiError("Vendor store not found", 404);

    const { skip, take, page, perPage } = parsePagination(request.nextUrl.searchParams);

    const [total, products] = await Promise.all([
      prisma.product.count({ where: { storeId: store.id } }),
      prisma.product.findMany({
        where: { storeId: store.id },
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: { images: { take: 1, orderBy: { position: "asc" } } },
      }),
    ]);

    return NextResponse.json({ data: products, meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) } });
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

    const body = vendorProductInputSchema.parse(await request.json());

    const existingSku = await prisma.product.findUnique({ where: { sku: body.sku } });
    if (existingSku) return apiError("A product with this SKU already exists", 409);

    const baseSlug = body.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        sku: body.sku,
        description: body.description,
        shortDescription: body.shortDescription,
        brandId: body.brandId,
        storeId: store.id,
        basePrice: body.basePrice,
        salePrice: body.salePrice,
        currency: body.currency,
        stockQuantity: body.stockQuantity,
        weightKg: body.weightKg,
        status: "PENDING_REVIEW",
        submittedAt: new Date(),
        categories: { connect: body.categoryIds.map((id) => ({ id })) },
        images: { create: body.images.map((image, index) => ({ ...image, position: index })) },
      },
    });

    await logAudit({
      actorType: "VENDOR",
      actorId: session.user.id,
      action: "product.submitted",
      targetType: "Product",
      targetId: product.id,
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
