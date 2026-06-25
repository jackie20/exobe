import { z } from "zod";

export const vendorApplicationSchema = z.object({
  storeName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(5).max(30),
  country: z.string().min(2).max(2),
  businessRegistrationNumber: z.string().max(60).optional(),
  taxNumber: z.string().max(60).optional(),
});

export const vendorRejectionSchema = z.object({
  reason: z.string().min(3).max(500),
});

export const storeOnboardingSchema = z.object({
  logoUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  description: z.string().max(2000).optional(),
  shippingPolicy: z.string().max(2000).optional(),
  returnPolicy: z.string().max(2000).optional(),
  bankAccountName: z.string().max(120).optional(),
  bankAccountNumber: z.string().max(60).optional(),
  bankName: z.string().max(120).optional(),
});
