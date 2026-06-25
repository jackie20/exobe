import Link from "next/link";
import { Store, Package, ShoppingBag, Wallet, TrendingUp, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [pendingVendors, pendingProducts, pendingWithdrawals, totalOrders, totalRevenue] = await Promise.all([
    prisma.store.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.withdrawal.count({ where: { status: "PENDING" } }),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
  ]);

  const stats = [
    {
      label: "Pending Vendors",
      value: pendingVendors,
      icon: Store,
      href: "/admin/vendors",
      color: "text-[#f5a623]",
      bg: "bg-[#fff8e6]",
      badge: pendingVendors > 0,
    },
    {
      label: "Products to Review",
      value: pendingProducts,
      icon: Package,
      href: "/admin/products",
      color: "text-primary",
      bg: "bg-[#e6f7ff]",
      badge: pendingProducts > 0,
    },
    {
      label: "Pending Withdrawals",
      value: pendingWithdrawals,
      icon: Wallet,
      href: "/admin/withdrawals",
      color: "text-primary",
      bg: "bg-[#fff0f3]",
      badge: pendingWithdrawals > 0,
    },
    {
      label: "Total Orders",
      value: totalOrders,
      icon: ShoppingBag,
      href: "/admin/orders",
      color: "text-[#52c41a]",
      bg: "bg-[#f6ffed]",
      badge: false,
    },
    {
      label: "Revenue (Paid)",
      value: formatMoney(Number(totalRevenue._sum.total ?? 0)),
      icon: TrendingUp,
      href: "/admin/orders",
      color: "text-[#722ed1]",
      bg: "bg-[#f9f0ff]",
      badge: false,
    },
  ];

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group relative block rounded bg-white border border-[#ececec] p-5 hover:border-primary transition-colors"
            >
              {stat.badge && (
                <span className="absolute right-3 top-3 flex size-2 rounded-full bg-primary" />
              )}
              <div className={`mb-3 flex size-10 items-center justify-center rounded ${stat.bg}`}>
                <Icon className={`size-5 ${stat.color}`} />
              </div>
              <p className="text-[22px] font-bold text-[#333]">{stat.value}</p>
              <p className="mt-0.5 text-[12px] text-[#999]">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Action areas */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded bg-white border border-[#ececec] p-5">
          <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-[#333]">Pending Actions</h3>
          <div className="space-y-2">
            {[
              { href: "/admin/vendors", label: `Vendor Applications (${pendingVendors} pending)`, count: pendingVendors },
              { href: "/admin/products", label: `Product Reviews (${pendingProducts} pending)`, count: pendingProducts },
              { href: "/admin/withdrawals", label: `Withdrawals (${pendingWithdrawals} pending)`, count: pendingWithdrawals },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded border border-[#ececec] px-3 py-2 text-[13px] transition-colors hover:border-primary hover:text-primary"
              >
                <span className={item.count > 0 ? "font-semibold text-[#333]" : "text-[#999]"}>
                  {item.label}
                </span>
                <ArrowRight className="size-3.5" />
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded bg-white border border-[#ececec] p-5">
          <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-[#333]">Platform Summary</h3>
          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between border-b border-[#f5f5f5] pb-2">
              <span className="text-[#999]">Total orders</span>
              <span className="font-semibold text-[#333]">{totalOrders}</span>
            </div>
            <div className="flex justify-between border-b border-[#f5f5f5] pb-2">
              <span className="text-[#999]">Revenue (paid)</span>
              <span className="font-semibold text-primary">{formatMoney(Number(totalRevenue._sum.total ?? 0))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#999]">Commission rate</span>
              <span className="font-semibold text-[#333]">10%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
