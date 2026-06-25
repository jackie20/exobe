import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/format";
import { AdminOrderStatusControl } from "@/components/admin-order-status-control";
import { AdminConfirmManualPayment } from "@/components/admin-confirm-manual-payment";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { customer: { select: { name: true, email: true } }, payments: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Orders</h1>

      {orders.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No orders yet.</p>
      ) : (
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              <th className="py-2">Order</th>
              <th className="py-2">Customer</th>
              <th className="py-2">Total</th>
              <th className="py-2">Payment</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const hasPendingManualEft =
                order.paymentStatus !== "PAID" && order.payments.some((p) => p.provider === "MANUAL_EFT");

              return (
                <tr key={order.id} className="border-b border-border">
                  <td className="py-3 font-medium">{order.orderNumber}</td>
                  <td className="py-3">{order.customer.name}</td>
                  <td className="py-3">{formatMoney(Number(order.total), order.currency)}</td>
                  <td className="py-3">
                    {order.paymentStatus}
                    {hasPendingManualEft && (
                      <div className="mt-1">
                        <AdminConfirmManualPayment orderId={order.id} />
                      </div>
                    )}
                  </td>
                  <td className="py-3">
                    <AdminOrderStatusControl orderId={order.id} status={order.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
