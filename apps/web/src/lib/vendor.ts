import { prisma } from "@/lib/prisma";

export async function getVendorStore(customerId: string) {
  return prisma.store.findUnique({ where: { customerId } });
}
