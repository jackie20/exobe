import Link from "next/link";
import Image from "next/image";
import { Truck, RotateCcw, ShieldCheck, Headset, MapPin, Mail, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CONTAINER } from "@/lib/layout";
import { NewsletterForm } from "@/components/newsletter-form";

const TRUST_FEATURES = [
  { icon: Truck, title: "Free Delivery", description: "On orders over R500" },
  { icon: RotateCcw, title: "Easy Returns", description: "14-day hassle-free returns" },
  { icon: ShieldCheck, title: "Secure Payment", description: "100% protected checkout" },
  { icon: Headset, title: "24/7 Support", description: "Mon–Fri 9AM–5PM" },
];

const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://facebook.com/exobeafrica", icon: "f" },
  { label: "Instagram", href: "https://instagram.com/exobeafrica", icon: "in" },
  { label: "X / Twitter", href: "https://x.com/exobeafrica", icon: "x" },
];

const FALLBACK_CATEGORIES = [
  { id: "electronics", name: "Electronics", slug: "electronics" },
  { id: "fashion", name: "Fashion", slug: "fashion" },
  { id: "home-kitchen", name: "Home & Kitchen", slug: "home-kitchen" },
  { id: "beauty", name: "Beauty", slug: "beauty" },
  { id: "sport", name: "Sport", slug: "sport" },
  { id: "cellphones-wearables", name: "Cellphones & Wearables", slug: "cellphones-wearables" },
  { id: "computers-tablets", name: "Computers & Tablets", slug: "computers-tablets" },
  { id: "toys", name: "Toys", slug: "toys" },
];

async function getFooterCategories() {
  try {
    return await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { position: "asc" },
      take: 8,
      select: { id: true, name: true, slug: true },
    });
  } catch {
    return FALLBACK_CATEGORIES;
  }
}

function AppleAppStoreIcon() {
  return (
    <svg viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto">
      <rect width="120" height="40" rx="6" fill="#000"/>
      <path d="M24.769 20.3c-.028-3.28 2.68-4.875 2.803-4.954-1.527-2.23-3.9-2.535-4.74-2.562-2-.207-3.93 1.19-4.95 1.19-1.03 0-2.6-1.168-4.28-1.135-2.18.034-4.21 1.28-5.33 3.226-2.29 3.973-.584 9.826 1.63 13.043 1.09 1.574 2.38 3.333 4.07 3.27 1.64-.066 2.255-1.053 4.24-1.053 1.964 0 2.538 1.053 4.26.98 1.76-.028 2.87-1.582 3.937-3.168.497-.717.762-1.34.966-1.915-.024-.01-3.602-1.38-3.607-5.52z" fill="#fff"/>
      <path d="M21.517 11.422c.88-1.08 1.48-2.567 1.317-4.055-1.274.054-2.852.854-3.768 1.91-.815.94-1.537 2.47-1.35 3.922 1.43.11 2.892-.72 3.8-1.777z" fill="#fff"/>
      <text x="34" y="16" fill="#fff" fontFamily="system-ui,sans-serif" fontSize="7" fontWeight="400" opacity=".8">Download on the</text>
      <text x="34" y="28" fill="#fff" fontFamily="system-ui,sans-serif" fontSize="13" fontWeight="600">App Store</text>
    </svg>
  );
}

function GooglePlayIcon() {
  return (
    <svg viewBox="0 0 135 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto">
      <rect width="135" height="40" rx="6" fill="#000"/>
      <path d="M9.5 7.5L22.5 20 9.5 32.5c-.55-.32-.9-.92-.9-1.62V9.12c0-.7.35-1.3.9-1.62z" fill="#EA4335"/>
      <path d="M9.5 7.5l13 12.5-3.5 3.5-9.5-9.5V7.5z" fill="#FBBC04"/>
      <path d="M30 20l-7.5 7.5-3.5-3.5 3-3 8-1z" fill="#34A853"/>
      <path d="M9.5 32.5L22.5 20l3.5 3.5-9.5 9.5-7 .5z" fill="#4285F4"/>
      <text x="36" y="16" fill="#fff" fontFamily="system-ui,sans-serif" fontSize="7" fontWeight="400" opacity=".8">GET IT ON</text>
      <text x="36" y="28" fill="#fff" fontFamily="system-ui,sans-serif" fontSize="13" fontWeight="600">Google Play</text>
    </svg>
  );
}

function HuaweiAppGalleryIcon() {
  return (
    <svg viewBox="0 0 145 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto">
      <rect width="145" height="40" rx="6" fill="#CE0000"/>
      <circle cx="20" cy="20" r="11" fill="#fff" opacity=".15"/>
      <circle cx="20" cy="20" r="8" fill="#fff" opacity=".25"/>
      <text x="12" y="24" fill="#fff" fontFamily="system-ui,sans-serif" fontSize="12" fontWeight="700">H</text>
      <text x="36" y="16" fill="#fff" fontFamily="system-ui,sans-serif" fontSize="7" fontWeight="400" opacity=".85">Explore it on</text>
      <text x="36" y="28" fill="#fff" fontFamily="system-ui,sans-serif" fontSize="11" fontWeight="600">AppGallery</text>
    </svg>
  );
}

export async function SiteFooter() {
  const categories = await getFooterCategories();

  return (
    <>
      <footer id="footer" className="mt-auto border-t border-[#ececec] bg-white text-[#555]">
        {/* Trust badges */}
        <div className="border-b border-[#ececec] bg-[#f7f7f7]">
          <div className={CONTAINER}>
            <div className="grid grid-cols-2 gap-6 py-6 sm:grid-cols-4">
              {TRUST_FEATURES.map((f) => (
                <div key={f.title} className="flex items-center gap-3">
                  <f.icon className="size-8 shrink-0 text-primary" strokeWidth={1.5} />
                  <div>
                    <p className="text-[14px] font-bold text-foreground">{f.title}</p>
                    <p className="text-[12px] text-[#999]">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* App download bar */}
        <div className="border-b border-[#ececec] bg-[#1a1a1a] py-6 text-white">
          <div className={CONTAINER}>
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div>
                <p className="text-[16px] font-extrabold">Download Our App</p>
                <p className="mt-0.5 text-[13px] text-white/60">
                  Shop faster, track orders, get exclusive deals — on iOS, Android & Huawei.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a href="#" aria-label="Download on the App Store" className="opacity-90 transition-opacity hover:opacity-100">
                  <AppleAppStoreIcon />
                </a>
                <a href="#" aria-label="Get it on Google Play" className="opacity-90 transition-opacity hover:opacity-100">
                  <GooglePlayIcon />
                </a>
                <a href="#" aria-label="Explore on AppGallery" className="opacity-90 transition-opacity hover:opacity-100">
                  <HuaweiAppGalleryIcon />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer widgets */}
        <div className={CONTAINER}>
          <div className="grid gap-8 border-b border-[#ececec] py-10 sm:grid-cols-2 md:grid-cols-4">
            {/* Col 1: About */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Image src="/exobe-logo.png" alt="Exobe Africa" width={36} height={36} className="h-9 w-auto object-contain" />
                <span className="text-[18px] font-extrabold tracking-tight text-foreground">
                  Exobe<span className="text-primary">Africa</span>
                </span>
              </div>
              <p className="mb-4 text-[13px] leading-relaxed text-[#777]">
                A trusted multivendor marketplace connecting shoppers and local vendors across Africa.
              </p>
              <div className="space-y-2 text-[13px]">
                <p className="flex items-center gap-2"><MapPin className="size-4 shrink-0 text-primary" />Cape Town, South Africa</p>
                <p className="flex items-center gap-2"><Phone className="size-4 shrink-0 text-primary" />+27 70 382 1099</p>
                <p className="flex items-center gap-2"><Mail className="size-4 shrink-0 text-primary" />hello@exobe.africa</p>
              </div>
            </div>

            {/* Col 2: Customer Service */}
            <div>
              <p className="mb-4 text-[15px] font-bold uppercase tracking-wide text-foreground">Customer Service</p>
              <ul className="space-y-2.5 text-[13px]">
                {[
                  { label: "Contact us", href: "/contact" },
                  { label: "Track my order", href: "/account" },
                  { label: "Shipping policy", href: "/contact" },
                  { label: "Returns & exchanges", href: "/contact" },
                  { label: "FAQs", href: "/contact" },
                  { label: "Blog", href: "/blog" },
                ].map((l) => (
                  <li key={l.label}><Link href={l.href} className="transition-colors hover:text-primary">{l.label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Col 3: My Account */}
            <div>
              <p className="mb-4 text-[15px] font-bold uppercase tracking-wide text-foreground">My Account</p>
              <ul className="space-y-2.5 text-[13px]">
                {[
                  { label: "Sign in", href: "/login" },
                  { label: "Create account", href: "/register" },
                  { label: "My orders", href: "/account" },
                  { label: "Wishlist", href: "/wishlist" },
                  { label: "Compare products", href: "/compare" },
                  { label: "Sell on Exobe", href: "/become-vendor" },
                ].map((l) => (
                  <li key={l.label}><Link href={l.href} className="transition-colors hover:text-primary">{l.label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Col 4: Categories + Newsletter */}
            <div>
              <p className="mb-4 text-[15px] font-bold uppercase tracking-wide text-foreground">Top Categories</p>
              <ul className="mb-6 space-y-2.5 text-[13px]">
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link href={`/categories/${c.slug}`} className="transition-colors hover:text-primary">{c.name}</Link>
                  </li>
                ))}
              </ul>
              <p className="mb-2 text-[13px] font-semibold text-foreground">Newsletter</p>
              <NewsletterForm />
            </div>
          </div>
        </div>

        {/* Copyright bar */}
        <div className={CONTAINER}>
          <div className="flex flex-col items-center gap-4 py-5 text-[12px] md:flex-row md:justify-between">
            <p className="text-[#888]">© {new Date().getFullYear()} Exobe Africa (Pty) Ltd. All rights reserved.</p>

            {/* Payment methods */}
            <div className="flex items-center gap-2">
              {["Stripe", "PayFast", "Yoco", "EFT"].map((method) => (
                <span key={method} className="rounded border border-[#e0e0e0] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#555]">
                  {method}
                </span>
              ))}
            </div>

            {/* Social */}
            <div className="flex items-center gap-3">
              <span className="text-[#999]">Stay connected:</span>
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex size-[26px] items-center justify-center bg-primary text-[11px] font-bold text-white transition-opacity hover:opacity-80"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
