# Exobe Platform

Next.js replacement for the Botble-based "Farmart" Laravel marketplace, rebuilt for Exobe Africa.

This repo currently covers the **first vertical slice**: catalog browsing, cart, checkout, and customer
authentication. Vendor dashboard, admin panel, and the remaining Botble plugins (blog, FAQ, marketing,
payouts, etc.) are tracked in `../MIGRATION_REPORT_PHASE1.md` and will be built out as additional slices.

## Structure

```
apps/
  web/      Next.js 16 App Router app (frontend + API route handlers + Prisma schema)
  api/      placeholder — Option A (Next.js full-stack) was chosen, so this stays empty
            unless a standalone NestJS service becomes necessary later
packages/
  ui/       shared shadcn/ui components + Exobe design tokens
  types/    shared TypeScript types/DTOs
  config/   shared eslint/tsconfig base configs
  utils/    shared utility functions
```

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4 + shadcn/ui, themed with the Exobe palette (`apps/web/src/app/globals.css`)
- Prisma 7 + PostgreSQL (driver adapter: `@prisma/adapter-pg`)
- Auth.js (NextAuth v5): credentials (email/password) + Google/Facebook OAuth, JWT sessions
- TanStack React Query for client-side data fetching, Zod for validation
- Stripe Checkout for payments (PayFast/Yoco are stubbed — see Known gaps below)

## Getting started

```bash
npm install
cp apps/web/.env.example apps/web/.env   # fill in secrets as needed
docker compose up -d                     # local Postgres on :5432
npm run db:push                          # apply prisma/schema.prisma
npm run db:seed                          # demo categories/products/customer
npm run dev                              # http://localhost:3000
```

Demo login after seeding: `demo@exobe.africa` / `password123`.

## Environment variables

See `apps/web/.env.example`. At minimum you need `DATABASE_URL` and `AUTH_SECRET` to run locally.
OAuth (`GOOGLE_CLIENT_ID`/`FACEBOOK_CLIENT_ID`) and payment provider keys are optional for local dev —
features that depend on them degrade gracefully (OAuth buttons just won't authenticate; Stripe checkout
requires `STRIPE_SECRET_KEY` to be set).

## Deployment (Vercel)

1. Import the repo into Vercel, set **Root Directory** to `apps/web` (Vercel auto-detects the npm
   workspace and installs from the repo root).
2. Set the environment variables from `.env.example` in the Vercel project settings, pointing
   `DATABASE_URL` at your production Postgres instance (e.g. Neon, Supabase, or Vercel Postgres).
3. Add a Stripe webhook endpoint pointing at `/api/webhooks/stripe` with the `checkout.session.completed`
   event, and set `STRIPE_WEBHOOK_SECRET` accordingly.
4. `apps/web/vercel.json` runs `prisma generate` as part of the build command; run `prisma db push` (or a
   proper migration) against the production database separately before first deploy.

CI (`.github/workflows/ci.yml`) runs lint, typecheck, and build against an ephemeral Postgres service on
every push/PR.

## Known gaps in this slice

- **PayFast and Yoco are not yet integrated** — the checkout API accepts them as a `paymentProvider` value
  but returns `501 Not Implemented` with the order left `PENDING`/`UNPAID`. Only Stripe Checkout is wired
  up end-to-end (session creation + webhook confirmation).
- **Checkout requires a signed-in customer** — guest checkout isn't implemented in this slice (the audited
  Laravel app supports both); `Order.customerId` is required by the current schema.
- Vendor/marketplace features (stores, payouts, commissions), the admin panel, and supporting plugins
  (blog, FAQ, newsletter, etc.) are scoped for later slices per `../MIGRATION_REPORT_PHASE1.md`.
