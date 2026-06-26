"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Search,
  Heart,
  ShoppingCart,
  List,
  X,
  ChevronRight,
  ChevronDown,
  User,
  Package,
  MapPin,
  Settings,
  Store,
  LayoutDashboard,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useCategories } from "@/hooks/use-products";
import { CONTAINER } from "@/lib/layout";
import { MiniCartSheet } from "@/components/mini-cart-sheet";
import { CategoryMenu } from "@/components/category-menu";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";

const MAIN_NAV = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/blog", label: "Blog" },
  { href: "/become-vendor", label: "Sell on Exobe" },
];

type Suggestion = {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  image: string | null;
};

const POPULAR_SEARCHES = [
  "Smartphones", "Sneakers", "Skincare", "Laptops", "Dresses", "Headphones", "Perfume", "Running Shoes", "Cameras", "Watches",
];

const RECENT_SEARCHES_KEY = "exobe_recent_searches";

export function SiteHeader() {
  const { data: session } = useSession();
  const { data: cart } = useCart();
  const { data: categoriesData } = useCategories();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSticky, setIsSticky] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) ?? "[]");
      if (Array.isArray(stored)) setRecentSearches(stored.slice(0, 5));
    } catch { /* ignore */ }
  }, []);

  const itemCount = cart?.data.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const cartTotal = cart?.data.subtotal ?? 0;
  const cartCurrency = cart?.data.currency ?? "ZAR";

  // Sticky header after 100px scroll
  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Search autocomplete — debounced 300ms
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      if (searchQuery.length === 0 && searchFocused) setShowSuggestions(true);
      else setShowSuggestions(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: searchQuery });
        if (searchCategory !== "all") params.set("category", searchCategory);
        const res = await fetch(`/api/search/suggestions?${params}`);
        const data = await res.json();
        setSuggestions(data.data ?? []);
        setShowSuggestions(true);
      } catch {
        // ignore
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchCategory, searchFocused]);

  // Close suggestions / user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  function saveRecentSearch(term: string) {
    try {
      const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch { /* ignore */ }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setShowSuggestions(false);
    setSearchFocused(false);
    const q = searchQuery.trim();
    if (q) {
      saveRecentSearch(q);
      const params = new URLSearchParams({ search: q });
      if (searchCategory !== "all") params.set("category", searchCategory);
      router.push(`/products?${params}`);
    }
  }

  return (
    <>
      <header
        className={cn(
          "w-full bg-white",
          isSticky
            ? "sticky top-0 z-40 shadow-md header-sticky-animate"
            : "relative z-40"
        )}
      >
        {/* ── header-top: utility bar (desktop only) ────────────────── */}
        <div className="hidden border-b border-[#ececec] bg-[#f7f7f7] lg:block">
          <div className={CONTAINER}>
            <div className="flex h-[37px] items-center justify-between text-[13px] text-[#555]">
              <nav className="flex items-center gap-5">
                <Link href="/about" className="transition-colors hover:text-primary">
                  About
                </Link>
                <Link href="/contact" className="transition-colors hover:text-primary">
                  Contact us
                </Link>
                <Link href="/blog" className="transition-colors hover:text-primary">
                  Blog
                </Link>
                <Link
                  href="/become-vendor"
                  className="transition-colors hover:text-primary"
                >
                  Sell on Exobe
                </Link>
              </nav>
              <nav className="flex items-center gap-4">
                {session?.user ? (
                  <>
                    <span className="text-foreground font-medium">
                      Hi, {session.user.name?.split(" ")[0] ?? "there"}
                    </span>
                    <span className="text-[#ccc]">|</span>
                    <button
                      onClick={() => signOut()}
                      className="text-primary transition-colors hover:text-primary/80"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="transition-colors hover:text-primary"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="font-semibold text-primary transition-colors hover:text-primary/80"
                    >
                      Register
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </div>
        </div>

        {/* ── header-middle: logo + search + cart icons (desktop) ────── */}
        <div className="hidden border-b border-[#ececec] bg-white py-3 lg:block">
          <div className={CONTAINER}>
            <div className="flex items-center">
              {/* Logo — 17% */}
              <div className="w-[17%] shrink-0">
                <Link href="/" className="inline-flex items-center gap-2.5">
                  <Image
                    src="/exobe-logo.png"
                    alt="Exobe Africa"
                    width={45}
                    height={45}
                    priority
                    className="h-[45px] w-auto object-contain"
                  />
                  <span className="text-xl font-extrabold tracking-tight text-foreground">
                    Exobe<span className="text-primary">Africa</span>
                  </span>
                </Link>
              </div>

              {/* Search — 42.5% */}
              <div className="w-[42.5%] shrink-0" ref={searchRef}>
                <form onSubmit={handleSearch} className="relative flex">
                  {/* Category select */}
                  <div className="relative shrink-0">
                    <select
                      value={searchCategory}
                      onChange={(e) => setSearchCategory(e.target.value)}
                      className="h-[50px] appearance-none border border-r-0 border-[#ececec] bg-[#f7f7f7] pl-3 pr-7 text-[12px] font-medium text-foreground outline-none focus:border-primary focus:bg-white transition-colors cursor-pointer"
                      style={{ minWidth: "110px" }}
                    >
                      <option value="all">All Categories</option>
                      {categoriesData?.data.map((cat) => (
                        <option key={cat.id} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-[#999]" />
                  </div>

                  {/* Text input */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => { setSearchFocused(true); setShowSuggestions(true); }}
                      onBlur={() => setTimeout(() => { setSearchFocused(false); setShowSuggestions(false); }, 200)}
                      placeholder="Search for products, brands..."
                      className="h-[50px] w-full border border-[#ececec] bg-[#f7f7f7] px-4 text-[13px] text-foreground outline-none focus:border-primary focus:bg-white transition-colors"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => { setSearchQuery(""); setSuggestions([]); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-foreground"
                        aria-label="Clear search"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    aria-label="Search"
                    className="flex h-[50px] w-[52px] shrink-0 items-center justify-center bg-primary text-white transition-colors hover:bg-primary/90"
                  >
                    <Search className="size-5" />
                  </button>

                  {/* Autocomplete dropdown */}
                  {showSuggestions && (
                    <div className="search-suggestions">
                      {searchQuery.length < 2 ? (
                        /* Recent + Popular when empty */
                        <div className="px-4 py-3">
                          {recentSearches.length > 0 && (
                            <div className="mb-3">
                              <div className="mb-2 flex items-center justify-between">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-[#999]">Recent Searches</p>
                                <button
                                  type="button"
                                  onMouseDown={(e) => { e.preventDefault(); setRecentSearches([]); localStorage.removeItem(RECENT_SEARCHES_KEY); }}
                                  className="text-[11px] text-primary hover:underline"
                                >
                                  Clear All
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {recentSearches.map((term) => (
                                  <button
                                    key={term}
                                    type="button"
                                    onMouseDown={(e) => { e.preventDefault(); setSearchQuery(term); }}
                                    className="flex items-center gap-1 rounded-[3px] border border-[#ececec] bg-[#f5f5f5] px-2.5 py-1 text-[12px] text-foreground hover:border-primary hover:text-primary transition-colors"
                                  >
                                    <Search className="size-3 text-[#bbb]" />
                                    {term}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#999]">
                            Popular Searches
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {POPULAR_SEARCHES.map((term) => (
                              <button
                                key={term}
                                type="button"
                                onMouseDown={(e) => { e.preventDefault(); setSearchQuery(term); }}
                                className="rounded-[3px] border border-[#ececec] bg-[#f5f5f5] px-2.5 py-1 text-[12px] font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
                              >
                                {term}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : suggestions.length > 0 ? (
                        <>
                          <p className="px-4 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#999]">
                            Products
                          </p>
                          {suggestions.map((product) => (
                            <Link
                              key={product.id}
                              href={`/products/${product.slug}`}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => { setShowSuggestions(false); setSearchQuery(""); }}
                              className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[#f5f5f5]"
                            >
                              <div className="relative size-10 shrink-0 overflow-hidden border border-[#ececec] bg-[#f5f5f5]">
                                {product.image ? (
                                  <Image src={product.image} alt={product.name} fill className="object-cover" sizes="40px" />
                                ) : (
                                  <div className="size-full bg-muted" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-medium text-foreground">{product.name}</p>
                                <p className="text-[12px] font-bold text-primary">
                                  {formatMoney(product.price, product.currency)}
                                </p>
                              </div>
                            </Link>
                          ))}
                          <Link
                            href={`/products?search=${encodeURIComponent(searchQuery)}`}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setShowSuggestions(false)}
                            className="flex items-center justify-between border-t border-[#ececec] px-4 py-3 text-[12px] font-semibold text-primary transition-colors hover:bg-[#f5f5f5]"
                          >
                            <span>See all results for &ldquo;{searchQuery}&rdquo;</span>
                            <ChevronRight className="size-3.5" />
                          </Link>
                        </>
                      ) : (
                        <div className="px-4 py-6 text-center">
                          <p className="text-[13px] font-medium text-foreground">No results for &ldquo;{searchQuery}&rdquo;</p>
                          <p className="mt-1 text-[12px] text-[#999]">Try a different search term</p>
                        </div>
                      )}
                    </div>
                  )}
                </form>
              </div>

              {/* Right icons */}
              <div className="flex w-[40.5%] items-center justify-end gap-5 pl-6">
                {/* Account / User */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((o) => !o)}
                    aria-label="Account"
                    className="flex flex-col items-center gap-0.5 text-foreground transition-colors hover:text-primary"
                  >
                    <User className="size-[24px]" strokeWidth={1.5} />
                    <span className="hidden text-[11px] xl:block">
                      {session?.user ? (session.user.name?.split(" ")[0] ?? "Account") : "Account"}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full z-[300] mt-1 w-[200px] rounded border border-[#ececec] bg-white py-1 shadow-lg">
                      {session?.user ? (
                        <>
                          <div className="border-b border-[#ececec] px-4 py-2.5">
                            <p className="text-[13px] font-semibold text-foreground truncate">{session.user.name ?? session.user.email}</p>
                            <p className="text-[11px] text-[#999] capitalize">{(session.user.role as string ?? "customer").toLowerCase()}</p>
                          </div>
                          {(session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN") && (
                            <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-foreground hover:bg-[#f5f5f5] hover:text-primary transition-colors">
                              <LayoutDashboard className="size-4 text-primary" /> Admin Dashboard
                            </Link>
                          )}
                          {session.user.role === "VENDOR" && (
                            <>
                              <Link href="/vendor" onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-foreground hover:bg-[#f5f5f5] hover:text-primary transition-colors">
                                <Store className="size-4 text-primary" /> Vendor Dashboard
                              </Link>
                              <Link href="/vendor/products" onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-foreground hover:bg-[#f5f5f5] hover:text-primary transition-colors">
                                <Package className="size-4 text-[#999]" /> My Products
                              </Link>
                            </>
                          )}
                          {(session.user.role === "CUSTOMER" || session.user.role === "VENDOR") && (
                            <>
                              <Link href="/account" onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-foreground hover:bg-[#f5f5f5] hover:text-primary transition-colors">
                                <User className="size-4 text-[#999]" /> My Account
                              </Link>
                              <Link href="/account/orders" onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-foreground hover:bg-[#f5f5f5] hover:text-primary transition-colors">
                                <Package className="size-4 text-[#999]" /> My Orders
                              </Link>
                              <Link href="/wishlist" onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-foreground hover:bg-[#f5f5f5] hover:text-primary transition-colors">
                                <Heart className="size-4 text-[#999]" /> Wishlist
                              </Link>
                              <Link href="/account/addresses" onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-foreground hover:bg-[#f5f5f5] hover:text-primary transition-colors">
                                <MapPin className="size-4 text-[#999]" /> Addresses
                              </Link>
                              <Link href="/account/settings" onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-foreground hover:bg-[#f5f5f5] hover:text-primary transition-colors">
                                <Settings className="size-4 text-[#999]" /> Settings
                              </Link>
                            </>
                          )}
                          <div className="border-t border-[#ececec] mt-1">
                            <button
                              onClick={() => { signOut(); setUserMenuOpen(false); }}
                              className="w-full px-4 py-2 text-left text-[13px] font-semibold text-primary hover:bg-[#fff5f5] transition-colors"
                            >
                              Logout
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <Link href="/login" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-foreground hover:bg-[#f5f5f5] hover:text-primary transition-colors">
                            Login
                          </Link>
                          <Link href="/register" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-primary hover:bg-[#fff5f5] transition-colors">
                            Create Account
                          </Link>
                          <div className="border-t border-[#ececec] px-4 py-2.5">
                            <p className="text-[11px] text-[#999]">Want to sell?</p>
                            <Link href="/become-vendor" onClick={() => setUserMenuOpen(false)}
                              className="text-[12px] font-semibold text-primary hover:underline">
                              Sell on Exobe →
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Wishlist */}
                <Link
                  href="/wishlist"
                  aria-label="Wishlist"
                  className="flex flex-col items-center gap-0.5 text-foreground transition-colors hover:text-primary"
                >
                  <Heart className="size-[24px]" strokeWidth={1.5} />
                  <span className="hidden text-[11px] xl:block">Wishlist</span>
                </Link>

                {/* Cart */}
                <button
                  onClick={() => setCartOpen(true)}
                  aria-label="Open cart"
                  className="flex items-center gap-2.5 text-foreground transition-colors hover:text-primary"
                >
                  <div className="relative">
                    <ShoppingCart className="size-[24px]" strokeWidth={1.5} />
                    {itemCount > 0 && (
                      <span className="cart-item-badge">{itemCount}</span>
                    )}
                  </div>
                  <div className="hidden text-left xl:block">
                    <span className="block text-[11px] text-[#999]">Your Cart</span>
                    <span className="block text-[13px] font-bold">
                      {formatMoney(cartTotal, cartCurrency)}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── header-bottom: category menu + main nav (desktop) ───────── */}
        <div className="hidden border-b border-[#ececec] bg-white lg:block">
          <div className={CONTAINER}>
            <div className="flex h-[44px] items-center">
              <CategoryMenu />
              <nav className="ml-6 flex items-center gap-7 text-[13px] font-semibold">
                {MAIN_NAV.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "py-[10px] transition-colors hover:text-primary",
                      pathname === link.href
                        ? "text-primary"
                        : "text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* ── Mobile header ─────────────────────────────────────────── */}
        <div className="flex h-[56px] items-center justify-between border-b border-[#ececec] bg-white px-4 lg:hidden">
          <button
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center justify-center text-foreground"
          >
            <List className="size-6" />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/exobe-logo.png"
              alt="Exobe Africa"
              width={32}
              height={32}
              priority
            />
            <span className="text-base font-extrabold tracking-tight">
              Exobe<span className="text-primary">Africa</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/products" aria-label="Search" className="text-foreground">
              <Search className="size-[22px]" />
            </Link>
            <button
              aria-label="Cart"
              onClick={() => setCartOpen(true)}
              className="relative text-foreground"
            >
              <ShoppingCart className="size-[22px]" />
              {itemCount > 0 && (
                <span className="cart-item-badge" style={{ fontSize: 9, padding: "3px 4px 2px", top: -7, right: -7 }}>
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile slide-out menu ─────────────────────────────────── */}
      {mobileMenuOpen && (
        <>
          <div
            className="panel-sidebar-backdrop"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden
          />
          <div className="panel-sidebar">
            <div className="flex items-center justify-between border-b border-[#ececec] px-4 py-3.5">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                <Image src="/exobe-logo.png" alt="Exobe Africa" width={28} height={28} />
                <span className="text-sm font-extrabold">
                  Exobe<span className="text-primary">Africa</span>
                </span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="text-[#999] hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-4">
              {/* Auth state */}
              {session?.user ? (
                <div className="mb-4 rounded bg-[#f5f5f5] px-3 py-3">
                  <p className="text-[13px] font-semibold text-foreground">
                    {session.user.name ?? session.user.email}
                  </p>
                  <div className="mt-1 flex gap-4 text-[12px]">
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-primary"
                    >
                      My account
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="text-[#999]"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-4 flex gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 rounded bg-primary py-2 text-center text-[13px] font-semibold text-white"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 rounded border border-[#ececec] py-2 text-center text-[13px] font-semibold text-foreground"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Main nav */}
              <ul className="space-y-0.5 border-b border-[#ececec] pb-4">
                {MAIN_NAV.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "block rounded px-2 py-2.5 text-[13px] font-medium transition-colors hover:bg-[#f5f5f5] hover:text-primary",
                        pathname === link.href && "text-primary"
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Categories */}
              {categoriesData?.data && (
                <div className="pt-3">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#999]">
                    Shop by Department
                  </p>
                  <ul className="space-y-0.5">
                    {categoriesData.data.map((category) => {
                      const hasChildren = category.children.length > 0;
                      const isExpanded = expandedCategory === category.id;
                      return (
                        <li key={category.id}>
                          <div className="flex items-center">
                            <Link
                              href={`/categories/${category.slug}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex flex-1 items-center rounded-l px-2 py-2.5 text-[13px] transition-colors hover:bg-[#f5f5f5] hover:text-primary"
                            >
                              {category.name}
                            </Link>
                            {hasChildren && (
                              <button
                                onClick={() =>
                                  setExpandedCategory(
                                    isExpanded ? null : category.id
                                  )
                                }
                                className="rounded-r px-2 py-2.5 text-[#999] hover:bg-[#f5f5f5] hover:text-primary"
                                aria-label={
                                  isExpanded ? "Collapse" : "Expand"
                                }
                              >
                                {isExpanded ? (
                                  <ChevronDown className="size-4" />
                                ) : (
                                  <ChevronRight className="size-4" />
                                )}
                              </button>
                            )}
                          </div>
                          {hasChildren && isExpanded && (
                            <ul className="ml-4 border-l border-[#ececec] pl-3">
                              {category.children.map((child) => (
                                <li key={child.id}>
                                  <Link
                                    href={`/categories/${child.slug}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block py-2 text-[12px] text-[#666] transition-colors hover:text-primary"
                                  >
                                    {child.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <MiniCartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
