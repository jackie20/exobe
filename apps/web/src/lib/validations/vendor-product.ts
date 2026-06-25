import { z } from "zod";

export const vendorProductInputSchema = z.object({
  name: z.string().min(2).max(200),
  sku: z.string().min(1).max(64),
  description: z.string().max(5000).optional(),
  shortDescription: z.string().max(500).optional(),
  brandId: z.string().min(1).optional(),
  categoryIds: z.array(z.string().min(1)).min(1),
  basePrice: z.coerce.number().positive(),
  salePrice: z.coerce.number().positive().optional(),
  currency: z.string().length(3).default("ZAR"),
  stockQuantity: z.coerce.number().int().min(0),
  weightKg: z.coerce.number().positive().optional(),
  images: z.array(z.object({ url: z.string().url(), altText: z.string().max(200).optional() })).min(1),
});

export type VendorProductInput = z.infer<typeof vendorProductInputSchema>;
