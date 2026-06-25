import Image from "next/image";
import Link from "next/link";
import {
  TrendingUp,
  ShieldCheck,
  Truck,
  BarChart3,
  Headset,
  Rocket,
  Percent,
  PackageCheck,
  Wallet,
  HandHeart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTAINER } from "@/lib/layout";
import { VendorApplicationForm } from "@/components/vendor-application-form";

const HIGHLIGHTS = [
  { icon: Percent, title: "7% Fee", description: "Competitive transaction fee per sale" },
  { icon: PackageCheck, title: "Free Pickup (Pilot)", description: "We cover collection during the pilot" },
  { icon: Wallet, title: "Monthly Payouts", description: "Directly to your bank" },
  { icon: HandHeart, title: "Hands-On Support", description: "Active setup & support" },
];

const RETAILER_BENEFITS = [
  "Access to an expanded customer base",
  "Product listings on our consumer marketplace",
  "Integrated payment processing & order management",
  "Customer service & returns support",
  "Performance analytics & sales insights",
];

const RETAILER_AUDIENCE = ["Individual sellers", "Small businesses", "Brand owners", "Manufacturers", "Resellers", "Online stores"];

const WHOLESALER_BENEFITS = [
  "Access to verified retailers across our network",
  "B2B marketplace with bulk order management",
  "Volume pricing tools & quantity discounts",
  "Inventory management & demand forecasting analytics",
  "Dedicated account management support",
];

const WHOLESALER_AUDIENCE = ["Manufacturers", "Distributors", "Importers", "Suppliers", "Wholesalers", "Exporters"];

const COMPARISON_ROWS = [
  { feature: "Target Customers", retailer: "End consumers", wholesaler: "Retailers & businesses" },
  { feature: "Order Sizes", retailer: "Individual units", wholesaler: "Bulk quantities" },
  { feature: "Pricing Model", retailer: "Retail pricing", wholesaler: "Volume discounts" },
  { feature: "Payment Terms", retailer: "Payouts are processed monthly.", wholesaler: "Payouts are processed monthly." },
  {
    feature: "Marketing Support",
    retailer: "Your products appear on the eXobe storefront and search results",
    wholesaler: "B2B relationship building",
  },
  { feature: "Minimum Orders", retailer: "No minimum", wholesaler: "MOQ requirements" },
];

const WHY_SELL = [
  { icon: TrendingUp, title: "Grow Your Business", description: "Reach new customers in Gauteng and expand your market with our growing platform." },
  { icon: ShieldCheck, title: "Secure Payments", description: "Get paid securely and on time with our trusted payment system and fraud protection." },
  { icon: Truck, title: "Logistics Support", description: "We handle parcel collection and delivery through reliable partners to help you reach customers with ease." },
  { icon: BarChart3, title: "Analytics & Insights", description: "Track your performance with detailed analytics and insights to optimise your sales strategy." },
  { icon: Headset, title: "Dedicated Support", description: "Get help from our dedicated seller support team whenever you need assistance." },
  { icon: Rocket, title: "Easy Setup", description: "Quick and simple onboarding process to get your store up and running in no time." },
];

const STEPS = [
  { number: 1, title: "Apply to Sell", description: "Submit your application with business details. We'll review and approve within 2-3 business days." },
  { number: 2, title: "Set Up Your Store", description: "Upload your products, set prices, and customise your store profile to attract customers." },
  { number: 3, title: "Start Selling", description: "Your products go live immediately. Start receiving orders and grow your business with eXobe." },
];

export default function BecomeVendorPage() {
  return (
    <div>
      {/* Hero */}
      <div className="relative h-[420px] w-full sm:h-[480px]">
        <Image
          src="https://images.unsplash.com/photo-1565098772267-60af42b81ef2?w=1800&q=80&auto=format&fit=crop"
          alt="South African entrepreneur preparing products to sell online"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-secondary/70" />
        <div className={`${CONTAINER} relative flex h-full flex-col items-start justify-center text-secondary-foreground`}>
          <h1 className="max-w-2xl text-3xl font-bold sm:text-5xl">Sell on eXobe</h1>
          <p className="mt-3 max-w-xl text-secondary-foreground/90">
            Join South Africa&apos;s bold new marketplace built to empower entrepreneurs.
          </p>
          <p className="mt-2 max-w-xl text-secondary-foreground/80">
            Whether you&apos;re a retailer selling directly to consumers or a wholesaler supplying to
            businesses, we have the perfect platform to grow your sales and reach new markets.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="#apply">Start Selling Today</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-card">
              <Link href="#why-sell">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className={`${CONTAINER} -mt-10 relative z-10`}>
        <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-card p-6 shadow-sm sm:grid-cols-4">
          {HIGHLIGHTS.map((item) => (
            <div key={item.title} className="text-center">
              <item.icon className="mx-auto size-7 text-primary" />
              <p className="mt-2 font-semibold">{item.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={`${CONTAINER} py-16`}>
        {/* Choose Your Selling Path */}
        <section>
          <h2 className="text-2xl font-semibold">Choose Your Selling Path</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Whether you&apos;re selling directly to consumers or supplying retailers, eXobe has the right
            platform for your business model.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Retailer */}
            <div className="flex flex-col rounded-lg border border-border p-6">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">Retailer</span>
              <h3 className="mt-1 text-xl font-semibold">Sell directly to consumers</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Perfect for brands, manufacturers, and businesses looking to reach end customers through our
                consumer marketplace.
              </p>

              <p className="mt-4 text-sm font-semibold">What You Get:</p>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {RETAILER_BENEFITS.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-primary">•</span>
                    {item}
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-sm font-semibold">Perfect For:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {RETAILER_AUDIENCE.map((tag) => (
                  <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              <Button asChild className="mt-6">
                <Link href="#apply">Apply as Retailer</Link>
              </Button>
            </div>

            {/* Wholesaler */}
            <div className="flex flex-col rounded-lg border border-border p-6 opacity-90">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">Wholesaler</span>
              <h3 className="mt-1 text-xl font-semibold">Supply products to retailers</h3>
              <span className="mt-2 inline-block w-fit rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                Launching in Q1 2026
              </span>
              <p className="mt-2 text-sm text-muted-foreground">
                Ideal for manufacturers, distributors, and suppliers looking to serve retailers through our B2B
                marketplace.
              </p>

              <p className="mt-4 text-sm font-semibold">What You&apos;ll Get at launch in Q1 2026:</p>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {WHOLESALER_BENEFITS.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-primary">•</span>
                    {item}
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-sm font-semibold">Perfect For:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {WHOLESALER_AUDIENCE.map((tag) => (
                  <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              <Button disabled className="mt-6">
                Apply as Wholesaler (Coming Soon)
              </Button>
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">Quick Comparison</h2>
          <div className="mt-6 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold">Feature</th>
                  <th className="px-4 py-3 font-semibold">Retailer</th>
                  <th className="px-4 py-3 font-semibold">Wholesaler</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{row.feature}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.retailer}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.wholesaler}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 rounded-lg bg-muted p-6 text-center">
            <p className="font-semibold">Not Sure Which Path to Choose?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Our application process will help you determine the best selling approach for your business. You
              can always adjust your strategy as you grow.
            </p>
            <Button asChild className="mt-4">
              <Link href="#apply">Start Your Application</Link>
            </Button>
          </div>
        </section>

        {/* Why sell on eXobe */}
        <section id="why-sell" className="mt-16">
          <h2 className="text-2xl font-semibold">Why Sell on eXobe?</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Join a thriving marketplace that puts your success first with powerful tools, dedicated support,
            and access to millions of customers.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_SELL.map((item) => (
              <div key={item.title} className="rounded-lg border border-border p-5">
                <item.icon className="size-7 text-primary" />
                <p className="mt-3 font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">How It Works</h2>
          <p className="mt-2 text-muted-foreground">Get started in just 3 simple steps</p>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="text-center">
                <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {step.number}
                </span>
                <p className="mt-3 font-semibold">{step.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-16 rounded-lg bg-secondary p-10 text-center text-secondary-foreground">
          <h2 className="text-2xl font-semibold">Ready to Start Your Success Story?</h2>
          <p className="mt-2 text-secondary-foreground/80">
            Join a growing community of South African entrepreneurs growing their businesses online with
            eXobe.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href="#apply">Apply to Sell Now</Link>
          </Button>
        </section>

        {/* Application form */}
        <section id="apply" className="mt-16 scroll-mt-20 rounded-lg border border-border p-8">
          <VendorApplicationForm />
        </section>
      </div>
    </div>
  );
}
