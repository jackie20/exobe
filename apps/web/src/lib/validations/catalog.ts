import { z } from "zod";

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  brand: z.string().trim().min(1).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  featured: z.coerce.boolean().optional(),
  ids: z
    .string()
    .trim()
    .min(1)
    .transform((value) => value.split(",").filter(Boolean))
    .optional(),
  sort: z.enum(["newest", "price-asc", "price-desc", "rating"]).default("newest"),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;
