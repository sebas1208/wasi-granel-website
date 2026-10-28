# 23: Checkout — orders, WhatsApp handoff, payment method

**What to build:** Turn the cart into a real order. The PRD parks this as a later feature ("The Order → WhatsApp fulfillment/Lead lifecycle: visual cart only for the first pass; persistence and the 'Enviar por WhatsApp' handoff is a later feature that needs Payload"), and ticket 14 deliberately excluded it — so it gets its own ticket, built **after** 14.

**Blocked by:** 14 (cart UI), 08 (Payload collections — needs an `Orders` collection).

**Status:** DESIGN AGREED 2026-10-28 (open items: the automated first message, and shipping rates).
The flow is **merchant-initiated** — the *store* messages the customer, not the PRD's customer-initiated
handoff. The owner is designing the checkout screen in Stitch; the CMS/backend work can proceed in parallel
because it does not depend on that design. See "Facts confirmed" and "Owner's answers".

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


## Facts confirmed (2026-10-28) — primary sources, not estimates

Gathered because the flow depends on them and none was safe to assume.

### WhatsApp: a click-to-chat link is TEXT ONLY

`https://wa.me/<number>?text=<message>` supports **only** a `text` parameter — Meta's own Help Center
documents no image or attachment parameter, so **a QR image cannot be attached to a click-to-chat
message.** *Primary: `faq.whatsapp.com` ("How to use click to chat").*

- **Maximum length: not documented by Meta.** Secondary sources cite ~4096 chars; the practical ceiling is
  the long-URL limit (~2000+ chars, lower once the text is percent-encoded or non-ASCII). Either way the
  composed message must stay short, which is a real design constraint on a many-line order.
- Sending an image programmatically **is** supported, but only through the WhatsApp Business Cloud API
  (`type=image`, media id or link, caption ≤1024 chars, JPEG/PNG ≤5MB) — and media generally needs an
  **approved template** outside the 24-hour customer-service window. *Primary: `developers.facebook.com`.*

**Consequence:** a payment **link** is text and fits a free click-to-chat message; a payment **QR image**
does not. The free path is text payment details, or a manual attach by whoever sends.

### DeUna: 2% on the business QR, free person-to-person — and the two are different accounts

| channel | cost | basis |
| --- | --- | --- |
| Deuna **Negocios** QR / link de cobro / código único | **2% flat**, on the amount collected | *Primary: `deuna.ec/negocios/empresas`, `soporte.deunaapp.com`* |
| **Person-to-person** DeUna transfer to a DeUna phone number | **free** | *Primary: `pichincha.com` — "los pagos entre usuarios de Deuna y entre cuentas Banco Pichincha no cobran comisión"* |
| DeUna send to an account at **another bank** | **free** | *Primary: `deuna.ec`* |

**DeUna Personas and DeUna Negocios are separate products.** The 2% applies only to Negocios, and
Negocios **requires an active RUC and the applicant to be the sole legal representative**. That matters
here: the RUC is the owner's mother's, so she is the one who can register it — which is the same question
the two legal documents raise about who the business legally is.

So "no commissions" is true for a personal P2P transfer or a bank transfer, and **2% is the price of
collecting through a properly constituted business account.** Which instrument is correct for a business
receiving sales is still the owner's accountant's call; the rates above are facts, the choice is not.

### WhatsApp Business API: ~1.1 US cents per message, and service replies stopped being free

- Since **1 July 2025** Meta bills **per delivered message** by category and recipient market — not per
  24-hour conversation. *Primary: `developers.facebook.com/docs/whatsapp/pricing`.*
- **Service** (the business replying to a customer) was free until 30 Sep 2026; **from 1 Oct 2026** it is
  charged at the market's utility rate, with the **first 1,000 service messages per phone number per
  month free** and no rollover. Messages *from* customers to the business remain free.
- **Utility** templates are charged per delivery. Ecuador has **no standalone rate** — it sits in Meta's
  *Rest of Latin America* region: utility/authentication ≈ **US$0.0113**, marketing ≈ US$0.0740.
- **Onboarding is the real cost, not the fee:** Meta Business Portfolio plus business verification
  (registration certificate, tax ID, address proof, a consistent legal name), a WABA with an approved
  display name, a **dedicated phone number not active on personal WhatsApp** able to receive OTPs, every
  template submitted for approval, and recipient opt-in.

**Consequence:** automated sending is cheap per message (~1.1¢) but has a real onboarding gate — and it
would be an integration of its own. A person clicking a free click-to-chat link costs nothing and needs no
verification, which is why it remains the recommendation for the first version.


## Owner's answers (2026-10-28)

| # | question | answer |
| --- | --- | --- |
| Q1 | what the checkout collects | **Yes, a checkout form storing that data. The owner will design the screen in Stitch** — so the UI waits on that design; the Orders collection, write path and email do not. |
| Q2 | what the customer sees after submitting | As proposed — order reference, "te escribimos por WhatsApp", the store's hours, and that the total is confirmed in the chat. |
| Q3 | when the cart empties | On submit. The flow then moves offline. |
| Q4 | who presses send | **The owner wants the FIRST message automated** — the payment instructions go out automatically, then a person continues the chat. Research in flight. |
| Q5 | payment instructions | **Both, plus the DeUna QR — the PERSONAL one, not the merchant QR.** That is the 0% channel: a personal P2P QR, not the 2% Deuna Negocios route. |
| Q6 | shipping | **The rule: free inside Riobamba city or nearby; outside, via Servientrega at extra cost.** The owner asked what else the Ecuadorian market offers — research in flight. |
| Q7 | how the store learns of an order | **Email — a must, and for now the only channel**, unless a free or very cheap WhatsApp route exists (which is what the Q4 research is checking). |
| Q8 | the lifecycle | **After the first message the conversation is manual.** Further automation is a post-launch task, by the owner's own call. |
| Q9 | where the checkout design comes from | **The owner will create it in Stitch**, so no code-first design. |

### What this settles about the flow

```
customer fills the checkout  ->  POST to a Next route handler  ->  Orders record in Payload (status: Nuevo)
                             ->  confirmation screen with the order reference
                             ->  [automated first WhatsApp message with the payment instructions]   <- Q4, in flight
                             ->  a person continues the chat, sets/confirms shipping, confirms the weight
                             ->  customer pays (bank transfer / DeUna personal) -> store marks it Pagado
                             ->  dispatched; Riobamba is free, outside goes by Servientrega
```

### The image problem has a clean answer

Q5 asks for the QR image, and the facts say a click-to-chat message is text-only. But **a link is text** —
so hosting the personal DeUna QR at a URL (e.g. `/pago`) and putting that link in the message gets the QR
to the customer on every channel — WhatsApp, email, and anywhere else — with nothing to attach. That also
removes the only reason to consider the paid API for images. Worth designing that page alongside the
checkout.
