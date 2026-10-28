# 23: Checkout — orders, WhatsApp handoff, payment method

**What to build:** Turn the cart into a real order. The PRD parks this as a later feature ("The Order → WhatsApp fulfillment/Lead lifecycle: visual cart only for the first pass; persistence and the 'Enviar por WhatsApp' handoff is a later feature that needs Payload"), and ticket 14 deliberately excluded it — so it gets its own ticket, built **after** 14.

**Blocked by:** 14 (cart UI), 08 (Payload collections — needs an `Orders` collection).

**Status:** ANALYSED 2026-10-27 — grounded in the code that exists and in what the Ecuadorian payment market actually charges.
Three questions are with the owner (payment model, shipping pricing, address). The build starts once they land.

## Scope

1. **Order capture** — an `Orders` collection in Payload: line items (product ref, option label, grams/amount, qty, unit price at time of order), totals, customer name + phone, delivery zone/address, payment method, status, and a human-readable order reference.
2. **The handoff** — "Enviar por WhatsApp" composes the order as a message (line items, quantities, totals, customer details) and opens `wa.me` with it pre-filled, to the store's number. No payment gateway: the PRD says payments (Efectivo / Transferencia / DeUna) are handled offline in chat.
3. **Payment method** — the customer picks Efectivo / Transferencia / DeUna before sending; the choice travels in the order and the message.
4. **Checkout entry** — the cart's primary CTA ("Continuar a Checkout"), which in ticket 14 ships disabled/labelled as coming soon.
5. **Order confirmation** — what the customer sees after the handoff (order reference, what happens next, the store's hours/contact).

## Deliberately out of scope
- Real payment processing / card capture — offline in chat per the PRD.
- Delivery pricing ("Envío local estimado → Calculado en checkout" in the mockups): the mockups show a *placeholder* for it, so this ticket has to decide whether shipping is calculated, flat per zone, or quoted in chat. Related to the parked free-shipping threshold.
- Customer accounts / order history (no auth exists).

## Acceptance
- [ ] A cart can be turned into an order that is persisted and retrievable in the Payload admin.
- [ ] The WhatsApp message contains every line with its option, quantity and price, plus the totals and the customer's details — verified by reading the composed message, not by eye.
- [ ] Payment method is captured and appears in both the order and the message.
- [ ] An order can be placed on desktop 1280 and mobile 390, browser-verified per `AGENTS.md`.
- [ ] The cart is emptied only after a successful handoff.
- [ ] `check:layout` green; `tsc` and `lint` clean.

## Open questions
- **Free-shipping threshold** — still unset (parked from ticket 14, where the bar is built but gated off). Needs a number and a zone rule before either the bar or delivery pricing can be wired.
- Is shipping *calculated* (by zone/weight), *flat per zone*, or *quoted in chat*? The mockup's "Calculado en checkout" implies calculated, but nothing computes it today.
- Does the order get written to Payload **before** the WhatsApp handoff (so a lost message is recoverable) or only after the customer confirms? Before is safer; confirm.
- Does the customer need to give an address in the checkout, or is that arranged in the WhatsApp chat?
- Order reference format (e.g. `WG-2026-0001`)?
- The mobile mockups show a **bottom nav** (Inicio / Tienda / Carrito / Perfil) which the app does not have — it uses the top nav everywhere (a known deviation flagged in ticket 12). Checkout on mobile may force that decision.


## Analysis (2026-10-27)

### What already exists, so the ticket does not reinvent it

| piece | state |
| --- | --- |
| `lib/cart.ts` | localStorage store, no backend session. `CartLine` = `productId`, `kind` (`weight`\|`unit`), `grams`/`amount`, `optionLabel`, **`unitPrice` captured at add-time**, `qty` |
| line identity | `productId:kind:grams\|amount` — the same option twice bumps qty, a different option is its own line |
| totals | `subtotal = Σ unitPrice × qty`; **no tax line, deliberately** — `taxRate` is null on all 278 products, consistent with the 0%-IVA food finding |
| the CTA | `cart-drawer.tsx` ships `Continuar a Checkout (Próximamente)`, disabled, keeping the mockup's shape |
| free-shipping bar | built, gated off by `FREE_SHIPPING_ENABLED = false`; needs a threshold before it can be wired |
| Payload collections | `Categories`, `Media`, `Products`, `Users` — **there is no `Orders` collection**, as the ticket says |

The `unitPrice` snapshot at add-time is the right shape for an order: it survives a price change between
adding and sending, which is exactly what an order line must do.

### The payment market, as it actually prices (checked 2026-10-27)

The PRD says payments are handled offline in chat — Efectivo / Transferencia / DeUna. Before accepting
that as the end state, the real options:

| provider | cost to the store | what it gives | integration weight |
| --- | --- | --- | --- |
| **DeUna** (Banco Pichincha) | **2% per transaction** — the cheapest here | QR and payment links; 6M+ users, 620k+ merchants; DeUna→Pichincha transfers free; per-sale notifications. Needs a Pichincha account | Low for a QR/link; a real API (DeUna Negocios: charges + signed webhooks + refunds) for full checkout |
| **BGPay** (Banco Guayaquil, "link de pago") | **3% + $0.30 per sale** | A payment link you can send **by WhatsApp** — built for selling through chat. Visa/MC/Amex, funds in ≤24 business hours | Almost none — no checkout code, the store sends the link |
| **Kushki** | ~**2.95% + $0.25** for cards | Sandbox, hosted payment pages, hosted checkout button; merchant-specific rates | Medium — a real gateway integration |
| **PayPhone** | **5% + IVA** (5.75% effective), plus withdrawal fees | Cards, links, QR, Tap to Phone | Low–medium |
| **Datafast** | not published (commission calculator only) | Ecuador's incumbent card network, PCI certified; links and buttons | Medium |

Two things stand out. **The spread is large** — 2% versus 5.75% is a real cost on thin bulk-goods margins.
And **the "no integration" options are not worse than the integrated ones for this store**: a DeUna QR at
2% or a BGPay link at 3% + $0.30 gives the customer card/mobile payment while the order still completes in
WhatsApp, which is how this store already sells. A full gateway buys automation the store does not need
yet, and adds a charge-enabled code path that has to be supported.

### The three shapes this ticket could take

**A — Offline, as the PRD says.** The customer picks Efectivo / Transferencia / DeUna; the order goes to
WhatsApp; money moves in chat. No gateway, no commission on the site's side. Cheapest to build, zero new
risk, and the legal text already describes exactly this.

**B — Offline + a payment link in the message.** Same flow, but the WhatsApp message also carries the
store's DeUna QR or a BGPay/PayPhone link, so the customer can pay immediately with a card or the DeUna
app. Almost no code (the link is configurable, ideally from the CMS), and it is the cheapest digital
payment the store can offer. Needs the terms to say a link is used.

**C — A gateway in the checkout (DeUna Negocios API, or Kushki).** Payment happens before the order is
confirmed; a signed webhook flips it to paid. This is a genuinely bigger build: an `Orders` collection, a
server-side charge call, webhook verification, refund handling, and a support story for failed payments.

**A is what the PRD specified and B is a small, high-value upgrade to it. C should be a deliberate later
step, not part of the first checkout.**

### One implication worth stating before the build

Persistence needs a **write path from the storefront to Payload**. The CMS is a different origin and the
storefront has no session, so this cannot be a browser call. It needs an `Orders` collection with
`auth: { useAPIKey: true }`, a **Payload API key held server-side**, and a Next route handler in the web app
that the checkout POSTs to. That is one new secret (`PAYLOAD_API_KEY`) and one new collection — worth
knowing before the questions below are answered, because option C would ride on the same path.
