import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/format";
import { VendorItemStatusControl } from "@/components/vendor-item-status-control";

export const dynamic = "force-dynamic";

export default async function VendorOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const store = await prisma.store.findUnique({ where: { customerId: session.user.id } });
  if (!store) return null;

  const items = await prisma.orderItem.findMany({
    where: { product: { storeId: store.id } },
    orderBy: { order: { createdAt: "desc" } },
    include: { order: { select: { orderNumber: true, currency: true } } },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Orders</h1>

      {items.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No orders yet.</p>
      ) : (
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              <th className="py-2">Order</th>
              <th className="py-2">Product</th>
              <th className="py-2">Qty</th>
              <th className="py-2">Line total</th>
              <th className="py-2">Fulfillment</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border">
                <td className="py-3 font-medium">{item.order.orderNumber}</td>
                <td className="py-3">{item.productNameSnapshot}</td>
                <td className="py-3">{item.quantity}</td>
                <td className="py-3">{formatMoney(Number(item.lineTotal), item.order.currency)}</td>
                <td className="py-3">
                  <VendorItemStatusControl orderItemId={item.id} status={item.status} trackingNumber={item.trackingNumber} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
