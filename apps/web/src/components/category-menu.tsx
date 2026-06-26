"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LayoutGrid, ChevronRight, ChevronDown, Loader2 } from "lucide-react";
import { useCategories } from "@/hooks/use-products";
import { cn } from "@/lib/utils";

const STATIC_DEPARTMENTS = [
  { name: "Baby & Toddler", slug: "baby-toddler" },
  { name: "Beauty", slug: "beauty" },
  { name: "Books", slug: "books" },
  { name: "Cameras", slug: "cameras" },
  { name: "Camping & Outdoors", slug: "camping-outdoors" },
  { name: "Cellphones & Wearables", slug: "cellphones-wearables" },
  { name: "Computers & Tablets", slug: "computers-tablets" },
  { name: "Garden, Pool & Patio", slug: "garden-pool-patio" },
  { name: "Health", slug: "health" },
  { name: "Home & Kitchen", slug: "home-kitchen" },
  { name: "Luggage & Travel", slug: "luggage-travel" },
  { name: "Pets", slug: "pets" },
  { name: "Sport", slug: "sport" },
  { name: "Toys", slug: "toys" },
  { name: "TV, Audio & Video", slug: "tv-audio-video" },
  { name: "Vouchers", slug: "vouchers" },
  { name: "Deals", slug: "deals" },
];

export function CategoryMenu() {
  const { data, isLoading } = useCategories();
  const [open, setOpen] = useState(false);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Build final list: DB categories on top (have real children), then static fallbacks for anything missing
  const dbItems = data?.data ?? [];
  const dbSlugs = new Set(dbItems.map((c) => c.slug));
  const staticExtras = STATIC_DEPARTMENTS.filter((d) => !dbSlugs.has(d.slug));

  const menuItems: { id: string; name: string; slug: string; children: { id: string; name: string; slug: string }[] }[] = [
    ...dbItems.map((c) => ({ id: c.id, name: c.name, slug: c.slug, children: c.children })),
    ...staticExtras.map((d) => ({ id: d.slug, name: d.name, slug: d.slug, children: [] })),
  ];

  const hoveredItem = hoveredSlug ? menuItems.find((c) => c.slug === hoveredSlug) : null;

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setHoveredSlug(null);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  function handleButtonClick() {
    setOpen((prev) => {
      if (prev) setHoveredSlug(null);
      return !prev;
    });
  }

  function closeMenu() {
    setOpen(false);
    setHoveredSlug(null);
  }

  return (
    <div className="relative shrink-0" ref={wrapperRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={handleButtonClick}
        className={cn(
          "flex h-[44px] items-center gap-2 bg-primary px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#b8021f]",
          open && "bg-[#b8021f]"
        )}
        aria-expanded={open}
      >
        <LayoutGrid className="size-4 shrink-0" />
        <span>Shop by Department</span>
        {isLoading ? (
          <Loader2 className="size-3.5 shrink-0 animate-spin" />
        ) : (
          <ChevronDown className={cn("size-3.5 shrink-0 transition-transform duration-200", open && "rotate-180")} />
        )}
      </button>

      {/* Dropdown — positioned by the wrapper's relative context */}
      {open && (
        <div
          className="absolute left-0 top-full z-[200] flex"
          style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}
        >
          {/* Primary list */}
          <div className="category-mega-menu w-[260px] max-h-[500px] overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={`/categories/${item.slug}`}
                onMouseEnter={() => setHoveredSlug(item.slug)}
                onClick={closeMenu}
                className={cn(
                  "category-mega-menu-item",
                  hoveredSlug === item.slug && "active"
                )}
              >
                <span>{item.name}</span>
                {item.children.length > 0 && (
                  <ChevronRight className="size-3.5 shrink-0 text-[#bbb]" />
                )}
              </Link>
            ))}
          </div>

          {/* Submenu — shown when a category with children is hovered */}
          {hoveredItem && hoveredItem.children.length > 0 && (
            <div className="category-mega-submenu w-[220px] max-h-[500px]">
              <div className="border-b border-[#ececec] px-4 py-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#999]">
                  {hoveredItem.name}
                </p>
              </div>
              {hoveredItem.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/categories/${child.slug}`}
                  onClick={closeMenu}
                  className="category-mega-menu-item"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
