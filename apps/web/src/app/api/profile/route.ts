import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { apiError, handleApiError } from "@/lib/api-response";
import { requireSession } from "@/lib/auth-helpers";

const updateProfileSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).max(72).optional(),
});

export async function GET() {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const customer = await prisma.customer.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
    });

    return NextResponse.json({ data: customer });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    const body = updateProfileSchema.parse(await request.json());

    const updates: { name?: string; passwordHash?: string } = {};

    if (body.name) updates.name = body.name;

    if (body.newPassword) {
      if (!body.currentPassword) return apiError("Current password is required to set a new one", 400);

      const customer = await prisma.customer.findUnique({
        where: { id: session.user.id },
        select: { passwordHash: true },
      });

      if (!customer?.passwordHash) return apiError("Account uses social login — cannot set a password", 400);

      const valid = await bcrypt.compare(body.currentPassword, customer.passwordHash);
      if (!valid) return apiError("Current password is incorrect", 400);

      updates.passwordHash = await bcrypt.hash(body.newPassword, 10);
    }

    if (Object.keys(updates).length === 0) return apiError("Nothing to update", 400);

    const updated = await prisma.customer.update({
      where: { id: session.user.id },
      data: updates,
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
