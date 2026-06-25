import Link from "next/link";
import { Package, ShoppingBag, Wallet, Clock, ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function VendorOverviewPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const store = await prisma.store.findUnique({
    where: { customerId: session.user.id },
    include: { wallet: true },
  });
  if (!store) return null;

  const [productCount, pendingProductCount, orderCount] = await Promise.all([
    prisma.product.count({ where: { storeId: store.id, status: "PUBLISHED" } }),
    prisma.product.count({ where: { storeId: store.id, status: "PENDING_REVIEW" } }),
    prisma.orderItem.count({ where: { product: { storeId: store.id } } }),
  ]);

  const availableBalance = Number(store.wallet?.availableBalance ?? 0);

  const stats = [
    {
      label: "Published Products",
      value: productCount,
      icon: Package,
      href: "/vendor/products",
      color: "text-primary",
      bg: "bg-[#e6f7ff]",
    },
    {
      label: "Pending Review",
      value: pendingProductCount,
      icon: Clock,
      href: "/vendor/products",
      color: "text-[#f5a623]",
      bg: "bg-[#fff8e6]",
    },
    {
      label: "Order Items",
      value: orderCount,
      icon: ShoppingBag,
      href: "/vendor/orders",
      color: "text-[#52c41a]",
      bg: "bg-[#f6ffed]",
    },
    {
      label: "Available Balance",
      value: formatMoney(availableBalance),
      icon: Wallet,
      href: "/vendor/wallet",
      color: "text-primary",
      bg: "bg-[#fff0f3]",
    },
  ];

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="group block rounded bg-white border border-[#ececec] p-5 hover:border-primary transition-colors">
              <div className={`mb-3 flex size-10 items-center justify-center rounded ${stat.bg}`}>
                <Icon className={`size-5 ${stat.color}`} />
              </div>
              <p className="text-[22px] font-bold text-[#333]">{stat.value}</p>
              <p className="mt-0.5 text-[12px] text-[#999]">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Quick links */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded bg-white border border-[#ececec] p-5">
          <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-[#333]">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { href: "/vendor/products", label: "Add New Product" },
              { href: "/vendor/orders", label: "View Pending Orders" },
              { href: "/vendor/wallet", label: "Request Withdrawal" },
              { href: "/vendor/store", label: "Update Store Info" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between rounded border border-[#ececec] px-3 py-2 text-[13px] text-[#555] hover:border-primary hover:text-primary transition-colors"
              >
                {link.label}
                <ArrowRight className="size-3.5" />
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded bg-white border border-[#ececec] p-5">
          <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-[#333]">Store Info</h3>
          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between border-b border-[#f5f5f5] pb-2">
              <span className="text-[#999]">Store name</span>
              <span className="font-semibold text-[#333]">{store.name}</span>
            </div>
            <div className="flex justify-between border-b border-[#f5f5f5] pb-2">
              <span className="text-[#999]">Status</span>
              <span className={`font-semibold ${store.status === "APPROVED" ? "text-[#52c41a]" : "text-[#f5a623]"}`}>
                {store.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#999]">Total balance</span>
              <span className="font-semibold text-[#333]">
                {formatMoney(Number(store.wallet?.netEarnings ?? 0))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
