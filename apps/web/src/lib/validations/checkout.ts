import { z } from "zod";

export const addressInputSchema = z.object({
  fullName: z.string().min(2).max(120),
  phone: z.string().min(5).max(30),
  line1: z.string().min(2).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z.string().max(100).optional(),
  country: z.string().min(2).max(2),
  zipCode: z.string().max(20).optional(),
  isDefaultShipping: z.boolean().optional(),
  isDefaultBilling: z.boolean().optional(),
});

export const checkoutSchema = z.object({
  shippingAddressId: z.string().min(1),
  billingAddressId: z.string().min(1).optional(),
  shippingMethodId: z.string().min(1),
  couponCode: z.string().min(1).optional(),
  paymentProvider: z.enum(["STRIPE", "PAYFAST", "YOCO", "MANUAL_EFT"]).default("STRIPE"),
});
