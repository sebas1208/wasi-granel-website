# 27: Legal documents — Términos y Condiciones + Política de Privacidad, as reusable modals

**What to build:** The two legal documents an online shop needs, rendered as **modals from ONE reusable
component** so the same text serves the footer, checkout (ticket 23) and the contact form's consent
checkbox — instead of three implementations drifting apart.

Split out of ticket 24 (item 5b) at the owner's request: *"let's note to add both on the other ticket
for legal terms and related."*

**Blocked by:** nothing, but the **text** is the owner's to supply or approve. **Ticket 23 (checkout)
is blocked by this** — payment providers routinely require published terms.

**Status:** needs-info — waiting on the owner's text (or a go-ahead for me to draft it).

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
