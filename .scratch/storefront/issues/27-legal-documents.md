# 27: Legal documents — Términos y Condiciones + Política de Privacidad, as reusable modals

**What to build:** The two legal documents an online shop needs, rendered as **modals from ONE reusable
component** so the same text serves the footer, checkout (ticket 23) and the contact form's consent
checkbox — instead of three implementations drifting apart.

Split out of ticket 24 (item 5b) at the owner's request: *"let's note to add both on the other ticket
for legal terms and related."*

**Blocked by:** nothing, but the **text** is the owner's to supply or approve. **Ticket 23 (checkout)
is blocked by this** — payment providers routinely require published terms.

**Status:** TEXT APPROVED 2026-10-26 — the owner approved both documents in full, including the weight
tolerance in §7 of the terms. **The remaining work is the build** (design decided, below). A lawyer still
reviews before publication.

## Why BOTH, not one

They answer different questions and are not interchangeable:

| document | answers | why it's needed here |
| --- | --- | --- |
| **Términos y Condiciones** | the commercial rules: how prices work, shipping, order acceptance, what happens if something goes wrong | an online shop that takes orders needs stated terms; payment providers typically require a published page |
| **Política de Privacidad** | what happens to personal data: what is collected, why, for how long, how to ask for deletion | the site collects **name, phone and email** through the contact form (and emails via the newsletter). Ecuador's *Ley Orgánica de Protección de Datos Personales* requires a privacy notice for that, and the form's consent checkbox already points at a privacy statement |

**Related items that belong in the privacy text specifically:**
- **Analytics is actually running.** `@vercel/analytics` is mounted in the storefront (visible in the
  browser console as "Vercel Web Analytics"), so the policy has to say so — a privacy notice that omits
  the analytics in use is inaccurate.
- The **contact form's receiver** (ticket 25) determines where data actually goes; the privacy text
  should not promise a flow that does not exist yet.
- If **checkout adds online payment** (ticket 23), payment data handling has to be covered too.

## Where the text comes from
The owner said he wants the wording to be his. He is right — **I will not invent terms that bind him.**
Two ways forward:
1. He (or a lawyer) supplies the text; I build the modal and wire it.
2. I draft both from how the store actually operates — shipping via Servientreca to any province, no
   online payment today, orders coordinated by WhatsApp — and he reviews and edits before it goes live.

Either way: **not legal advice**, and the binding wording is his call.

## Existing pieces to reuse
- `apps/web/components/contacto/privacy-modal.tsx` — the pattern already exists (a modal opened from the
  contact form's consent checkbox). The new component should generalise it, not sit beside it.
- `apps/web/components/footer.tsx` — the "Legal" column currently links Términos y Condiciones and
  Política de Privacidad at `href="#"` (**dead links**; "Devoluciones" was removed 2026-10-24).

## Acceptance
- [ ] One reusable legal modal component; the footer opens both documents from it.
- [ ] Checkout (ticket 23) reuses the same component for terms acceptance.
- [ ] The contact form's consent checkbox opens the **Política de Privacidad** from the same component
      (replacing the bespoke `privacy-modal.tsx`).
- [ ] No dead `href="#"` legal links remain anywhere.
- [ ] The privacy text names Vercel Analytics and the contact form's actual data destination.
- [ ] Both documents are reachable without JavaScript (a link that works, not only a modal) — a
      customer on a broken connection must still be able to read the terms they are agreeing to.


## The drafts (2026-10-26)

- `.scratch/storefront/legal/terminos-y-condiciones.md`
- `.scratch/storefront/legal/politica-de-privacidad.md`

Written from how the store actually operates, not from a template. The facts they are grounded in, all
verified in the code rather than assumed:

| fact | source |
| --- | --- |
| Analytics is running and is **cookieless** | `app/layout.tsx` mounts `<Analytics />` from `@vercel/analytics/next` |
| The newsletter list is stored in **Google** | `app/api/signup/route.ts` forwards the email to a Google Apps Script endpoint |
| The contact form **transmits nothing today** | `contact-form.tsx` `onSubmit` only sets a submitted flag — deliberate, so it never claimed a success that was not real |
| Cart and favourites are **browser-only** | local state / `useSyncExternalStore` + localStorage, no server storage |
| Shipping is Servientrega, continental Ecuador, coordinated by WhatsApp | `lib/store-info.ts` |
| Minimum order is 50 g per product | `MIN_GRAMS` in `lib/payload.ts` |
| No online payment exists yet | checkout is ticket 23 |

Two consequences worth flagging: the privacy text **names Vercel Analytics and Google** (a notice that
omits the processors actually in use is inaccurate), and it **does not promise that the contact form
delivers** — the destination is still ticket 25's decision, and the draft marks that spot «VERIFICAR».

## Open questions for the owner

1. **Razón social y RUC** — both documents identify the business; today neither exists anywhere in the repo.
2. **¿Los precios incluyen IVA?** — and how it appears on the receipt.
3. **¿Envío gratis a partir de cierto monto?** — also the business number ticket 23 is waiting on.
4. **Tolerancia de peso** — do we accept a variation from the requested weight, and up to how much?
5. **Qué ofrecemos cuando algo sale mal** — replacement, refund, or credit. "Devoluciones" was removed from
   the footer on purpose, so this needs a policy the store can actually honour rather than a boilerplate one.
6. **Plazos de conservación** — proposed 12 months for contact messages; the owner should confirm.
7. **País del servidor Contabo** — the privacy text currently names the company; a transfer notice is
   stronger with the country.
8. **Destino del formulario** (ticket 25) — must be named in the privacy policy once decided.

**Not legal advice.** The wording binds the owner, so it is his to approve — and the consumer-law clause in
particular is worth a lawyer's eye before it goes live.


## Owner's answers (2026-10-26)

| question | answer |
| --- | --- |
| Razón social y RUC | **Wasi Granel**, RUC **0601801327001** — the mother's RUC, which is what the store is registered under |
| ¿IVA? | Prices **do not include IVA** because the products are not taxed — essentially all of them are 0%-rated food. Text says so, and leaves room for a taxed product to show it on the receipt |
| Envío gratis | **On hold.** No threshold is promised; revisit once checkout (23) is decided |
| Qué ofrecemos cuando algo sale mal | **Replacement or refund** |
| Plazos de conservación | **12 months** for contact messages (as proposed) |
| País del servidor | Contabo is in the **United States** — the transfer notice now names both countries |
| Destino del formulario | **A Google Sheet**, same mechanism as the newsletter. A more robust destination is an after-launch task, recorded on ticket 24 |

**Still open — weight tolerance (§7 of the terms).** The question: since products are weighed to order, the
scale will not land exactly on the requested weight, so what does the store do when it differs? The draft
proposes charging the weight actually dispatched, and writing to the customer before shipping if the
difference exceeds 5%. Awaiting the owner's confirmation.

**Note on §5 of the privacy policy:** it names Google as the form's destination, which is correct once
ticket 25 is wired — the form transmits nothing today. The draft header records this so nobody reads the
policy as a description of the current behaviour.


## The build (design decided, not yet written)

The acceptance says *"both reachable without JavaScript"* and *"no dead `href="#"` links"*. A modal alone
is JavaScript, so the modal cannot be the only way in — and a legal document should be a real, indexable
page anyway. So:

**Real pages first, modal as the enhancement.**

| piece | file |
| --- | --- |
| the two documents, one source of truth | `apps/web/content/legal/{terms,privacy}.md` |
| renders a document from its slug | `apps/web/components/legal/legal-document.tsx` (server component) |
| the reusable window | `apps/web/components/legal/legal-modal.tsx` (client, Radix Dialog) |
| the real pages | `apps/web/app/legal/[documento]/page.tsx` — `generateStaticParams` for `terms` \| `privacy` |
| footer wiring | `components/footer.tsx:56` — `href="#"` → `href={legalHref(item.document)}` |
| consent checkbox | `components/contacto/contact-form.tsx:186` — `PrivacyModal` → the shared `LegalModal` |

The footer link is a real `<a href="/legal/terms">`, so it works with JavaScript disabled. `LegalModal`
wraps it, calls `preventDefault()` on click, and opens the same document in a dialog. One content
component serves both paths, so the page and the window can never drift.

The document ids are already stable: the Payload `footer` global exposes `legal[].document` as a select
with exactly `terms` and `privacy`, and `components/footer.tsx` already carries `data-legal-doc` on each
link with a comment reserving it for this ticket. Nothing new has to be invented.

**Known trade-off:** passing the server-rendered document as the dialog's children puts both documents in
the RSC payload of every page that renders the footer (~10-16 KB). The alternative — fetching the text on
open — saves the bytes but adds a round trip and a loading state to a document that must always be
readable. Accepted, and worth revisiting only if page weight becomes a real problem.

**Reuse:** ticket 23 (checkout) needs the same window for the terms at the point of purchase, which is why
`LegalModal` takes a slug rather than being footer-specific.
