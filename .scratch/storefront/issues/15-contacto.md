# 15: Contacto — sucursales, WhatsApp, and contact form

**What to build:** Build the Contacto page from the two Stitch screens — **"Contacto y Sucursales"** (desktop) and **"Contacto Móvil"** — using the store's **real** data (below): value props, the two sucursales, contact channels, a contact form, and a mobile FAQ.

**Blocked by:** 10 (app shell). The contact data is now supplied, so the page is unblocked.

**Status:** **Done — closed 2026-10-21** (`develop` `587fd85`) — implemented and browser-verified. **Not in production**: ships with the rest of the storefront when `develop` merges to `main`.

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

## Post-review changes (2026-10-21, `587fd85`)
Four changes the owner asked for after reviewing the ported page:

1. **Real Google maps.** The mockup's map was an illustration with invented streets, so it now embeds
   the real map, and "Cómo llegar" links the actual Google listing per store. `store-map.tsx` is
   deleted. This **resolves the "San Andrés" question**: it was a neighbourhood label on the mockup's
   drawing, not a third store.
   - Matriz — https://maps.app.goo.gl/YN79ofZo9A6BeANu6
   - Sucursal — https://maps.app.goo.gl/dhzgsJtQoUTa9kPA6

   **The embed is resolved by CID.** Two earlier attempts were wrong, in instructive ways:

   | embed form | what it actually gives |
   | --- | --- |
   | `q="Wasi Granel Matriz, Guayaquil y Benalcázar 1815, Riobamba"` | Google disambiguated the text query to a **supermarket a block away** — the owner's *"close but not focused"* |
   | `q=<lat>,<lng>&z=17` | a bare pin with **no store info at all** — the owner's *"now it is not showing in both"* |
   | `?cid=<CID>` | the **real listing**: name, address, phone, website, card and "Open in Maps" |

   The CID is the decimal form of the second `0x…` in the share link's `!1s0x…:0x…` id — Matriz
   `0x35fc8990eb8e45ec` → `3890135433661531628`, Sucursal `0x69f0b93b9c272599` → `7633805034067010969`.
   Also worth knowing: the `@lat,lng` in a Maps share link is the **viewport centre** (it sat at country
   zoom, `9z`), not the place; the place coordinates are the `!3d/!4d` parameters.

   How this was verified, since vision kept contradicting itself: the embed URL was fetched directly and
   its own payload read. It carries the business name, real address, phone and website — e.g.
   `"Wasi Granel Matriz, Guayaquil y Benalcazar 1815 y, 060111 Riobamba"`, `099 087 6620`,
   `wasigranel.com`. The regression test asserts each store's embed contains its own CID.

### Root cause of the gate's intermittent homepage failure (fixed here too)
Not a flake, and the earlier diagnosis (image-load race) was wrong. The homepage is **streamed**: the
server sends its content inside `<div hidden id="S:n">` containers and an inline script swaps it into
place afterwards; until then the page is a viewport-height shell. Elements in those containers are
already queryable *and their images already report `complete`*, so the waits passed while the layout
was collapsed — measured as `navBottom` 0 / clearance 0. Probed and confirmed: failing runs had the
correct DOM (`h1` and all) with `scrollHeight` == viewport. The tests now wait for the elements they
measure to have a layout. Assertions unchanged; a genuine collapse still fails (by timeout). The
homepage test went from failing ~1 in 3 to 8/8.

2. **"Escríbenos por WhatsApp" now opens WhatsApp** (Matriz number, prefilled message). It used to
   jump to an on-page anchor — a CTA that claimed to chat and didn't.
3. **Email is `info@wasigranel.com`** (was `hola@`). The old address was added to the gate's forbidden
   list.
4. **"Sucursal de Interés" removed** from the form at the owner's request.

Plus the hero photo: it is a stand-in reusing the homepage shot, and its replacement is tracked as
item 3 on **ticket 21** rather than as a `TODO` in the source.

### ✅ Resolved: opening hours
The owner first said **"Lunes a Sábado: 9:00 – 19:00"**, but the Google listings he supplied say
**8 AM – 7 PM**, Mon–Sat, Sunday closed. Shown the discrepancy, he confirmed **8:00**. The site now
reads `Lunes a Sábado: 8:00 – 19:00` / `Domingos: cerrado`, and the superseded 9:00 value was added to
the gate's forbidden list so it cannot quietly return.

## Design-port correction (2026-10-21, `16eb2de`)
**The first pass was wrong and the user caught it.** I mined the mockup for *content* (headings, form
fields, links) and then wrote my own markup and Tailwind classes — so the page had no hero photo, no
watermark, no tab switcher, the wrong section structure and a different footer. The mockup HTML is the
design authority; it is now ported properly:

| section | what the mockup actually is |
| --- | --- |
| Hero | editorial 12-col, Andean watermark (3 nested polygons at 3% opacity), eyebrow pill, two-line headline with accent span, 3 pillars, 2 CTAs, and a 5-col store photo card with gradient + brand mark + floating "2 Casas" badge |
| Nuestras Casas Wasi | a **tab switcher**, a 5-col info card and a 7-col map, toggling together — not two side-by-side cards |
| The map | a **stylized SVG** (parks, roads, Riobamba-area labels) with a marker pill — not a Google embed. This is also where the ticket's open question about **"San Andrés"** came from: it is a neighbourhood label on that illustration |
| Estamos para ayudarte | a 5/7 split: dark WhatsApp card + emails card + FAQ card on the left, the form in its own raised card on the right |
| The form | the mockup's own field ids (`full-name`, `contact-phone`, `contact-email`, `location-select`, `subject-select`, `contact-message`, `privacy-policy`), labels, spacing and input styling |

The mockup's tabs were Riobamba + **Quito**; Quito does not exist, so they are Matriz and Sucursal and
the Quito card and map are gone. All real data is preserved.

**Lesson (already in the memory notes, now proven again):** for a design ticket, port the mockup's
actual markup — reading it for copy while hand-writing the UI silently produces a different design,
and it is not visible from the code alone.

## What shipped
- **`lib/store-info.ts`** (new) — the single source of truth for everything the page says about the store, so there is exactly one place to correct and no invented value can leak in.
- **`app/contacto/page.tsx`** — ported from both mockups (hero, tabbed stores, contact split).
- **`components/contacto/sucursales-panel.tsx`** (new) — the tabbed store panel.
- **`components/contacto/store-map.tsx`** (new) — the stylized SVG map.
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
