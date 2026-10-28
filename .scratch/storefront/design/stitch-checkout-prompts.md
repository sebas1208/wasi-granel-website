# Stitch prompts — checkout, confirmation, payment page (ticket 23)

Written 2026-10-28. Paste each prompt into Stitch in the **Wasi Granel** project
(`projects/10706837740675934987`). Each screen needs **two generations** — desktop and mobile — because
both viewports are the source of truth (`AGENTS.md`).

The prompts are in English, but every **UI string is given in Spanish (Ecuador)** and must be used verbatim:
Stitch invents copy when left to itself, and invented customer-facing text is banned in this project.

Every prompt ends with the same guard: **do not invent store facts.** The mockups have previously invented
phone numbers, addresses, branches and services, and each one had to be removed by hand.

---

## Shared context — put this at the top of every prompt

```
Project: Wasi Granel — a bulk dried fruit, nut, seed and gourmet store in Riobamba, Ecuador, selling by
exact weight. The UI is Spanish (Ecuador).

Match the existing visual language EXACTLY — the same colours, type scale, spacing, corner radii and icon
style as the existing screens "Wasi Granel - Carrito Consciente Móvil" and "Wasi Granel - Contacto y
Sucursales" in this project.

Tokens: primary #FCBF00 (used for FILLS), deep amber #785a00 (accent TEXT only), foreground #544738,
background #fff8f4, surface-container-low #fcf5ed, outline-variant #ead7c3.
Cards are rounded-3xl, inputs and buttons rounded-xl. Icons are Material Symbols Outlined ONLY.
Mobile is 390 wide; desktop is 1440.

Do NOT invent phone numbers, addresses, prices, shipping costs, opening hours, delivery times or any other
store fact. Use only the copy given below. If a realistic-looking value is needed (a price, a product name),
make it obviously generic and say nothing about it being real.
```

---

## Prompt 1 — "Finalizar Pedido" (the checkout)

```
Generate a checkout screen titled "Finalizar Pedido" for Wasi Granel.

Layout (desktop): two columns — left 7/12 the customer form, right 5/12 a sticky "Tu pedido" summary card.

In order:

1. The same navbar as the other screens (logo, Navegación, search, cart icon).
2. Page head: eyebrow "Compra al peso exacto"; H1 "Finalizar pedido"; one reassurance line beneath in
   secondary text: "No se realiza ningún pago en este sitio. Te escribimos por WhatsApp para confirmar el
   peso, el envío y el pago."
3. A card titled "Tus datos" containing, in order:
   - "Nombre completo" — input, placeholder "Ej. Camila Morales"
   - "Teléfono / WhatsApp" — input, placeholder "Ej. +593 9 9999 9999", helper text beneath:
     "Es por donde te confirmamos el pedido."
   - "Dirección de entrega" — input, placeholder "Calle, número, sector, ciudad"
   - "Zona de entrega" — a select with exactly two options:
     "Riobamba (entrega gratis)" and "Otra ciudad (envío por Servientrega)"
   - "Nota para el pedido (opcional)" — textarea, placeholder
     "Ej. prefiero almendras sin sal, entregar después de las 15:00"
4. Immediately below the zone select, a soft amber callout with a truck icon, styled as information and
   NOT as an error: "El costo del envío se confirma contigo por WhatsApp antes de despachar. En Riobamba
   la entrega es gratis."
5. Two consent checkboxes, side by side with their labels, BOTH UNCHECKED by default, small squares with
   the amber accent:
   - "Acepto el tratamiento de mis datos de contacto para gestionar mi pedido, según la Política de
     Privacidad de Wasi Granel."
   - "Acepto recibir por WhatsApp la confirmación de mi pedido y los datos de pago."
   The second one is the WhatsApp consent and must read as a separate, deliberate choice — never
   pre-ticked, never merged into the first.
6. Primary CTA: a full-width button in #FCBF00 with dark text reading "Confirmar pedido". Beneath it, a
   quiet secondary link "Volver a la tienda".
7. The "Tu pedido" summary card: three example lines, each showing the product name, the chosen option
   ("500 g", "1 lb"), a quantity stepper, the unit price and the line total. Then a divider and a
   "Subtotal" row. Beneath, small secondary text: "El peso final y el valor exacto se confirman al
   despachar."
8. The same footer as the other screens.

Mobile variant: single column. The order summary collapses to a compact card at the top that can expand
("Ver mi pedido"). The "Confirmar pedido" button is sticky at the bottom. Inputs are full width, and every
tap target is at least 44px.
```

---

## Prompt 2 — "Pedido recibido" (the confirmation)

```
Generate an order-confirmation screen titled "Pedido recibido" for Wasi Granel.

A single centred card, max width 640, generous whitespace, calm and reassuring — this is the moment after
someone has committed an order and nothing has been paid yet.

In order:

1. The same navbar as the other screens.
2. A success mark in the brand's amber (#FCBF00) — NOT a generic green check, and no confetti.
3. Eyebrow "Pedido confirmado"; H1 "¡Gracias, Camila!"
4. The order reference, large and prominent, with its label: label "Tu número de pedido", value
   "WG-2026-0001", and a small copy affordance beside it.
5. A numbered list of exactly three steps, titled "Qué pasa ahora":
   1. "Te escribimos por WhatsApp para confirmar el peso, el envío y el pago."
   2. "Eliges cómo pagar: transferencia, DeUna, o pago al recibir en Riobamba."
   3. "Despachamos tu pedido. En Riobamba la entrega es gratis; a otras ciudades va por Servientrega."
6. A card titled "¿Prefieres escribirnos tú?" containing the store's real contact details:
   WhatsApp 099 087 6620, email info@wasigranel.com, and hours "Lunes a Sábado: 8:00 – 19:00,
   Domingos: cerrado".
7. A secondary button "Volver a la tienda".
8. The same footer as the other screens.

Mobile variant: the same content in a single column, with the order reference still prominent and the
WhatsApp contact reachable without scrolling past the three steps if possible.
```

---

## Prompt 3 — "Cómo pagar" (the /pago page)

```
Generate a payment-instructions page titled "Cómo pagar tu pedido" for Wasi Granel.

This page is opened from a WhatsApp message on a phone, so it must be mobile-first, short, and readable at
a glance. It is a real page, so it keeps the standard navbar and footer.

In order:

1. The same navbar as the other screens.
2. Page head: eyebrow "Pago"; H1 "Cómo pagar tu pedido"; a line beneath: "Elige la forma que te resulte
   más cómoda. Confirma por WhatsApp cuando hayas pagado."
3. A small field at the top showing the order reference: label "Pedido", value "WG-2026-0001".
4. Section "DeUna": a square QR placeholder (roughly 220×220, rounded-2xl, outlined) with a caption
   beneath: "Abre tu app DeUna, escanea el código y confirma el monto." Make it obvious the square is
   where a QR will sit — do not draw a fake QR pattern.
5. Section "Transferencia bancaria": a definition list with the labels "Banco", "Tipo de cuenta",
   "Número de cuenta" and "Titular", each with an obviously-placeholder value, plus a small
   copy-to-clipboard affordance beside the account number.
6. A closing note in a soft amber callout: "Cuando hayas pagado, envíanos el comprobante por WhatsApp y
   confirmamos tu pedido."
7. The same footer as the other screens.

Mobile variant: single column, the QR comfortably tappable, the account number selectable and copyable,
and no horizontal scrolling anywhere.
```

---

## After generating

1. Compare against the existing screens for consistency — same navbar, footer, corner radii and icon set.
2. **Audit every string** for invented facts (phone numbers, addresses, promises, delivery times). This is
   the failure mode that has cost the most rework in this project.
3. Check the WhatsApp consent checkbox is visibly separate and unticked in the checkout.
4. Only then is the checkout form buildable — the backend work (Orders collection, write path, payment page,
   email notification) does not depend on any of this and is already under way.
