# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `apps/web/`:

```bash
npm run dev          # Next.js dev server (Turbopack, http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:push      # Push schema to DB without migrations (dev only)
npm run db:seed      # Seed demo data (categories, products, admin/vendor/customer accounts)
node_modules/.bin/tsc --noEmit   # TypeScript check (use this, not npx tsc)
```

The root `package.json` at `exobe-platform/` proxies `npm run dev` and `npm run db:push`.

PostgreSQL via Docker: `docker compose up -d` from `exobe-platform/` (starts `postgres` on port 5432, database `exobe_platform`).

## Environment

Copy `.env.example` to `.env`. Required:
- `DATABASE_URL` — Postgres connection string
- `AUTH_SECRET` — NextAuth JWT secret (any random string for dev)

Optional (gateways won't work without them):
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY`, `PAYFAST_PASSPHRASE`
- `YOCO_SECRET_KEY`, `YOCO_PUBLIC_KEY`
- `GOOGLE_CLIENT_ID/SECRET`, `FACEBOOK_CLIENT_ID/SECRET`

Seed accounts (all password `password123`):
- `superadmin@exobe.africa` — SUPER_ADMIN
- `admin@exobe.africa` — ADMIN
- `vendor@exobe.africa` — approved vendor (store: Thandiwe's Market)
- `demo@exobe.africa` — customer

## Architecture

**Next.js 16 App Router** monorepo at `apps/web`. Server components fetch Prisma directly; client components use TanStack Query + API routes. No dedicated API layer or tRPC — the boundary is `"use client"`.

### Identity & Auth

Two completely separate identity types sharing one credentials provider:

- **Admin** (`admins` table) — roles `ADMIN | SUPER_ADMIN`, manages the platform
- **Customer** (`customers` table) — roles `CUSTOMER | VENDOR`, shops or sells

Both authenticate through `POST /api/auth/[...nextauth]`. `auth.ts` tries admin first, then customer. The JWT carries `customerId` (the DB ID, regardless of entity type) and `role`. `src/auth.config.ts` is the edge-safe subset imported by middleware; `src/auth.ts` adds Prisma/bcrypt and must **never** be imported from edge routes.

A customer with `isVendor: true` gets role `VENDOR` and owns a `Store`. OAuth providers (Google, Facebook) always resolve to `Customer` records.

### Route Protection (`middleware.ts`)

- `/admin/*` → `ADMIN` or `SUPER_ADMIN` only, else redirect to login
- `/vendor/*` → `VENDOR` only, else redirect to `/become-vendor`
- `/account/*`, `/wishlist/*` → any authenticated user

### Data Layer

Prisma client is generated to `src/generated/prisma/` (not the default location). Always import from there:
```ts
import { PrismaClient } from "@/generated/prisma/client";
```
The singleton is at `src/lib/prisma.ts`. After editing `prisma/schema.prisma`, run `npm run db:generate` then `npm run db:push`.

### API Conventions

All API routes follow this pattern:
```ts
import { requireSession } from "@/lib/auth-helpers";   // or requireVendor / requireAdmin
import { handleApiError, apiError, parsePagination } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;
    // ... Prisma query ...
    return NextResponse.json({ data: ... });
  } catch (err) {
    return handleApiError(err);  // ZodError → 422, unknown → 500
  }
}
```

Zod schemas for request bodies live in `src/lib/validations/`. Client-side fetching uses `apiFetch` from `src/lib/api/client.ts`, which throws `ApiError` on non-2xx.

### Client-Side State & Hooks (`src/hooks/`)

TanStack Query wraps all server state. Hooks are domain-grouped:

| Hook file | What it manages |
|-----------|----------------|
| `use-cart.ts` | `useCart`, `useAddToCart`, `useUpdateCartItem`, `useRemoveCartItem` |
| `use-products.ts` | `useProducts(filters)`, `useProduct(slug)`, `useCategories`, `useBrands` |
| `use-wishlist.ts` | `useWishlist`, `useIsWishlisted(productId)`, `useToggleWishlist` |
| `use-vendor.ts` | Store management, products, coupons, wallet, withdrawals |
| `use-admin.ts` | Vendor approvals, product moderation, withdrawal management |
| `use-compare.ts` | Client-only product comparison (no server state) |

All hooks use the shared `apiFetch` → `ApiError` pattern. Query keys follow `["domain", "sub", ...params]`.

### Cart Architecture

Cart identity is resolved in `src/lib/cart.ts`:
- **Logged-in user**: items keyed by `customerId` in `CartItem` table
- **Guest**: items keyed by `sessionToken` from `exobe_guest_cart` httpOnly cookie (30-day TTL)
- Guest cart merges into user cart on login (handled by the auth callback)

`loadCart(identity)` returns a serialized `Cart` object with computed `unitPrice`, `lineTotal`, and `subtotal` via `effectivePrice()`.

### Payment Gateways (`src/lib/payments/`)

All implement `PaymentGateway` from `types.ts`. `index.ts` selects by `PaymentProvider` enum:
- `stripe-gateway.ts` — Checkout Session redirect
- `payfast-gateway.ts` — Auto-submitted form POST (South Africa)
- `yoco-gateway.ts` — Redirect (South Africa)
- `manual-eft-gateway.ts` — Manual bank transfer

Webhook handlers at `/api/webhooks/{stripe,payfast,yoco}` call `creditStoresForOrder()` on confirmation.

### Vendor/Marketplace Logic

- `src/lib/commission.ts` — `PLATFORM_COMMISSION_RATE = 0.10`, `MIN_WITHDRAWAL_AMOUNT = 200`
- `src/lib/wallet.ts` — `creditStoresForOrder()`: credits each vendor's `VendorWallet` transactionally
- `src/lib/moderation.ts` — `checkProductForApproval()`: pre-validation before admin review
- `src/lib/pricing.ts` — `effectivePrice()`: resolves base/sale price with date windowing
- `src/lib/orders.ts` — order number generation and status transition helpers

### Key Shared Utilities

- `src/lib/format.ts` — `formatMoney(amount, currency?)`: ZAR-default Intl formatter
- `src/lib/layout.ts` — `CONTAINER = "mx-auto w-full max-w-[1650px] px-4"` — use on every page wrapper
- `src/lib/utils.ts` — `cn(...)`: clsx + tailwind-merge combiner
- `src/lib/slug.ts` — `generateSlug()`: used when creating products/stores
- `src/lib/audit.ts` — `logAudit()`: writes to `audit_logs` table
- `src/lib/api/types.ts` — shared TypeScript types (`ProductSummary`, `ProductDetail`, `Cart`, `CartItem`, `Category`, `Brand`, `PaginatedResponse`)
- `src/lib/account-lockout.ts` — brute-force protection shared by both auth paths
- `src/lib/api-response.ts` — `parsePagination(searchParams)`: page/perPage from URL params

### Design System

**Font**: Mulish (loaded via `next/font/google`, exposed as `--font-mulish` CSS variable).

**Brand palette** (defined as CSS variables in `src/app/globals.css`):

| Token | Value | Use |
|-------|-------|-----|
| `--primary` | `#D90429` | Buttons, accents, hover states |
| `--secondary` | `#1A1A1A` | Dark elements |
| `--background` | `#F5F5F5` | Page bg |
| `--foreground` | `#000000` | Body text |
| `--border` | `#ECECEC` | Card/input borders |

**No blue/indigo/sky/Tailwind-default-blue anywhere in the UI.** Product titles use `#09f` (Farmart convention), but all interactive elements, buttons, and labels use black/red/white only.

**Tailwind 4** — no `tailwind.config.ts`. All customisation is in `globals.css` under `@theme inline { ... }`. CSS variables are mapped to Tailwind tokens there.

**Farmart CSS classes** (defined in `globals.css`, used by `ProductCard`):
- `.farmart-product-inner` — card wrapper with hover border reveal
- `.farmart-product-thumbnail` — image area
- `.farmart-product-actions` — side action buttons (eye/heart/compare), slide in on hover
- `.farmart-action-btn` — individual 34×34 action button, red on hover
- `.farmart-product-bottom` — hidden add-to-cart bar that appears below card on hover
- `.farmart-product-grid` — `grid grid-cols-2 gap-0 border border-[#ececec]`, needs `overflow: visible`
- `.farmart-section-title` — section heading with red bottom border underline
- `.search-suggestions` — absolute dropdown below the search bar
- `.category-mega-menu` / `.category-mega-menu-item` / `.category-mega-submenu` — header category panel

### Next.js Specifics

- **Turbopack** is the dev bundler (configured via `turbopack.root` in `next.config.ts`)
- `params` and `searchParams` in App Router server components are `Promise<{...}>` — always `await` them
- `export const revalidate = 60` on cached server pages; `export const dynamic = "force-dynamic"` on dashboards
- `src/app/layout.tsx` wraps everything in `<Providers>` (SessionProvider + QueryProvider) and renders `SiteHeader`, `SiteFooter`, `MobileTabBar`, `NewsletterPopup`

### Image Hostnames

Allowlisted in `next.config.ts`: `picsum.photos`, `fastly.picsum.photos`, `images.unsplash.com`. Add new external domains there before using `next/image`.

### Session Role Routing

| Role | Entity | Accesses |
|------|--------|---------|
| `CUSTOMER` | Customer | `/account`, `/wishlist`, storefront |
| `VENDOR` | Customer (`isVendor=true`) | Above + `/vendor/*` |
| `ADMIN` | Admin | `/admin/*` |
| `SUPER_ADMIN` | Admin | `/admin/*` |
