# 14: Side cart — drawer on desktop, full-screen on mobile

**What to build:** The cart, from the two Stitch screens: **"Con Carrito Lateral Interactivo"** (desktop, a side drawer) and **"Carrito Consciente Móvil"** (mobile, a full page). Real lines produced by the add-to-cart actions of tickets 12/13, quantity steppers, line removal, live totals, and the navbar badge wired to real state.

**Blocked by:** 13 (closed — add-to-cart already produces real cart lines).

**Status:** **Done — closed 2026-10-21** (`develop` `258eccf`) — implemented and browser-verified. **Not in production**: ships with the rest of the storefront when `develop` merges to `main`.

## Design references (refetched 2026-10-21, `updateTime` current)
- Desktop: `.scratch/stitch-fetch/screens/wasi-granel-con-carrito-lateral-interactivo__5b04fb21.html`
- Mobile: `.scratch/stitch-fetch/screens/wasi-granel-carrito-consciente-m-vil__188d0cf7.html` (generated later, at the user's request)

Both are the source of truth. Where the mockups show something we have no data for, the adaptation is recorded below.

## Agreed scope

| mockup element | decision |
| --- | --- |
| Drawer (desktop) / full page (mobile) | **Build both, responsively**: side drawer `max-w-[460px]` from lg; full-screen on mobile using the mobile mockup's card styling. |
| Lines: image, category, name, delete, stepper, line price | **Build** — this is the core. |
| Navbar cart badge + counter | **Build** — wire the real count (today it is `const cartCount = 0`, hardcoded, and the cart button links to `/tienda`). |
| Packaging — per-line label ("Frasco de Vidrio Retornable (500g)") **and** the cart-level "Envases Retornables Wasi" toggle + $1.00 fee | **Removed** (user decision, consistent with ticket 12). No packaging data exists in the CMS anyway (0/278 products carry a packaging field). |
| Tax — "Impuestos locales incluidos" | **Removed.** `taxRate` is null on all 278 products, so there is nothing to show. |
| Free-shipping progress bar ("¡Te faltan $8.50 para Envío Gratis!", 72%, zone note) | **Built but gated OFF and left unconnected** (user decision — not shipping with it). The component exists behind a flag, takes the threshold as a prop, and renders nothing. The threshold is still an unset business number — see ticket 23. |
| "Continuar a Checkout" CTA | **Not functional in this ticket.** Checkout is **ticket 23** (orders + WhatsApp handoff + payment method), built after this one. |
| "Continuar explorando la despensa" | Build — closes the drawer / returns to the catalog. |
| Mobile bottom nav (Inicio / Tienda / Carrito / Perfil) | **Not built** — the app uses the top nav everywhere (deviation already flagged in ticket 12). Revisit with ticket 23. |

## Change list
1. **`lib/cart.ts`** — add `updateQty(id, qty)` and `removeLine(id)`. The store already has `CartLine`, `addToCart` (dedupes by product + option), `clearCart`, `cartTotal`, `cartCount`, `useCartLines`, `useCartCount`, `onCartAdd` and localStorage persistence.
2. **`CartProvider`** (new, client) — mounted **once in the root layout** so the drawer is global; owns the open state and renders `<CartDrawer>` + `<CartToast>`. Removes the current per-page `<CartToast />`. The drawer renders as a **portal sibling**, never inside the navbar button — an overlay nested in a clickable parent re-opens on close (portal events bubble through the React tree).
3. **`CartDrawer`** (new) — on the existing Radix `components/ui/sheet.tsx` (`side="right"`), which brings the focus trap, Escape handling, overlay and portal for free. Styled to the mockups; full-screen on mobile.
4. **`FreeShippingBar`** (new) — built to the mockup, gated off (see table).
5. **`components/navigation.tsx`** — real badge count, cart button opens the drawer (desktop and the mobile panel).
6. **Empty state** — not in either mockup; design one (icon + "Tu carrito está vacío" + a link back to `/tienda`).
7. **Tests** — extend `e2e/layout.spec.ts`: drawer opens/closes (Escape and the X), a card add produces a line, stepper and remove update it, totals and the badge update live, state survives navigation, empty state renders; desktop 1280 + mobile 390.

**Not URL-driven, deliberately.** The `url-driven-overlays` skill applies to overlays that must be *shareable*; nobody shares their cart. Local state is the right call here.

## Acceptance — all verified in a real browser (2026-10-21)
- [x] The cart opens from the navbar and lists lines with product, chosen option, quantity and line subtotal. (Measured: line "Ajonjoli Cáscara", option "1 lb", qty 1, line total $3.00, subtotal $3.00.)
- [x] Quantities can be adjusted and lines removed; totals and the navbar badge update live. (Stepper + → qty 2, line $6.00, badge 2; stepper − → back to 1; delete → line gone.)
- [x] Cart state survives navigation within the session **and a full reload**. (Reload with 1 line: badge still 1, line still present with its option. Navigation off the catalog also keeps it — the drawer is mounted at the root.)
- [x] The cart is demonstrably populated by the real add-to-cart actions of tickets 12/13 — the test clicks the card's own `Agregar`, no seeded data.
- [x] No packaging, no tax line, no free-shipping bar anywhere in the rendered cart — asserted against the drawer's text, not eyeballed.
- [x] Empty state renders correctly (icon, copy, "Ir a la tienda"); the badge disappears with the last line.
- [x] Browser-verified per `AGENTS.md`: `check:layout` **27 passed, 1 skipped** (desktop 1280 + mobile 390), including a new cart test that drives the real add path and asserts the live stepper, badge, empty state, availability off the catalog, and the three exclusions.
- [x] `tsc` clean; `lint` 0 errors (6 pre-existing warnings).

## What shipped
- **`lib/cart.ts`** — `updateQty(id, qty)` (below 1 removes the line) and `removeLine(id)`.
- **`components/tienda/cart-provider.tsx`** (new) — mounted once in the root layout; owns the open state and renders the drawer + toast. The per-page `<CartToast />` in `/tienda` is gone.
- **`components/tienda/cart-drawer.tsx`** (new) — the Stitch drawer/page on Radix `Sheet` (`side="right"`), full-bleed on mobile, with the empty state.
- **`components/tienda/free-shipping-bar.tsx`** (new) — built to the mockup, `FREE_SHIPPING_ENABLED = false`, renders nothing.
- **`components/navigation.tsx`** — the cart button is a real button with the live badge that opens the drawer (desktop + mobile panel). It was `const cartCount = 0` and a `<Link href="/tienda">`.
- **`components/ui/sheet.tsx`** — gained `showCloseButton`, mirroring `dialog.tsx`, since the cart header supplies its own close control.

## Known trade-off to revisit
With packaging and shipping excluded, "Subtotal de granos y despensa" and "Total estimado" show the **same number** — the mockup's breakdown only exists to explain the extras. Kept faithful to the mockup so the structure is ready when shipping lands; collapse it if the redundancy reads badly.
