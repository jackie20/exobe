import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    const methods = await prisma.shippingMethod.findMany({
      where: { isActive: true },
      include: { rates: true },
    });

    return NextResponse.json({
      data: methods.map((method) => ({
        id: method.id,
        name: method.name,
        description: method.description,
        rates: method.rates.map((rate) => ({
          country: rate.country,
          price: Number(rate.price),
        })),
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
