# 15: Contacto — sucursales, WhatsApp, and contact form

**What to build:** Build the Contacto page from the two Stitch screens — **"Contacto y Sucursales"** (desktop) and **"Contacto Móvil"** — using the store's **real** data (below): value props, the two sucursales, contact channels, a contact form, and a mobile FAQ.

**Blocked by:** 10 (app shell). The contact data is now supplied, so the page is unblocked.

**Status:** ready-for-agent — scope agreed 2026-10-21.

## Design references (refetched 2026-10-21)
- Desktop: `.scratch/stitch-fetch/screens/wasi-granel-contacto-y-sucursales__71ee0d81.html`
- Mobile: `.scratch/stitch-fetch/screens/wasi-granel-contacto-m-vil__1bbe83e0.html`

## REAL store data (from the user, 2026-10-21) — overrides the mockup everywhere

Both stores are in **Riobamba**. **There is no Quito store** — Stitch invented it.

| | Matriz | Sucursal |
| --- | --- | --- |
| address | **Guayaquil y Benalcázar 1815, 060111 Riobamba** | **Juan Montalvo y Av. José Veloz, esquina, Riobamba** |
| phone | **0990876620** | **0991475809** |

- **Shipping**: nationwide via **Servientrega**; the owner lives in Quito and wants delivery there — so Quito appears as a *destination we ship to*, never as a branch.
- **Email**: `hola@wasigranel.com` (already in the footer).
- **Coffee is sold** — see the finding below.

## Corrections this forces elsewhere
- **The site footer is wrong today**: it prints `Riobamba · Quito` and the invented phone **`+593 9 8765 4321`**. Both must be fixed in this ticket — the fake number is live on every page right now.
- The old stub's map embed points at **"Jatunwasi Granel Gourmet Matriz"** (old brand). Replace with the correct Places IDs (`ChIJgQa96SKp05ER7EWO65CJ_DU` matriz, `ChIJlxlN2oCp05ERmSUnnDu58Gk` sucursal).
- The stub's hours ("Lunes - Viernes: 9:00 - 19:00") and the mockup's two hour-sets are **all unverified** — real opening hours still needed.

## Decisions (user)
- **Store features**: the mockup's chips ("Molienda de Café en vivo", "Taras automáticas", "Parqueadero de bicicletas", "Bicimensajería", "Barra de Cremas") are invented. Replace with **generic marketing lines, drafted for the user to review** (draft below).
- **FAQ**: keep the card. The shipping answer is true — **Servientrega**, nationwide. Improve the wording.
- **Privacy**: a **modal** with generated privacy wording — **no new page**.
- **Contact form**: build the **UI only, left unconnected** (user decision — a multi-field form is a poor fit for a `wa.me` link, and the page already has a dedicated WhatsApp button). Wiring it is **ticket 25**. Until then the form must NOT claim success: it validates, then says it isn't live yet and points at the WhatsApp button.
- **Phones**: 0990876620 → Matriz, 0991475809 → Sucursal.
- **Coffee / Café category**: moved to ticket 24.

## Draft marketing lines (for review — replace the invented chips)
Generic, safe, and true-by-default; swap or drop any that aren't accurate:
- "Atención personalizada en tienda"
- "Venta al por mayor y menor"
- "Envíos a todo el Ecuador con Servientrega"
- "Pesaje exacto a granel"
- "Productos naturales seleccionados"
- **Confirmed true, needs rewording**: in-store coffee grinding — *"we have a molino and we tell people to come to grind it if you want"*. The user's note: *"molienda de café en vivo sounds weird"*. Draft alternatives: "Muele tu café en tienda" or "Servicio de molienda en tienda".

## Finding: coffee is in the catalog but filed under "Endulzantes"
The user asked to "include coffee in the catalog". It is already there — but effectively invisible:

| ref | name | category | price | images |
| --- | --- | --- | --- | --- |
| `CAF-001` | Café Grano | **Endulzantes** ✗ | $9.07 / lb | 0 |
| `CAF-002` | Café Polvo | **Endulzantes** ✗ | $9.07 / lb | 0 |
| `CHO-011` | Choco Café | Cacao & Chocolates ✓ | $9.99 / lb | 0 |

Nobody browsing the store finds coffee: both products sit in a 5-product **Endulzantes** category, and the taxonomy has no Café category at all. Proposal: create a **Café** category, move `CAF-001`/`CAF-002` into it, and give it an icon in `lib/category-icons.ts` (the homepage grid and the tienda sidebar share that map). The 0-images gap is ticket 22.

## Acceptance
- [ ] `/contacto` renders the value props, the **two Riobamba sucursales** with real addresses and phones, and the contact channels.
- [ ] WhatsApp and email links point at the real numbers / `hola@wasigranel.com`.
- [ ] The Quito branch is gone; nationwide Servientrega shipping is stated instead.
- [ ] The footer's invented phone and `Riobamba · Quito` are corrected.
- [ ] Map / "Cómo llegar" links use the correct Places IDs; the "Jatunwasi" embed is gone.
- [ ] The contact form has a real receiver or an honest WhatsApp path — **no fake success state**.
- [ ] The privacy modal opens from the consent checkbox.
- [ ] Browser-verified per `AGENTS.md` (desktop 1280 + mobile 390); `tsc`, `lint`, `check:layout` clean.

## Open questions
1. **Real opening hours for each store** — this is the last data gap. Three candidate sets exist and none is verified: the stub's "Lunes - Viernes: 9:00 - 19:00", and the mockup's two ("Lunes a Sábado: 08:30 – 19:30 / Domingos: 09:30 – 15:00" and "Lunes a Sábado: 09:00 – 20:00 / Domingos: 10:00 – 17:00").
2. Café category → ticket 24. Form receiver → ticket 25.
