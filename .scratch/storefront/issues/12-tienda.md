# 12: Tienda — catalog with filters and Catalog Cards

**What to build:** Build the Tienda page from "Tienda y Catálogo Interactivo y Animado" (+ "Con Carrito Lateral Interactivo" for the side-cart affordance, which is ticketed separately): a product grid of Catalog Cards with weight-tier chips and an add-to-cart action, plus a filter sidebar. Responsive desktop + mobile per the Stitch screens.

**Blocked by:** 10 (app shell), 03 (data contract/fixtures).

**Status:** implemented (browser-verified)

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
- [x] **Desktop + mobile browser pass: Playwright `check:layout` = 12/12, 3 consecutive runs green** (desktop 1280 + mobile 390). Covers sidebar+4-col desktop / stacked+2-col mobile, filter→URL hydration, modal opens + step behavior (gr=50, kg/lb=0.5). `tsc` clean, `lint` 0 errors, `next build` green (`/tienda` dynamic).

## Notes / follow-ups
- **Rebuilt to match the REAL Stitch mockups** (user: "use the real stitch mockups, not invented UI"). Re-fetched fresh (project `updateTime` 2026-10-14) and ported the actual HTML classes. Now matches: banner (badge + "Despensa Consciente a Granel" + packaging card + watermark), 12-col layout, sidebar (cat-pills **with count badges**, **price slider**, Modalidad radios, Limpiar/Restablecer), toolbar (mobile filter drawer trigger + sort dropdown + grid/list view toggle), **active filter chips** row, **3-col** grid (desktop) / **2-col** (mobile, per Catálogo Móvil), card (image + **overlay category chip** + **favorite heart** + portion chips + "Porción/price" + dark **Agregar** button), and a **mobile filter drawer**.
- Deviations still flagged: mobile **bottom nav** (in Stitch) not added — app uses the top nav globally; **price sort** not wireable (nested `purchaseOptions.price` isn't server-sortable → needs a top-level field); sidebar **Modalidad = Peso/Unidad** per your decision (Stitch's label is packaging Granel/Frasco, which appears as the banner card). Default ordering still shows unit-only products first (finding).
- Homepage layout tests were flaky under parallel workers → gate serialized (`workers: 1`) + wait for hero image + hydration before measuring (root-caused, not weakened).