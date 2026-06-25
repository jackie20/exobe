"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingCart, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/categories", label: "Category", icon: LayoutGrid },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account", label: "Account", icon: User },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const { data } = useCart();
  const itemCount =
    data?.data.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <nav className="footer-mobile-bar lg:hidden">
      <ul className="flex">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.href;
          return (
            <li key={tab.href} className="flex flex-1">
              <Link
                href={tab.href}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] transition-colors",
                  active ? "text-primary" : "text-[#333] hover:text-primary"
                )}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      "size-[22px]",
                      active && "stroke-primary"
                    )}
                    strokeWidth={active ? 2 : 1.5}
                  />
                  {tab.href === "/cart" && itemCount > 0 && (
                    <span className="cart-item-badge" style={{ fontSize: 9, padding: "3px 4px 2px", top: -7, right: -8 }}>
                      {itemCount}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "leading-none",
                    active ? "font-semibold text-primary" : "text-[#333]"
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
