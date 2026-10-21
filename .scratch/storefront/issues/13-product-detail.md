# 13: Shareable product links — deep-link the Quick View (no detail page)

**What to build:** A shareable per-product URL that opens that product's Quick View modal over the Tienda catalog. Deliberately **not** a standalone product detail page — the Quick View already carries everything (image gallery, price with unit, descriptions, benefits, weight/amount selection, add-to-cart), so a second full-page rendering of the same content is duplication we don't need.

**Blocked by:** 12 (closed) — the Quick View this deep-links into is already built and shipped to `develop`.

**Status:** ready-for-agent — re-scoped 2026-10-21 (was: "Product Detail + quick-view (weight tiers)").

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

## Acceptance
- [ ] `/tienda?producto=<slug>` opens that product's Quick View on load, over the catalog.
- [ ] Opening from a card writes the param to the URL; back/forward navigate between open and closed; closing restores the prior URL.
- [ ] The link survives a hard refresh and a paste into a clean browser session.
- [ ] Sharing the link produces a **product-specific preview** (title + image), not the generic "Tienda — Wasi Granel".
- [ ] An unknown or removed slug degrades gracefully: catalog renders, no modal, no crash.
- [ ] Existing filters / pagination / sort survive alongside the param.
- [ ] Cards are keyboard-reachable (Enter/Space opens the Quick View) with an accessible name.
- [ ] Delete the tracked dead file `apps/web/app/tienda/page-old.tsx` (235 lines, pre-rebuild leftover; not a route but still compiled and typechecked).
- [ ] Browser-verified per `AGENTS.md`: `check:layout` green at desktop 1280 + mobile 390, with a new gate test covering the deep link.

## Open questions
- OG images resolve to absolute URLs on `payload.wasigranel.com` — confirm that host is acceptable in public link previews, or proxy product images through the web domain.
- Add a canonical tag on `/tienda`? The same product is reachable via different filter combinations plus the param, which is duplicate-content-ish for crawlers.
