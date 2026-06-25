import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Pending payment",
  PAYMENT_CONFIRMED: "Payment confirmed",
  PROCESSING: "Processing",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: { select: { slug: true } } } },
      statusHistory: { orderBy: { createdAt: "asc" } },
      shippingAddress: true,
      payments: true,
    },
  });

  if (!order || order.customerId !== session.user.id) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{order.orderNumber}</h1>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium uppercase">
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Placed {order.placedAt.toLocaleDateString()}</p>

      {/* Order timeline */}
      <section className="mt-8">
        <h2 className="font-semibold">Order timeline</h2>
        <ol className="mt-4 space-y-4 border-l border-border pl-4">
          {order.statusHistory
            .filter((entry) => !entry.orderItemId)
            .map((entry) => (
              <li key={entry.id} className="relative">
                <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-primary" />
                <p className="text-sm font-medium">{STATUS_LABELS[entry.status] ?? entry.status}</p>
                {entry.note && <p className="text-xs text-muted-foreground">{entry.note}</p>}
                <p className="text-xs text-muted-foreground">{entry.createdAt.toLocaleString()}</p>
              </li>
            ))}
        </ol>
      </section>

      {/* Item-level tracking */}
      <section className="mt-8">
        <h2 className="font-semibold">Items</h2>
        <div className="mt-4 space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{item.productNameSnapshot}</p>
                <span className="rounded-full border px-2 py-0.5 text-xs font-medium">
                  {STATUS_LABELS[item.status] ?? item.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Qty {item.quantity} · {formatMoney(Number(item.lineTotal), order.currency)}
              </p>
              {item.trackingNumber && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Tracking: {item.trackingNumber} {item.courierName && `(${item.courierName})`}
                </p>
              )}
              {item.estimatedDeliveryDate && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Estimated delivery: {item.estimatedDeliveryDate.toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Shipping address snapshot */}
      {order.shippingAddress && (
        <section className="mt-8">
          <h2 className="font-semibold">Shipping address</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {order.shippingAddress.fullName}, {order.shippingAddress.line1}
            {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}, {order.shippingAddress.city},{" "}
            {order.shippingAddress.country}
          </p>
        </section>
      )}

      {/* Payment & refund status */}
      <section className="mt-8 rounded-lg bg-muted p-4">
        <div className="flex justify-between text-sm">
          <span>Payment status</span>
          <span className="font-medium">{order.paymentStatus}</span>
        </div>
        {order.payments.some((payment) => payment.status === "REFUNDED") && (
          <div className="mt-1 flex justify-between text-sm">
            <span>Refund status</span>
            <span className="font-medium">Refunded</span>
          </div>
        )}
        <div className="mt-3 flex justify-between border-t border-border pt-3 font-semibold">
          <span>Total</span>
          <span>{formatMoney(Number(order.total), order.currency)}</span>
        </div>
      </section>
    </div>
  );
}
