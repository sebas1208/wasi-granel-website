# 25: Wire the contact form to a real receiver

**What to build:** Connect the `/contacto` form (built in ticket 15) to a backend that actually delivers the message. Ticket 15 deliberately builds the UI **unconnected** — a multi-field form is a poor fit for a `wa.me` link, and the page already has a dedicated WhatsApp button.

**Blocked by:** 15 (the form UI). Needs the user's decision on the provider below.

**Status:** needs-info — the provider choice and the DNS/secret prerequisites are the user's.

## Why this is its own ticket
Shipping a form whose submit shows "¡Mensaje recibido con éxito!" with nothing behind it tells a customer their message was received when it wasn't. Ticket 15 therefore builds the form with validation and an **honest** interim path (on submit, it says the form isn't live yet and points at the existing WhatsApp button). This ticket replaces that with a real send.

## Options (the user has a Resend account)
1. **Resend** — needs: a **verified sending domain** (SPF + DKIM, ideally DMARC, added to `wasigranel.com`'s DNS — the domain is on Vercel), an API key stored as a **secret** (Vercel env var; Hermes secrets for local dev), a route handler, and spam protection. The only friction is the DNS step, which needs the user's access.
2. **The existing Google Apps Script** — `apps/web/app/api/signup/route.ts` already POSTs to a Google Apps Script that writes to a Sheet. Extending it for contact messages needs no DNS and no new secret, but it isn't email.
3. **Email via another provider** — same prerequisites as Resend.

## Scope
- A route handler (`app/api/contacto/route.ts`) that validates the payload **server-side** too (never trust the client), then delivers it.
- Spam protection: a honeypot field plus a simple rate limit — it is a public, unauthenticated endpoint.
- The real success state replaces ticket 15's interim message, and a failure state exists (a send can fail).
- Decide who receives the message and what the `from` / `reply-to` addresses are.

## Acceptance
- [ ] Submitting the form delivers a message that is **read and confirmed** by the recipient — verified by reading the received message, not by the absence of an error.
- [ ] A failed send surfaces an error to the customer instead of a false success.
- [ ] The honeypot + rate limit are in place and a bot-style submission is rejected.
- [ ] No secret is committed; the key lives in the deploy env.
- [ ] Browser-verified per `AGENTS.md` (desktop 1280 + mobile 390).

## Open questions
- Resend, the existing Apps Script, or something else?
- If Resend: can the sending domain be verified (who controls `wasigranel.com`'s DNS)?
- Which address should receive the messages, and what should `from` be (e.g. `hola@wasigranel.com`)?
- Should the customer get an automatic acknowledgement ("we got your message") or only the store?
