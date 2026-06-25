import { z } from "zod";

export const withdrawalRequestSchema = z.object({
  amount: z.coerce.number().positive(),
  paymentChannel: z.enum(["bank_transfer"]).default("bank_transfer"),
});
