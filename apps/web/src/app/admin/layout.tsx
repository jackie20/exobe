import Link from "next/link";
import { LayoutDashboard, Store, Package, ShoppingBag, Wallet, LogOut } from "lucide-react";
import { CONTAINER } from "@/lib/layout";
import { auth } from "@/auth";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/vendors", label: "Vendor Applications", icon: Store },
  { href: "/admin/products", label: "Product Moderation", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: Wallet },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const name = session?.user?.name ?? "Admin";

  return (
    <div className="bg-[#f7f7f7] min-h-screen">
      <div className={`${CONTAINER} py-8`}>
        {/* Admin header banner */}
        <div className="mb-6 flex items-center justify-between rounded bg-[#1a1a1a] px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#999]">Admin Panel</p>
            <h1 className="mt-0.5 text-[18px] font-bold text-white">Welcome, {name}</h1>
          </div>
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-1.5 text-[12px] text-[#999] hover:text-white transition-colors"
          >
            <LogOut className="size-4" />
            Sign out
          </Link>
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

            <div className="mt-4 rounded border border-[#ececec] bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#999]">Quick Links</p>
              <div className="mt-2 flex flex-col gap-1">
                <Link href="/" className="text-[12px] text-foreground hover:text-primary">
                  ← Back to Storefront
                </Link>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
