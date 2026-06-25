import { z } from "zod";

export const ORDER_STATUS_VALUES = [
  "PENDING_PAYMENT",
  "PAYMENT_CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
] as const;

export const orderStatusUpdateSchema = z.object({
  status: z.enum(ORDER_STATUS_VALUES),
  note: z.string().max(500).optional(),
});

export const orderItemStatusUpdateSchema = z.object({
  status: z.enum(ORDER_STATUS_VALUES),
  courierName: z.string().max(120).optional(),
  trackingNumber: z.string().max(120).optional(),
  estimatedDeliveryDate: z.coerce.date().optional(),
});
