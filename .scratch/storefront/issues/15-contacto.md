# 15: Contacto — sucursales, WhatsApp, and contact form

**What to build:** Build the Contacto page from the two Stitch screens — **"Contacto y Sucursales"** (desktop) and **"Contacto Móvil"**: value props (Cero Plásticos, Pesaje Exacto, Comercio Justo), "Nuestras Casas Wasi" with the sucursales, contact channels (WhatsApp, email), a contact form, and (mobile only) an FAQ.

**Blocked by:** 10 (app shell) — and **on the real store contact data** (see below). The page cannot ship with the mockup's values.

**Status:** needs-triage — blocked on the contact-data questions at the bottom.

## Design references (refetched 2026-10-21)
- Desktop: `.scratch/stitch-fetch/screens/wasi-granel-contacto-y-sucursales__71ee0d81.html`
- Mobile: `.scratch/stitch-fetch/screens/wasi-granel-contacto-m-vil__1bbe83e0.html`

## Audit — what the mockup INVENTS (must not ship)

Unlike a layout decision, these are customer-facing facts. Stitch invented all of them:

| element | value in the mockup | verdict |
| --- | --- | --- |
| Riobamba phone / WhatsApp | `+593 9 8765 4321` | **invented** — and this same number is **already live in the site footer** on every page |
| Quito phone / WhatsApp | `+593 9 9123 4567` | invented |
| Third number (desktop) | `+593 2 290 4480` | invented |
| Riobamba address | "Calle de la Tierra 123 y Av. Chimborazo, Barrio Bellavista, Riobamba" | invented |
| Quito address | "Calle Guipúzcoa E14-88 y Coruña, Barrio La Floresta, Quito" | invented |
| Riobamba hours | "Lunes a Sábado: 08:30 – 19:30 / Domingos: 09:30 – 15:00" | invented |
| Quito hours | "Lunes a Sábado: 09:00 – 20:00 / Domingos: 10:00 – 17:00" | invented |
| Emails | `comunidad@`, `ventas@`, `hola@wasigranel.com` | unverified |
| Store features | "Molienda de Café en vivo", "Taras automáticas", "Parqueadero de bicicletas", "Despachos en Bicimensajería", "Barra de Cremas de Frutos Secos", "Punto de Retiro Online" | invented |
| Scale claim | "más de 200 referencias a granel" | invented |
| Badge | "Nueva Casa Cultural" | invented |

The desktop mockup also mentions **"San Andrés"** near the locations — possibly a third site, unclear.

## What is actually real / available

- **`hola@wasigranel.com`** — present in the shipped footer and the old stub; the only contact detail with a plausible basis.
- **Two cities: Riobamba and Quito** — the footer already says "Riobamba · Quito".
- **Real Google Places IDs** exist for both sites (`ChIJgQa96SKp05ER7EWO65CJ_DU` matriz, `ChIJlxlN2oCp05ERmSUnnDu58Gk` sucursal) — usable for the "Cómo llegar" links and the map embeds, and they are the *correct* places, unlike the stub's embed.
- **An existing form receiver**: `apps/web/app/api/signup/route.ts` already POSTs to a Google Apps Script (Google Sheets). That is a real, working pattern the contact form could reuse or extend — better than a stubbed "success" that lies to the customer.
- The old stub's number `+593 986 016 764` — **unverified**, possibly a real family number.

## Known conflicts to resolve
- **Hours**: the stub says "Lunes - Viernes: 9:00 - 19:00"; the mockup says "Lunes a Sábado … / Domingos …". Different, both unverified.
- **Map embed**: the stub's iframe points at **"Jatunwasi Granel Gourmet Matriz"** — the old brand and the wrong place. Must be replaced with the real Places IDs above.
- **The form's success state**: the mockup shows "¡Mensaje recibido con éxito!" with no backend behind it. Shipping that as-is tells customers their message was received when it wasn't.

## Acceptance (draft — depends on the answers)
- [ ] `/contacto` renders the value props, the sucursales with **real** addresses/hours/phones, and the contact channels.
- [ ] WhatsApp and email links point at the **real** store channels.
- [ ] The contact form has a **real** receiver (or an honest "opens WhatsApp instead" path) — no fake success state.
- [ ] Map/"Cómo llegar" links use the correct Places IDs; the "Jatunwasi" embed is gone.
- [ ] Matches the Stitch desktop + mobile references; browser-verified per `AGENTS.md` (desktop 1280 + mobile 390).
- [ ] `tsc`, `lint` and `check:layout` clean.

## Open questions
1. **Real contact data** for each sucursal: WhatsApp/phone, email, street address, and opening hours. Nothing on this page can ship without it — and the footer's fake `+593 9 8765 4321` should be corrected in the same pass.
2. **How many sites?** Riobamba (matriz) + Quito (La Floresta)? And what is "San Andrés"?
3. **Which store facts are true** — live coffee grinding, returnable containers, bike parking, bike-messenger delivery, nut-butter bar, online pickup point, "200+ bulk references"? Only the true ones ship.
4. **The form's receiver**: extend the existing Google Apps Script (Sheets), send an email, or make the button open WhatsApp with the message pre-filled? (Recommendation: reuse the Apps Script, since it already works for the newsletter.)
5. **FAQ (mobile only)**: the mockup shows "¿Hacen envíos a todo el Ecuador?" — what are the rest, or should the FAQ be dropped?
6. **Privacy**: the form has a consent checkbox referencing "las políticas de privacidad de Wasi Granel", and the footer has a "Legal" column — but no privacy page exists. Do we need one for that checkbox to be honest?
