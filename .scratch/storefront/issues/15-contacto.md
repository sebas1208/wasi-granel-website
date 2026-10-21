# 15: Contacto — sucursales, WhatsApp, and contact form

**What to build:** Build the Contacto page from the two Stitch screens — **"Contacto y Sucursales"** (desktop) and **"Contacto Móvil"** — using the store's **real** data (below): value props, the two sucursales, contact channels, a contact form, and a mobile FAQ.

**Blocked by:** 10 (app shell). The contact data is now supplied, so the page is unblocked.

**Status:** **Done — closed 2026-10-21** (`develop` `14c9c5f`) — implemented and browser-verified. **Not in production**: ships with the rest of the storefront when `develop` merges to `main`.

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

## Acceptance — verified in a real browser (2026-10-21)
- [x] `/contacto` renders the value props, the **two Riobamba sucursales** with real addresses, hours and per-store phones, and the contact channels.
- [x] WhatsApp and email links point at the real numbers / `hola@wasigranel.com`. Verified: Matriz → `wa.me/593990876620`, Sucursal → `wa.me/593991475809`.
- [x] The Quito branch is gone; nationwide Servientrega shipping is stated instead.
- [x] The footer's invented phone and `Riobamba · Quito` are corrected — it now shows both real numbers as WhatsApp links plus `hola@wasigranel.com`.
- [x] The "Jatunwasi" embed is gone. *Deviation:* the maps use **address-query URLs** (`google.com/maps/search/?api=1&query=…` and `…&output=embed`) rather than the stored Places IDs — no API key needed, and it resolves against the real addresses. Switch to the place IDs if exact pinning is ever wanted.
- [x] The contact form has **no fake success state**: it validates, and a valid submit lands in an honest "todavía no está conectado" state pointing at the WhatsApp channel. The real receiver is ticket 25.
- [x] The privacy modal opens from the consent checkbox.
- [x] Browser-verified per `AGENTS.md`: `check:layout` **31 passed, 1 skipped** (desktop 1280 + mobile 390), including a test that asserts the real data is present **and** that every invented value is absent (the mockup's two phones, the stub's phone, Jatunwasi, the Quito branch, `Riobamba · Quito`, the invented features and the "200+ references" claim). `tsc` clean, `lint` 0 errors.

## What shipped
- **`lib/store-info.ts`** (new) — the single source of truth for everything the page says about the store, so there is exactly one place to correct and no invented value can leak in.
- **`app/contacto/page.tsx`** — rebuilt from both mockups (hero, value props, two store cards with maps, help section, form, FAQ).
- **`components/contacto/contact-form.tsx`** (new) — full client-side validation (name, phone, email, message, consent) with `aria-invalid`/`role="alert"` on every error; deliberately unwired.
- **`components/contacto/privacy-modal.tsx`** (new) — plain-language data statement in a modal.
- **`components/footer.tsx`** — real numbers, real email, no fake city.

## Notes
- The value props band and the per-store feature chips were **drafted by me** to replace the mockup's invented ones and are **awaiting the user's review**: "Pesaje exacto a granel", "Servicio de molienda en tienda", "Atención personalizada". The coffee-grinding claim is confirmed true (they have a molino); the wording is mine.
- The privacy wording is a **plain-language draft, not legal advice** — worth a review before relying on it.
- The mobile mockup's FAQ card was kept (user decision) and is rendered on both viewports, since the content is useful on desktop too.

## Open questions — all resolved
1. ~~Opening hours~~ → **Lunes a Sábado 9:00 – 19:00, Domingos cerrado** (owner, 2026-10-21). Note the stub claimed "Sábados: 9:00 - 18:00" and the mockup two other sets — all three were wrong.
2. ~~Café category~~ → ticket 24. ~~Form receiver~~ → ticket 25.
3. **For review (not blocking):** the marketing lines I drafted to replace the invented feature chips, and the plain-language privacy wording.
