import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-response";

const schema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  try {
    const { email } = schema.parse(await request.json());

    const customer = await prisma.customer.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!customer) {
      return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
    }

    // Invalidate old tokens for this email
    await prisma.passwordResetToken.updateMany({
      where: { email, usedAt: null, expiresAt: { gt: new Date() } },
      data: { expiresAt: new Date() },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({ data: { email, token, expiresAt } });

    // TODO: Send email via email service (Resend/SendGrid)
    // For now, return the token in dev mode only
    const isDev = process.env.NODE_ENV === "development";
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    return NextResponse.json({
      message: "If that email exists, a reset link has been sent.",
      ...(isDev && { resetUrl }),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
