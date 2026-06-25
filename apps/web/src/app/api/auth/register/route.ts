import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { apiError, handleApiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = registerSchema.parse(await request.json());

    const existing = await prisma.customer.findUnique({ where: { email: body.email } });
    if (existing) return apiError("An account with this email already exists.", 409);

    const passwordHash = await bcrypt.hash(body.password, 10);
    const customer = await prisma.customer.create({
      data: { name: body.name, email: body.email, passwordHash },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
