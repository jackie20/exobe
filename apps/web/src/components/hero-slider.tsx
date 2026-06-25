"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    title: "Millions of Products. One Platform.",
    subtitle: "Shop electronics, fashion, home & beauty from South Africa's top vendors — delivered to your door.",
    cta: "Shop Now",
    href: "/products",
    badge: "Best Deals",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=90&auto=format&fit=crop",
    overlay: "from-black/70 via-black/40 to-transparent",
  },
  {
    title: "Up to 40% Off Electronics",
    subtitle: "The latest smartphones, laptops, smartwatches and accessories at unbeatable prices.",
    cta: "Explore Tech",
    href: "/products",
    badge: "Flash Sale",
    image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1400&q=90&auto=format&fit=crop",
    overlay: "from-black/75 via-black/40 to-transparent",
  },
  {
    title: "Fashion That Fits Every Budget",
    subtitle: "Discover trending styles from local South African designers, streetwear & international brands.",
    cta: "View Collection",
    href: "/products",
    badge: "New Season",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=90&auto=format&fit=crop",
    overlay: "from-black/70 via-black/35 to-transparent",
  },
  {
    title: "Home Makeover Sale",
    subtitle: "Transform your living space with premium furniture, decor & appliances — now at reduced prices.",
    cta: "Shop Home",
    href: "/products",
    badge: "Up to 35% Off",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&q=90&auto=format&fit=crop",
    overlay: "from-black/65 via-black/30 to-transparent",
  },
];

const INTERVAL_MS = 5000;

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const next = useCallback(() => setCurrent((c) => (c + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length), []);

  // Auto-advance — restarts whenever `paused` or `current` changes
  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, next]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0]!.clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0]!.clientX - touchStartX.current;
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
    touchStartX.current = null;
  };

  return (
    <div
      className="relative overflow-hidden bg-[#111]"
      style={{ height: 400 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
          aria-hidden={i !== current}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover"
            priority={i === 0}
            loading={i === 0 ? "eager" : "lazy"}
            sizes="(max-width: 1024px) 100vw, calc(100vw - 316px)"
          />
          <div className={cn("absolute inset-0 bg-gradient-to-r", slide.overlay)} />
          <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-14">
            <span className="mb-3 inline-block w-fit bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              {slide.badge}
            </span>
            <h2 className="max-w-lg text-[26px] font-extrabold leading-tight text-white sm:text-[36px]">
              {slide.title}
            </h2>
            <p className="mt-2 max-w-sm text-[13px] text-white/90 sm:text-[14px]">
              {slide.subtitle}
            </p>
            <Link
              href={slide.href}
              className="mt-5 inline-flex w-fit items-center gap-2 bg-primary px-6 py-3 text-[13px] font-bold text-white transition-colors hover:bg-[#b8021f]"
            >
              {slide.cta}
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
      ))}

      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center bg-white/80 text-black shadow transition-colors hover:bg-primary hover:text-white"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center bg-white/80 text-black shadow transition-colors hover:bg-primary hover:text-white"
      >
        <ChevronRight className="size-5" />
      </button>

      <div className="absolute bottom-4 left-0 right-0 z-10 flex items-center justify-between px-5">
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setCurrent(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                i === current ? "w-6 bg-primary" : "w-2 bg-white/50 hover:bg-white/80"
              )}
            />
          ))}
        </div>
        <span className="text-[11px] font-bold text-white/60">{current + 1} / {SLIDES.length}</span>
      </div>
    </div>
  );
}
