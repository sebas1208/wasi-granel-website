# 14: Side cart with weight-tier lines

**What to build:** Build the cart as a client-side side cart (from "Con Carrito Lateral Interactivo"), holding cart lines of product + weight tier + quantity, with line totals and an order total. Persist cart state client-side; the Order persistence + "Enviar por WhatsApp" handoff is out of scope (later feature, needs Payload).

**Blocked by:** 13 (product detail / add-to-cart produces cart lines).

**Status:** ready-for-agent

- [ ] The side cart opens from the navbar/catalog and lists lines with product, tier, quantity, and line subtotal.
- [ ] Quantities can be adjusted and lines removed; total updates live.
- [ ] Cart state survives navigation within the session (client-side).
- [ ] The cart is demonstrably populated from the add-to-cart actions of tickets 12/13.
- [ ] `next build`/`next lint` pass.
