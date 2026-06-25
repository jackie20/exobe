import Link from "next/link";
import { LayoutDashboard, Package, ShoppingBag, Tag, Wallet, Settings } from "lucide-react";
import { CONTAINER } from "@/lib/layout";
import { auth } from "@/auth";

const NAV = [
  { href: "/vendor", label: "Overview", icon: LayoutDashboard },
  { href: "/vendor/products", label: "Products", icon: Package },
  { href: "/vendor/orders", label: "Orders", icon: ShoppingBag },
  { href: "/vendor/coupons", label: "Coupons", icon: Tag },
  { href: "/vendor/wallet", label: "Wallet", icon: Wallet },
  { href: "/vendor/store", label: "Store Settings", icon: Settings },
];

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const name = session?.user?.name ?? "Vendor";

  return (
    <div className="bg-[#f7f7f7] min-h-screen">
      <div className={`${CONTAINER} py-8`}>
        {/* Vendor header */}
        <div className="mb-6 rounded bg-white border border-[#ececec] px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#999]">Vendor Dashboard</p>
          <h1 className="mt-0.5 text-[18px] font-bold text-[#333]">Welcome back, {name}</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Sidebar nav — Farmart dashboard-navigation style */}
          <aside className="h-fit">
            <ul className="border border-[#eaeaea] bg-white">
              {NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href} className="border-b border-[#eaeaea] last:border-b-0 bg-[#f5f5f5]">
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-[30px] py-3 text-[12px] font-semibold uppercase tracking-wide text-[#333] hover:text-primary hover:bg-white transition-colors"
                    >
                      <Icon className="size-4 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Content */}
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
