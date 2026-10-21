# 12: Tienda — catalog with filters and Catalog Cards

**What to build:** Build the Tienda page from "Tienda y Catálogo Interactivo y Animado" (+ "Con Carrito Lateral Interactivo" for the side-cart affordance, which is ticketed separately): a product grid of Catalog Cards with weight-tier chips and an add-to-cart action, plus a filter sidebar. Responsive desktop + mobile per the Stitch screens.

**Blocked by:** 10 (app shell), 03 (data contract/fixtures).

**Status:** **REOPENED — Tienda v2** (2026-10-20). First pass was merged to `develop` (`0432588` / merge `65af527`, pushed; CMS canonical price on `main` @ `3d9a80d`, prod backfilled 278/278), but the user's review found the price/option model and the Quick View still wrong. Scope below. Follow `check:layout` + desktop 1280 / mobile 390 browser pass as usual.

## Plan deviations agreed with the user
- **Data:** live Payload API (NOT mock fixtures) — server component reads `searchParams`, queries Payload with `where` + `limit`/`page`, uses Next.js data cache (`next: { revalidate: 60 }`). No client-side load-all.
- **Filters:** **Categorías + Rango de Precio + Modalidad (Peso/Unidad)** only. **Origen + Certificación dropped** (no real data in CMS; Stitch invented them — maybe later).
- **Pagination:** Payload `limit`+`page`, URL-driven (`?page=`), resets on filter change.
- **Custom weight/unit modal (new scope):** a card's customize icon opens a modal to pick exact weight + unit (**gr steps 50g; kg/lb step 0.5 / halves**), or the unit option for unit-only products. Price = per-100g rate × chosen weight. Prepares the selection for add-to-cart.
- **Add-to-cart:** visual placeholder (real cart = ticket 14).

## Acceptance
- [x] `/tienda` lists products as Catalog Cards (image, name, weight-tier chips, price, add-to-cart).
- [x] Filter sidebar filters by category, price range, and modality (origin/certification deferred — no data).
- [x] A Catalog Card's quick weight-tier chips let a bulk product be selected by tier (+ custom weight/unit modal).
- [x] Pagination + skeleton loading component.
- [x] Matches the Stitch desktop + Catálogo Móvil references; `next build`/`next lint` pass.
- [x] **Desktop + mobile browser pass: Playwright `check:layout` = 16/16 green** (desktop 1280 + mobile 390), re-run green on the merged tree. Covers the homepage suite plus tienda sidebar+3-col desktop / drawer+2-col mobile, filter→URL hydration, modal open+close, canonical price sort, and the loading-state banner (no skeleton flash, no vertical shift). `tsc` clean, `lint` 0 errors, `next build` green (`/tienda` dynamic).
- [x] Canonical price live in production: prod CMS has `price`/`price_unit`; prod catalog backfilled **278/278** (154 /lb, 124 /unidad).

## Tienda v2 scope (reopened 2026-10-20)

Stitch project was **refreshed 2026-10-20T22:58Z** — the copies ported in the first pass were from 10-13 and are stale. All work below is against the re-fetched screens (`Modal Detalle de Producto (Quick View)` `805f63cd`, `Tienda…` `7d45faa1`, `Catálogo Móvil` `5a0b1024`).

**What the review found**
- The canonical `price` / `priceUnit` is not surfaced: design shows a unit rate (móvil card `$4.50 / 100g`; Quick View `$3.80 / 100g` + a `$38.00 / kg` badge), we show `$5.99 /lb` under a "Unidad"/"Porción" label.
- The Quick View **cannot customize weight when a product has no `weight`-kind option** — "Almendras" only has a `unit` option (`½ Libra`, $3), so buying 600 g is impossible even though the canonical rate ($5.99/lb) can compute it. The weight branch is gated on `weightTiers.length > 0` instead of on the canonical unit.
- Modal drifted from the refreshed Quick View (missing qty stepper, trust strip, close button styling; no `Aplicar` flow).
- Descriptions unusable as card copy: median 115 chars but max 6351, 47 contain markdown headings, 136 mention benefits; no short marketing line exists.
- Design blocks with **no data**: origen (empty on all 278), rating/reviews, certifications, packaging.

**Decisions (user)**
- **Drop origen** everywhere (modal tag, sidebar) — no data.
- **Drop rating** — no data.
- Unit labels: **lb** (never "libra"), plus **kg**, **g**, **unidad**.
- Weight-priced products must offer **lb / kg / g**; **minimum purchase 50 g** (never 1 g); gr step 50, kg/lb step 0.5.
- Quantity: n× the same option (stepper) **and** several different options as separate cart lines.
- **"Beneficios Clave" is extracted from the description.**
- **A short marketing description is required** per product.
- **Create the option sets**: e.g. Almendras → `1 lb`, `½ lb`, `500 g`, `1 kg`, `$1`.
- **Remove the "Empaque Eco" block** from the modal (packaging belongs to the cart, ticket 14).
- **Those option sets are DEFAULTS, not hardcoded**: the parents must be able to add/remove options per product later, so the option list is **CMS data** (seeded from the default template by a script) while prices always derive from the canonical rate. An empty list falls back to the computed defaults.
- **"Gramaje exacto" is not grams-only** — it accepts an exact **weight in g / lb / kg** *or* an exact **money amount** ("$10 de almendras"). Money input must clear the 50 g floor (min = 50 g × rate); no 1-g sales.
- **Unit-priced products take a plain numeric quantity input** — no preset pills, just "how many".
- **`$1` preset is omitted when it buys < 50 g** (expensive products: the 50 g price is the floor instead).
- **AI writes the copy**: `shortDescription`, a **rewritten clean `description`** (today's text is scraped and badly formatted) and `benefits`, for all 278 — drafts reviewed before writing to the CMS.

**Change list**
1. **CMS** — add `shortDescription` (text) and `benefits` (array of text) to Products; migration + prod deploy (idempotent, see runbook); seed scripts (benefits extracted from descriptions; short descriptions seeded/drafted).
2. **`lib/payload.ts`** — canonical → option set per unit type; minimums; equivalent rates (per 100 g / per kg); unit-label helper (`lb|kg|g|unidad`). Storefront stops gating on legacy `purchaseOptions`.
3. **`weight-modal.tsx`** — rebuild to the refreshed Quick View: image + category chip + favorite (no origen, no rating), title, price + `/unit` + equivalent badge, short + long description (clamped behind "Leer más"), Beneficios Clave (only when present), "Selecciona el peso" pills (always available for weight-priced products), "Gramaje exacto" + `Aplicar`, qty stepper, "Agregar a mi canasta", trust strip (Envíos 24h / Cero Plástico / Trato Justo); **no empaque**.
4. **`catalog-card.tsx`** — short description as the card copy; canonical-rate price display (móvil convention `$X / 100g`); derived option chips, deduped, each showing its price; drop the "Unidad: ½ Libra" free-text label.
5. **Tests** — extend `e2e/layout.spec.ts`: canonical rate visible; option math (`600 g` price = 600 × rate); 50 g floor; chips deduped; no empaque/origen/rating blocks; qty stepper; both viewports.

**Copy automation (built 2026-10-20)**
- `apps/cms/scripts/generate-product-copy.ts` — resumable, batched LLM generation of `shortDescription` + rewritten `description` + `benefits`.
  - Run: `set -a; . ~/.hermes/.env; set +a; pnpm --filter @wasi-granel/cms exec tsx scripts/generate-product-copy.ts --batch 10` (flags: `--limit`, `--model`, `--out`, `--force`, `--dry-run`).
  - Model default **`deepseek/deepseek-chat-v3.1`** ($0.25/$0.95 per M — good/cheap; overridable). Whole catalog ≈ $0.10–0.20.
  - Batches 10 products per call, appends each batch to `.scratch/storefront/copy/drafts.jsonl` immediately (survives interruption), skips products already at the current prompt version (`pv`), and **feeds a prior draft back in as "borrador previo"** when regenerating. Retries a batch 3× and continues if one fails.
  - Prompt rules: Spanish (Ecuador); only source-supported facts; **factual nutrition allowed** ("buena fuente de vitamina E", "grasas monoinsaturadas favorables para el corazón") but **no cure/treatment/prevention claims**; `description` 700–1100 chars (intro + 4–6 bullets on their own lines + closing line); `shortDescription` ≤110 chars; 3 benefits ≤80 chars.
- Pending: **apply step** — a script that writes the drafts into the CMS (`shortDescription` + `benefits` fields) once the schema migration is deployed; reviews go through the admin.
- **Final run (2026-10-21): 278/278 drafts at `pv=v4`.** Compliance gate clean (0 banned health claims after auto-rewrites + drops), `description` 900–1927 chars (median 1374), `shortDescription` ≤110 enforced in code, 3 benefits each. ~2–5 min and ≈$0.25 per full pass (gemini-2.5-flash, 10 products/call, 3 concurrent). Pipeline order: generate → compliance gate (rewrite, else drop) → hard limits + expansion pass → **compliance gate again** → trim → write. Unvetted copy never reaches the file.

**Revised change list (after the second round of decisions)**
1. **Copy spike (AI)** — generate `shortDescription` + rewritten `description` + `benefits` drafts for all 278 from the existing text; user reviews samples first. Rules: Spanish (Ecuador), warm and concrete, **no invented facts** (only what the source text supports), no medical/health promises.
2. **CMS** — add `shortDescription` (text) + `benefits` (array) to Products; keep `purchaseOptions` as the **editable option list** (seed the default template per product via script); idempotent migration → prod deploy.
3. **`lib/payload.ts`** — canonical-rate math (price per option amount), unit labels `lb|kg|g|unidad`, 50 g floor, money↔grams conversion, default-template fallback.
4. **`weight-modal.tsx`** — refreshed Quick View: image + category + favorite (no origen/rating), title, price + `/unit` + equivalent badge, short + long description (clamped), Beneficios Clave (when present), preset pills (from the product's option list; always available for weight-priced products), **exact-amount row accepting weight OR money**, unit-priced products get a numeric quantity input, "Agregar a mi canasta", trust strip; **no empaque**.
5. **`catalog-card.tsx`** — short description as copy; canonical-rate price (móvil `$X / 100g`); option chips from the option list, deduped, priced.
6. **Tests** — canonical rate visible; option math (600 g = 600 × rate; $10 → grams); 50 g floor; money-below-floor rejected; chips deduped; no empaque/origen/rating; numeric qty for unit products; both viewports.

**Resolved:** origen → dropped (no data). Rating → dropped (no data). Units → `lb`/`kg`/`g`/`unidad`, never "libra". Options → CMS-editable defaults. Unit products → numeric quantity. Copy → AI-drafted, reviewed.

## Notes / follow-ups
- **Rebuilt to match the REAL Stitch mockups** (user: "use the real stitch mockups, not invented UI"). Re-fetched fresh (project `updateTime` 2026-10-14) and ported the actual HTML classes. Now matches: banner (badge + "Despensa Consciente a Granel" + packaging card + watermark), 12-col layout, sidebar (cat-pills **with count badges**, **price slider**, Modalidad radios, Limpiar/Restablecer), toolbar (mobile filter drawer trigger + sort dropdown + grid/list view toggle), **active filter chips** row, **3-col** grid (desktop) / **2-col** (mobile, per Catálogo Móvil), card (image + **overlay category chip** + **favorite heart** + portion chips + "Porción/price" + dark **Agregar** button), and a **mobile filter drawer**.
- Deviations still flagged: mobile **bottom nav** (in Stitch) not added — app uses the top nav globally; sidebar **Modalidad = Peso/Unidad** per your decision (Stitch's label is packaging Granel/Frasco); the inert banner "Modalidad de empaque" card was **removed** (packaging belongs to the cart, ticket 14).
- **Resolved since first pass:** price sort now works — `products.price` is a top-level canonical field (`PriceUnit` = lb/kg/gr/unidad) that options derive from, so `sort=price` is server-sortable. Default ordering is `-popular,name` (newest findings no longer show unit-only products first).
- `apps/cms/AGENTS.md` + `apps/cms/CLAUDE.md` are generated by `next dev` and left untracked on purpose (not part of the ticket).
- Homepage layout tests were flaky under parallel workers → gate serialized (`workers: 1`) + wait for hero image + hydration before measuring (root-caused, not weakened).