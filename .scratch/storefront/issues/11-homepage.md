# 11: Homepage — scalable category grid

**What to build:** Build the homepage from the Stitch screen "Variante 2: Cuadrícula Escalable de Categorías": a landing that presents the product categories as an on-brand scalable grid (per the cream + brand tokens). Replaces the current "coming soon" `app/page.tsx`. **Reads live categories/products from Payload** (local: `localhost:3001`, default prod `payload.wasigranel.com`) via `apps/web/lib/payload.ts`.

**Blocked by:** 10 (app shell), 03 (data contract/fixtures).

**Status:** implemented (feature/ticket-11-homepage, `ae2ad9a`) — awaiting visual review on Vercel preview + design source re-fetched fresh (Stitch project updated 2026-10-09).

- [x] `/` renders the category grid hero rather than the launch/newsletter page (8 sections: hero, benefits ribbon, Productos Populares, Categorías grid, Nuestra Historia, Newsletter, footer).
- [x] Each category card links toward its catalog filter (`/tienda?categoria=slug`) and uses the brand tokens/typography + Stitch classes (icon chip, "N variedades" badge, "Explorar categoría").
- [x] Matches the Stitch reference visually (structure + hierarchy), responsive (grid 1/2/4 cols).
- [x] `next build`/`next lint`/`tsc` pass; page is dynamic (live CMS fetch).

## Comments
- Stitch re-fetched (fresh) as design source of truth: hero + store photos downloaded to `apps/web/public/images/`; added `tools/stitch/refetch_pages.py`.
- Payload wire shape was the main friction: product media is nested under `images[].image` and the weight field is `weightGrams` — `lib/payload.ts` handles both.
- "Productos Populares" = products w/ photo+price, one per category (variety).
- Deferred (later ticket): horizontal carousel for Productos Populares (design shows scrollable) — current build uses a responsive grid; category hover uses brand yellow border.
- Review on Vercel preview (feature branch) — then merge feature → develop → main.
