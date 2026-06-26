import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AccountAddresses } from "@/components/account-addresses";
import { CONTAINER } from "@/lib/layout";

export const dynamic = "force-dynamic";

export default async function AccountAddressesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account/addresses");

  const addresses = await prisma.address.findMany({
    where: { customerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-[#f7f7f7] min-h-screen">
      <div className="border-b border-[#ececec] bg-white">
        <div className={`${CONTAINER} flex items-center gap-1.5 py-3 text-[12px] text-[#999]`}>
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="size-3" />
          <Link href="/account" className="hover:text-primary">My Account</Link>
          <ChevronRight className="size-3" />
          <span className="text-[#333]">Addresses</span>
        </div>
      </div>

      <div className={`${CONTAINER} py-8`}>
        <div className="rounded bg-white border border-[#ececec] p-8">
          <h1 className="mb-6 text-[20px] font-bold text-[#333]">My Addresses</h1>
          <AccountAddresses initial={addresses} />
        </div>
      </div>
    </div>
  );
}
