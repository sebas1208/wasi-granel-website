# 13: Shareable product links — deep-link the Quick View (no detail page)

**What to build:** A shareable per-product URL that opens that product's Quick View modal over the Tienda catalog. Deliberately **not** a standalone product detail page — the Quick View already carries everything (image gallery, price with unit, descriptions, benefits, weight/amount selection, add-to-cart), so a second full-page rendering of the same content is duplication we don't need.

**Blocked by:** 12 (closed) — the Quick View this deep-links into is already built and shipped to `develop`.

**Status:** **Done — closed 2026-10-21** (`develop` `77ab9b5`) — implemented, browser-verified, committed to `develop`. **Not in production**: this ships with the rest of the storefront when `develop` merges to `main`.

## Why the original ticket was rewritten

It described a product route with origin, nutrition, weight tiers (100/250/500/1000 g) and mock fixtures. Almost all of that is superseded by decisions taken during ticket 12:

| original requirement | status now |
| --- | --- |
| "origin" on the detail view | **dropped** — no data in the CMS, user decision |
| data from mock fixtures (ticket 03) | **superseded** — live Payload API |
| Weight Tiers 100/250/500/1000 g | **superseded** — CMS-editable option sets derived from the canonical rate, plus exact weight *or* money input |
| quick-view modal with add-to-cart | **already built** in ticket 12 |
| "a product route" | the only part still unbuilt — and the user wants it as a deep link, not a page |

## Approach — query param on the existing route, plus dynamic metadata

- **URL:** `/tienda?producto=<slug>`. Every product has a `slug` (confirmed in the API).
- `/tienda` is already a server component reading `searchParams`, so the param costs nothing architecturally.
- The server fetches the named product by slug and hands it to a page-level modal controller.
- **`generateMetadata({ searchParams })` reads the same param** and emits a product-specific `<title>` and `og:image`. This is the part that makes the link worth sharing: WhatsApp and Google get a real product preview, and we still never build a detail page.

**Rejected:** Next.js intercepting + parallel routes (`app/@modal/(.)producto/[slug]`). It is the canonical pattern for "modal on soft nav, page on hard load" — but it *requires* the full-page fallback, i.e. exactly the detail page being avoided here. Revisit only if we later want indexable, per-product pages for SEO.

**Fallback if metadata is unwanted:** the bare param alone still delivers "link opens the right modal"; drop the `generateMetadata` half and ship the rest.

## Prerequisite refactor — this is the bulk of the work

The modal is currently owned **per card**: every `CatalogCard` holds its own `modalOpen` state and renders its own `WeightModal` (`catalog-card.tsx:39,203`). On a 12-card page that is 12 modals mounted, all closed, and no single place for a URL to open one.

- Lift open/close into **one page-level client controller** holding the currently-open product; cards call up to it.
- `WeightModal` is already a controlled component (`product`, `open`, `onOpenChange`) — no rewrite needed, just a different owner.
- This also fixes an accessibility gap: the card currently opens on `<article onClick>` with no `role`, no `tabIndex` and no keyboard handler.

## Acceptance — all verified in a real browser (2026-10-21)
- [x] `/tienda?producto=<slug>` opens that product's Quick View on load, over the catalog. (Modal shows the product's name; catalog renders behind it.)
- [x] Opening from a card writes the param to the URL; back/forward navigate between open and closed; closing restores the prior URL. (Back closes, Forward reopens; a fresh deep-link visitor closing gets `router.replace`, never sent off-site.)
- [x] The link survives a hard refresh and a paste into a clean browser session. (The gate test does a full `page.goto` to the URL.)
- [x] Sharing the link produces a **product-specific preview**, not the generic catalog title. Measured on `/tienda?producto=pistachos`: `<title>` and `og:title` = "Pistachos — Wasi Granel", `og:image` = the product photo (absolute CMS URL), `canonical` = `https://www.wasigranel.com/tienda?producto=pistachos`.
- [x] An unknown or removed slug degrades gracefully: catalog renders (12 cards), no modal, no crash.
- [x] Existing filters / pagination / sort survive alongside the param. Verified: `/tienda?categoria=frutos-secos&sort=precio-asc&page=2` + open → `…&page=2&producto=ajonjoli-pelado`, close → `?categoria=frutos-secos&sort=precio-asc&page=2` exactly.
- [x] Cards are keyboard-reachable with an accessible name — `role="button"`, `tabIndex=0`, `aria-label="Ver <name>"`, Enter/Space opens. (Previously mouse-only.)
- [x] Deleted the tracked dead file `apps/web/app/tienda/page-old.tsx` (235 lines, pre-rebuild leftover).
- [x] Browser-verified per `AGENTS.md`: `check:layout` **25 passed, 1 skipped** (desktop 1280 + mobile 390), including a new deep-link gate test that derives its slug from a real card rather than hardcoding catalog data. `tsc` clean, `lint` 0 errors.

## What shipped
- **`components/tienda/quick-view.tsx` (new)** — `QuickViewProvider` owns the ONE dialog for the page and exposes `open(slug)` via context; it also owns the URL contract (push on open, Back on close, replace for deep-link visitors).
- **`catalog-card.tsx`** — no longer imports `WeightModal`; asks the provider to open the product. A 12-card page went from 12 mounted dialogs to 1 (measured: 0 `[role=dialog]` nodes in the DOM once closed).
- **`weight-modal.tsx`** — `trigger` is now optional (the URL drives the dialog); the single instance is keyed by slug so per-product state (selected option, amount input) can't leak between products.
- **`app/tienda/page.tsx`** — reads `producto`, resolves it server-side via `getProductBySlug` (works when the product is not on the current page), wraps the grid in the provider, and adds `generateMetadata` for the product-specific preview.
- **`app/layout.tsx`** — `metadataBase` so canonical/OG URLs resolve absolutely.
- **`lib/payload.ts`** — `getProductBySlug` (cached, returns null on unknown slug).

## Open questions — resolved
- **OG image host:** left pointing at `payload.wasigranel.com` (the CMS serves the files, and the host is already public). Revisit only if link previews ever fail to fetch from it.
- **Canonical:** added — `/tienda?producto=<slug>` is declared canonical, so the same product reached through different filter combinations doesn't read as duplicate content.
