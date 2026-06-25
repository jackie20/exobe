"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCategories } from "@/hooks/use-products";
import { getCategoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/blog", label: "Blog" },
];

export function MobileMenuSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: categories } = useCategories();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleExpanded(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full max-w-xs overflow-y-auto">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col px-4 py-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => onOpenChange(false)}
              className="border-b border-border py-3 text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-2">
          <p className="py-2 text-xs font-semibold uppercase text-muted-foreground">Shop by category</p>
          {categories?.data.map((category) => {
            const Icon = getCategoryIcon(category.name);
            const hasChildren = category.children.length > 0;
            const isExpanded = expanded.has(category.id);

            return (
              <div key={category.id} className="border-b border-border">
                <div className="flex items-center">
                  <Link
                    href={`/categories/${category.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="flex flex-1 items-center gap-2 py-2.5 text-sm"
                  >
                    <Icon className="size-4 text-primary" />
                    {category.name}
                  </Link>
                  {hasChildren && (
                    <button
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                      onClick={() => toggleExpanded(category.id)}
                      className="px-2 py-2.5 text-muted-foreground"
                    >
                      {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                    </button>
                  )}
                </div>
                {hasChildren && (
                  <div className={cn("ml-6 overflow-hidden transition-all", isExpanded ? "max-h-96 pb-2" : "max-h-0")}>
                    {category.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/categories/${child.slug}`}
                        onClick={() => onOpenChange(false)}
                        className="block py-1.5 text-sm text-muted-foreground"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
