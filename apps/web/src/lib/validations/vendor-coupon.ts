import { z } from "zod";

export const vendorCouponInputSchema = z.object({
  code: z.string().min(3).max(40),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.coerce.number().positive(),
  minOrderAmount: z.coerce.number().positive().optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  usageLimit: z.coerce.number().int().positive().optional(),
  usageLimitPerCustomer: z.coerce.number().int().positive().optional(),
});
