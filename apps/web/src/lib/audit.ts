import { prisma } from "@/lib/prisma";
import type { AuditActorType, Prisma } from "@/generated/prisma/client";

export async function logAudit(entry: {
  actorType: AuditActorType;
  actorId?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorType: entry.actorType,
        actorId: entry.actorId ?? null,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId,
        metadata: entry.metadata as Prisma.InputJsonValue | undefined,
        ipAddress: entry.ipAddress ?? null,
      },
    });
  } catch (error) {
    // Audit logging must never block the primary action.
    console.error("Failed to write audit log", error);
  }
}
