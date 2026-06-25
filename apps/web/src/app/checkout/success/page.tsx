import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; manual?: string }>;
}) {
  const { order, manual } = await searchParams;
  const isManual = manual === "1";

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold text-success">
        {isManual ? "Order received — payment pending" : "Thank you for your order!"}
      </h1>
      {order && <p className="mt-2 text-muted-foreground">Order reference: {order}</p>}
      <p className="mt-2 text-muted-foreground">
        {isManual
          ? "We've recorded your order and are waiting to verify your EFT payment. You'll receive a confirmation once it's been checked, usually within 1 business day."
          : "We've received your payment and will start processing your order right away."}
      </p>
      <Button asChild className="mt-6">
        <Link href="/account">View my orders</Link>
      </Button>
    </div>
  );
}
