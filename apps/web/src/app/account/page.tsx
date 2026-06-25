import Link from "next/link";
import { ChevronRight, Package, MapPin, User, ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/format";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountProfileForm } from "@/components/account-profile-form";
import { AccountAddresses } from "@/components/account-addresses";
import { CONTAINER } from "@/lib/layout";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-[#fff8e6] text-[#8c6d00] border-[#ffe58f]",
  PROCESSING: "bg-[#e6f7ff] text-[#0050b3] border-[#91d5ff]",
  SHIPPED: "bg-[#f6ffed] text-[#237804] border-[#b7eb8f]",
  DELIVERED: "bg-[#f9f0ff] text-[#531dab] border-[#d3adf7]",
  CANCELLED: "bg-[#fff1f0] text-[#a8071a] border-[#ffa39e]",
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [orders, addresses] = await Promise.all([
    prisma.order.findMany({
      where: { customerId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    prisma.address.findMany({
      where: { customerId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="bg-[#f7f7f7] min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-[#ececec] bg-white">
        <div className={`${CONTAINER} flex items-center gap-1.5 py-3 text-[12px] text-[#999]`}>
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="size-3" />
          <span className="text-[#333]">My Account</span>
        </div>
      </div>

      <div className={`${CONTAINER} py-8`}>
        {/* Header */}
        <div className="mb-6 rounded bg-white border border-[#ececec] px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#999]">Customer Dashboard</p>
          <h1 className="mt-0.5 text-[18px] font-bold text-[#333]">
            Welcome, {session.user.name ?? "Customer"}
          </h1>
          <p className="text-[12px] text-[#999]">{session.user.email}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Sidebar — Farmart dashboard-navigation */}
          <aside className="h-fit">
            <ul className="border border-[#eaeaea] bg-white">
              {[
                { icon: Package, label: "Orders", count: orders.length, tab: "orders" },
                { icon: MapPin, label: "Addresses", count: addresses.length, tab: "addresses" },
                { icon: User, label: "Profile", tab: "profile" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.tab} className="border-b border-[#eaeaea] last:border-b-0 bg-[#f5f5f5]">
                    <div className="flex items-center gap-3 px-[30px] py-3 text-[12px] font-semibold uppercase tracking-wide text-[#333]">
                      <Icon className="size-4 shrink-0" />
                      {item.label}
                      {"count" in item && (
                        <span className="ml-auto inline-flex min-w-[20px] items-center justify-center rounded-[3px] bg-primary px-1 py-0.5 text-[10px] font-bold text-white">
                          {item.count}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Main content via tabs */}
          <Tabs defaultValue="orders" className="min-w-0">
            <TabsList className="mb-5 w-full justify-start border-b border-[#ececec] bg-transparent pb-0">
              <TabsTrigger
                value="orders"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-b-2 border-transparent pb-3 text-[13px] font-semibold"
              >
                Orders
              </TabsTrigger>
              <TabsTrigger
                value="addresses"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-b-2 border-transparent pb-3 text-[13px] font-semibold"
              >
                Addresses
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-b-2 border-transparent pb-3 text-[13px] font-semibold"
              >
                Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded bg-white py-16 text-center border border-[#ececec]">
                  <Package className="size-12 text-[#ddd]" strokeWidth={1} />
                  <p className="text-[14px] text-[#999]">You haven&apos;t placed any orders yet.</p>
                  <Link href="/products" className="flex items-center gap-1.5 text-[13px] text-primary hover:underline">
                    Start shopping <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="overflow-hidden rounded border border-[#ececec] bg-white">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-[#ececec] bg-[#f9f9f9]">
                        <th className="py-3 pl-5 text-left text-[11px] font-bold uppercase tracking-wide text-[#999]">Order</th>
                        <th className="py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#999]">Date</th>
                        <th className="py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#999]">Status</th>
                        <th className="py-3 pr-5 text-right text-[11px] font-bold uppercase tracking-wide text-[#999]">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const statusClass = STATUS_COLORS[order.status] ?? "bg-[#f5f5f5] text-[#555] border-[#ececec]";
                        return (
                          <tr key={order.id} className="border-b border-[#ececec] last:border-b-0 hover:bg-[#fafafa] transition-colors">
                            <td className="py-3 pl-5">
                              <Link
                                href={`/account/orders/${order.id}`}
                                className="text-[13px] font-semibold text-foreground hover:text-primary"
                              >
                                {order.orderNumber}
                              </Link>
                              <p className="text-[11px] text-[#999]">
                                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                              </p>
                            </td>
                            <td className="py-3 text-[12px] text-[#666]">
                              {order.placedAt.toLocaleDateString("en-ZA")}
                            </td>
                            <td className="py-3">
                              <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-bold ${statusClass}`}>
                                {order.status.replace(/_/g, " ")}
                              </span>
                            </td>
                            <td className="py-3 pr-5 text-right text-[13px] font-semibold text-[#333]">
                              {formatMoney(Number(order.total), order.currency)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="addresses">
              <AccountAddresses
                initial={addresses.map((a) => ({
                  id: a.id,
                  fullName: a.fullName,
                  phone: a.phone,
                  line1: a.line1,
                  line2: a.line2,
                  city: a.city,
                  state: a.state,
                  country: a.country,
                  zipCode: a.zipCode,
                  isDefaultShipping: a.isDefaultShipping,
                  isDefaultBilling: a.isDefaultBilling,
                }))}
              />
            </TabsContent>

            <TabsContent value="profile">
              <div className="rounded bg-white border border-[#ececec] p-6">
                <h2 className="mb-5 text-[14px] font-bold uppercase tracking-wide text-[#333]">Profile Settings</h2>
                <AccountProfileForm name={session.user.name ?? ""} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
