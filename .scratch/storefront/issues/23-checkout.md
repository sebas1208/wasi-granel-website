# 23: Checkout — orders, WhatsApp handoff, payment method

**What to build:** Turn the cart into a real order. The PRD parks this as a later feature ("The Order → WhatsApp fulfillment/Lead lifecycle: visual cart only for the first pass; persistence and the 'Enviar por WhatsApp' handoff is a later feature that needs Payload"), and ticket 14 deliberately excluded it — so it gets its own ticket, built **after** 14.

**Blocked by:** 14 (cart UI), 08 (Payload collections — needs an `Orders` collection).

**Status:** needs-triage — the questions below are the user's, and one (the free-shipping threshold) is a business number that also gates the bar parked in 14.

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
