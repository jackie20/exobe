"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const BANNERS = [
  {
    title: "Up to 50% Off",
    subtitle: "Fashion & Clothing Sale",
    cta: "Shop Fashion",
    href: "/products",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=85&auto=format&fit=crop",
    badge: "SALE",
  },
  {
    title: "Tech Deals",
    subtitle: "Electronics from R299",
    cta: "Shop Electronics",
    href: "/products",
    image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&q=85&auto=format&fit=crop",
    badge: "HOT",
  },
  {
    title: "Beauty Picks",
    subtitle: "Premium brands at low prices",
    cta: "Shop Beauty",
    href: "/products",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=85&auto=format&fit=crop",
    badge: "NEW",
  },
  {
    title: "Home & Decor",
    subtitle: "Refresh your space today",
    cta: "Shop Home",
    href: "/products",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=85&auto=format&fit=crop",
    badge: "SAVE",
  },
  {
    title: "Sport & Fitness",
    subtitle: "Level up your game",
    cta: "Shop Sports",
    href: "/products",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=85&auto=format&fit=crop",
    badge: "DEALS",
  },
];

export function SideBannerSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const next = useCallback(() => setCurrent((c) => (c + 1) % BANNERS.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + BANNERS.length) % BANNERS.length), []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [paused, next]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]!.clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0]!.clientX - touchStartX.current;
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
    touchStartX.current = null;
  }

  return (
    <div
      className="relative overflow-hidden bg-[#1a1a1a]"
      style={{ height: "100%", minHeight: 400 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {BANNERS.map((b, i) => (
        <div
          key={i}
          aria-hidden={i !== current}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        >
          <Image
            src={b.image}
            alt={b.title}
            fill
            className="object-cover"
            priority={i === 0}
            loading={i === 0 ? "eager" : "lazy"}
            sizes="320px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
            <span className="mb-2 inline-block w-fit bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              {b.badge}
            </span>
            <p className="text-[18px] font-extrabold leading-tight">{b.title}</p>
            <p className="mt-0.5 text-[12px] text-white/80">{b.subtitle}</p>
            <Link
              href={b.href}
              className="mt-3 inline-block w-fit bg-white px-4 py-1.5 text-[11px] font-bold text-black transition-colors hover:bg-primary hover:text-white"
            >
              {b.cta} →
            </Link>
          </div>
        </div>
      ))}

      <button
        onClick={prev}
        aria-label="Previous"
        className="absolute left-2 top-1/2 z-10 flex size-7 -translate-y-1/2 items-center justify-center bg-black/40 text-white transition-colors hover:bg-primary"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        onClick={next}
        aria-label="Next"
        className="absolute right-2 top-1/2 z-10 flex size-7 -translate-y-1/2 items-center justify-center bg-black/40 text-white transition-colors hover:bg-primary"
      >
        <ChevronRight className="size-4" />
      </button>

      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Banner ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === current ? "w-5 bg-primary" : "w-1.5 bg-white/60 hover:bg-white"
            )}
          />
        ))}
      </div>
    </div>
  );
}
