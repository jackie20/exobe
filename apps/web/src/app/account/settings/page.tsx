import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AccountProfileForm } from "@/components/account-profile-form";
import { CONTAINER } from "@/lib/layout";

export const dynamic = "force-dynamic";

export default async function AccountSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account/settings");

  return (
    <div className="bg-[#f7f7f7] min-h-screen">
      <div className="border-b border-[#ececec] bg-white">
        <div className={`${CONTAINER} flex items-center gap-1.5 py-3 text-[12px] text-[#999]`}>
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="size-3" />
          <Link href="/account" className="hover:text-primary">My Account</Link>
          <ChevronRight className="size-3" />
          <span className="text-[#333]">Settings</span>
        </div>
      </div>

      <div className={`${CONTAINER} py-8`}>
        <div className="mx-auto max-w-[600px] rounded bg-white border border-[#ececec] p-8">
          <h1 className="mb-6 text-[20px] font-bold text-[#333]">Account Settings</h1>
          <AccountProfileForm name={session.user.name ?? ""} />
        </div>
      </div>
    </div>
  );
}
