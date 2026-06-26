import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiError, handleApiError } from "@/lib/api-response";

const schema = z.object({ email: z.string().email("Invalid email address") });

export async function POST(request: NextRequest) {
  try {
    const { email } = schema.parse(await request.json());

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing && !existing.unsubscribedAt) {
      return apiError("You are already subscribed.", 409);
    }

    if (existing) {
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: { unsubscribedAt: null, subscribedAt: new Date() },
      });
    } else {
      await prisma.newsletterSubscriber.create({ data: { email } });
    }

    return NextResponse.json({ message: "Subscribed successfully!" });
  } catch (error) {
    return handleApiError(error);
  }
}
