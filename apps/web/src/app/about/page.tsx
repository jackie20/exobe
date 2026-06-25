import Image from "next/image";
import Link from "next/link";
import { Truck, ShieldCheck, Users, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTAINER } from "@/lib/layout";

const STATS = [
  { label: "Active vendors", value: "1,200+" },
  { label: "Products listed", value: "45,000+" },
  { label: "Happy customers", value: "200,000+" },
  { label: "Countries served", value: "6" },
];

const VALUES = [
  {
    icon: Users,
    title: "Community first",
    description: "We back local makers and small businesses, giving them the tools to reach customers across Africa.",
  },
  {
    icon: ShieldCheck,
    title: "Trust & safety",
    description: "Every vendor is verified before they can sell, and every order is protected by secure checkout.",
  },
  {
    icon: Truck,
    title: "Reliable delivery",
    description: "We partner with trusted couriers to get orders to your door quickly, wherever you are.",
  },
  {
    icon: Store,
    title: "Built for vendors",
    description: "Powerful dashboards, fair commissions, and fast payouts so vendors can focus on growing.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <div className="relative h-64 w-full sm:h-80">
        <Image
          src="https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1600&q=80&auto=format&fit=crop"
          alt="Exobe Africa marketplace team"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-secondary/60" />
        <div className={`${CONTAINER} relative flex h-full flex-col items-start justify-center text-secondary-foreground`}>
          <h1 className="text-3xl font-bold sm:text-4xl">About Exobe Africa</h1>
          <p className="mt-2 max-w-xl text-secondary-foreground/90">
            A marketplace built to connect shoppers with trusted vendors across the continent.
          </p>
        </div>
      </div>

      <div className={`${CONTAINER} py-12`}>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold">Our story</h2>
            <p className="mt-3 text-muted-foreground">
              Exobe Africa started with a simple idea: make it easy for anyone, anywhere on the continent, to
              buy from — and sell to — their community. Today we host thousands of vendors selling everything
              from electronics to handmade home goods, all backed by secure payments and reliable delivery.
            </p>
            <p className="mt-3 text-muted-foreground">
              Whether you&apos;re shopping for everyday essentials or building a business of your own, Exobe
              Africa gives you the tools to do it with confidence.
            </p>
            <Button asChild className="mt-6">
              <Link href="/become-vendor">Start selling on Exobe</Link>
            </Button>
          </div>
          <div className="relative h-64 overflow-hidden rounded-lg sm:h-auto">
            <Image
              src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1000&q=80&auto=format&fit=crop"
              alt="Vendor preparing products for delivery"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-6 rounded-lg bg-muted p-8 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-semibold">What we stand for</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {VALUES.map((value) => (
              <div key={value.title} className="flex gap-4 rounded-lg border border-border p-5">
                <value.icon className="size-8 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold">{value.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
