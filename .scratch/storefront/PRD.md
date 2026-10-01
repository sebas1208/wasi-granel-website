# PRD — Wasi Granel Storefront

## Problem Statement

Wasi Granel's customer-facing site is still a "coming soon" placeholder (`app/page.tsx`), with `/tienda` and `/contacto` as empty stubs. The store needs a real storefront — homepage, catalog, product detail, cart, and contact — built from the Google Stitch "Wasi Granel" designs and backed by a Payload CMS catalog (ADR-0001), so it can sell its bulk products online.

## Solution

Build the storefront in the existing Next.js app (Next 16 + Tailwind v4 + shadcn/ui), one page per tracer-bullet slice, from the Stitch designs. The catalog (products + categories + bulk weight tiers) is extracted from the existing prose catalog document and reconciled with Dolibarr (before it is sunset), then loaded into Payload CMS, which the storefront reads via ISR. Enablement tickets (design tokens, brand assets, and a shared data contract with mock fixtures) land first so the frontend and Payload tracks can proceed in parallel.

## User Stories

1. As a customer, I want to land on a homepage that shows the product categories, so that I can find what I'm looking for at a glance.
2. As a customer, I want a clear, on-brand navigation and footer, so that I can move between Inicio, Tienda, and Contacto easily.
3. As a customer, I want to browse the catalog (Tienda), so that I can see the range of bulk products the store sells.
4. As a customer, I want to filter the catalog by category, price range, origin/certification, and purchase modality, so that I can narrow down to what I need.
5. As a customer, I want each product shown as a Catalog Card with its weight tiers, so that I can see at a glance how it's sold.
6. As a customer, I want a Product Detail Page with photograph, origin, nutritional notes, and usage suggestions, so that I can make an informed choice.
7. As a customer, I want to pick a weight tier (100/250/500/1000 g) for a bulk product, so that I buy exactly the amount I need.
8. As a customer, I want to add products to a cart with my chosen weight tier and quantity, so that I can collect an order.
9. As a customer, I want to see my cart (side cart), so that I can review and adjust before checking out.
10. As a customer, I want to see the store's locations and contact channels (WhatsApp, email) on the Contacto page, so that I know where and how to reach the store.
11. As a customer, I want the site to be fully responsive, so that it works on mobile as designed in the Stitch mobile screens.
12. As a store owner, I want products and categories managed in a CMS (Payload), so that I can update the catalog without code changes.
13. As a store owner, I want the entire current catalog migrated out of the legacy document and Dolibarr, so that nothing is lost when Dolibarr is sunset.

## Implementation Decisions

- **Homepage** is the Stitch screen "Wasi Granel - Variante 2: Cuadrícula Escalable de Categorías" (a scalable category grid); the old "coming soon" launch page is retired.
- **Palette** is cream background (`#fff8f4`) plus the brand tokens: Amarillo Wasi `#FCBF00` (primary), Marrón Café `#544738` (foreground), Gris Cálido `#A08D7F`, Arena `#C1B1A3`. Fonts: Fredoka (titles) + Zalando Sans (body). This resolves the manual's "pure white" vs the Stitch-rendered cream in favor of cream.
- **Pages are rebuilt in Tailwind/React** from the Stitch designs (screenshots + HTML as visual reference), not by porting Stitch's raw HTML — which would not map to the shadcn/Radix component stack and would become maintenance debt.
- **Responsive is a single codebase**; the Stitch mobile screens (Catálogo Móvil, Inicio Móvil, Contacto Móvil, Versión Interactiva) are the small-breakpoint reference.
- **Catalog sources**: the prose catalog at `~/Documents/Projects/Wasi Granel/Información para catálogo.docx` (99.7 MB, prose + images, no tables) and **Dolibarr** (ERP, to be sunset). Both are migration sources; **Payload** becomes the canonical store.
- **Shared data contract** (TypeScript types + Zod schemas + mock fixtures) is authored first so frontend and Payload collections share one shape and the frontend is not blocked on live data.
- **Monorepo (Turborepo)**: the `wasi-granel` repo is restructured into a pnpm-workspace monorepo with `apps/web` (storefront), `apps/cms` (Payload), and `packages/schema` (the shared data contract), so frontend and Payload consume one source of truth for schemas.
- **Media serving**: media is served from the VPS origin with a CDN (e.g. Cloudflare) in front so images deliver from the edge at Vercel-comparable speed; storefront data itself is CDN-cached by Vercel ISR regardless of Payload's location.
- **Payload CMS** is provisioned headless on the VPS (ADR-0001); provisioning method (Coolify vs. server credentials) is still to be chosen by the owner.
- Existing code issues to fix as part of the shell: `components/navigation.tsx` still brands the site "JatunWasi" and uses the wrong font.

## Testing Decisions

- Test through seams at the page/component boundary (what the user sees and can do), not implementation internals.
- Data-migration tickets are verified by `docx_validate`-style sanity checks plus round-trip re-reads; the reconcile ticket is verified by a diff/report of the merged catalog.
- Payload collections are verified by round-tripping the canonical catalog through the API and re-reading it back.
- Frontend slices are verified by running `next build`/`next lint` and manual/visual check against the reference screenshots. No new test framework is introduced yet; use existing `scripts/` and lint tooling.

## Out of Scope (for now)

- The Order → WhatsApp fulfillment/Lead lifecycle: visual cart only for the first pass; persistence and the "Enviar por WhatsApp" handoff is a later feature that needs Payload.
- Payments (Efectivo / Transferencia / DeUna) — handled offline in chat, out of web scope.
- Custom admin-panel UX beyond Payload's default admin.
- Dolibarr retirement of non-product data (customers, invoices, etc.); this effort only migrates the product catalog.

## Further Notes

- The Stitch "Wasi Granel" project (`projects/10706837740675934987`) was fetched to `.scratch/stitch-fetch/` (screens as HTML+screenshot, plus logos and imagery) — the reference source during implementation.
- The domain glossary (`CONTEXT.md`) is missing the concepts **Category** and **Sucursal (store location)**; these should be added as part of the catalog/tickets work.
- Stitch screens referenced: "Variante 2: Cuadrícula Escalable de Categorías" (homepage), "Tienda y Catálogo Interactivo y Animado" + "Con Carrito Lateral Interactivo" (Tienda), "Modal Detalle de Producto (Quick View)" (detail), "Contacto y Sucursales" + mobile variants.
