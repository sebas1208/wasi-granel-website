# 11: Homepage — scalable category grid

**What to build:** Build the homepage from the Stitch screen "Variante 2: Cuadrícula Escalable de Categorías": a landing that presents the product categories as an on-brand scalable grid (per the cream + brand tokens). Replaces the current "coming soon" `app/page.tsx`. **Reads live categories/products from Payload** (local: `localhost:3001`, default prod `payload.wasigranel.com`) via `apps/web/lib/payload.ts`.

**Blocked by:** 10 (app shell), 03 (data contract/fixtures).

**Status:** implemented (feature/ticket-11-homepage, latest `7721e7b`) — **browser-verified desktop + mobile** (see acceptance below); awaiting user merge feature → develop → main.

- [x] `/` renders the category grid hero rather than the launch/newsletter page (8 sections: hero, benefits ribbon, Productos Populares, Categorías grid, Nuestra Historia, Newsletter, footer).
- [x] Each category card links toward its catalog filter (`/tienda?categoria=slug`) and uses the brand tokens/typography + Stitch classes (icon chip, "N variedades" badge, "Explorar categoría").
- [x] Matches the Stitch reference visually (structure + hierarchy), responsive (grid 1/2/4 cols).
- [x] `next build`/`next lint`/`tsc` pass; page is dynamic (live CMS fetch).
- [x] **Browser-verified** via Hermes `browser_exec`+CDP at BOTH viewports — desktop 1440×900 and mobile 390×844 (Stitch "Inicio Móvil (Variante 2)"): hero card padding (`40px` desktop / `20px` mobile), hero card overlap `-mt-36` (144px) over the 460px image, mobile full-width sticky navbar (radius 0) vs desktop floating pill, benefits desktop bar / mobile 3-col grid (computed `display` confirmed per viewport), categories 2-col mobile / 4-col desktop, embla carousel slide widths (240px desktop / 318px mobile basis).

## Comments
- Stitch re-fetched (fresh) as design source of truth: hero + store photos downloaded to `apps/web/public/images/`; added `tools/stitch/refetch_pages.py`.
- Payload wire shape was the main friction: product media is nested under `images[].image` and the weight field is `weightGrams` — `lib/payload.ts` handles both.
- "Productos Populares" = products w/ photo+price, one per category (variety). **Done in this round: embla carousel** (`embla-carousel-react@8.5.1` + `ui/carousel.tsx`): `basis-[85%] sm:1/2 md:1/3 lg:1/5`, header prev/next driven by `api.canScrollPrev/Next`, swipemble + a11y (region + slide roles, keyboard, disabled arrows).
- Deferred note: **mobile navbar is a full-width sticky bar** (NOT the floating pill — that's desktop-only), per the Inicio Móvil design which has no floating rounded nav.
- Review on Vercel preview (feature branch) — then merge feature → develop → main.

## Round 2 (review feedback)
- **Payload `popular` field** added (checkbox, sidebar) so the homepage fetches real featured products — manual migration `20261009_120000`; seed marks a curated 10 (one/category). Storefront: `getPopularProducts()` → `?where[popular][equals]=true`, with a graceful photo+price fallback while the CMS field isn't deployed.
- Icons → **Material Symbols** (navbar + homepage); nav **subline underline removed**; global **`cursor:pointer`** on buttons; hero uses a **CSS fade-up + slow bg zoom** (no scroll-hide); newsletter **btn-shimmer dropped** (clipped the label); subtler email pulse.
- Bug: the `seed:catalog` script used `payload run` which **silently no-ops** — switched to `tsx`.
- VPS: `popular` column + 10 flags applied directly to the Coolify Postgres; the CMS **app** picks up the field when this lands on `main` (Coolify redeploys only `main`).
