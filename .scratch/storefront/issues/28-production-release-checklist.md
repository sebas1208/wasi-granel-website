# 28: Production release checklist — everything that can only happen at the merge

**Status:** living document. It is the gate for `develop → main`; keep it current as tickets land.
**Created:** 2026-10-27, at the owner's request: *"put things like 'verified end-to-end here; it can only be
proven on payload.wasigranel.com once develop goes to main' as an item on the final ticket or a production
release checklist… review everything what we can need in there."*

## Why this exists

Every ticket leaves something behind that **cannot be verified where it was built** — a secret to set in a
dashboard, a migration that runs at boot, a data step, a decision only the owner can make. Those live
inside the ticket that produced them, so they are invisible at the moment they matter. This is the one
place they are collected.

The rule of thumb: **if a ticket says "verified" and the word "production" appears in the same paragraph,
its item belongs here.**

Reference: `docs/production/cms-deployment.md` is the operational runbook (how Coolify is set up, how to
deploy, migration hygiene, backups, from-scratch rebuild). This ticket is the *release gate*; the runbook
is the *how*.

---

## 1. The merge itself

- [ ] Merge `develop → main`. It is a **fast-forward** — `main` is a strict ancestor of `develop`, so there
      are no conflicts and no ordering to worry about.
- [ ] Recognise what the merge *does*: pushes to `main` trigger **both** Coolify (CMS rebuild) **and**
      Vercel (production deploy). `develop` and every other branch only ever produce a Vercel Preview.
- [ ] **The migration must ship in the same push as the code that needs it.** Coolify's container boots
      with `payload migrate && next start`, so the globals tables appear on that boot — and if a migration
      throws, **the CMS never starts**.
- [ ] Migration hygiene before pushing (runbook has the detail): the SQL must be idempotent and additive
      (`ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, enum creation wrapped), and smoked
      **twice** against a prod-shaped scratch DB — the second run must emit only "already exists, skipping".

## 2. Coolify (CMS) environment — set BEFORE the deploy, or the feature fails silently

| variable | state | if it is missing |
| --- | --- | --- |
| `POSTGRES_PASSWORD` | set | the DB container cannot start |
| `PAYLOAD_SECRET` | set | Payload refuses to boot |
| `REVALIDATE_SECRET` | set — **must match Vercel** | the cache-invalidation hook is a **silent no-op**; the storefront then only refreshes on a redeploy (ticket 26) |
| `STOREFRONT_URL` | defaults correctly to `https://wasigranel.com` | must be a **publicly reachable** URL — a `*.vercel.app` preview sits behind Vercel Authentication and gets a 302 SSO redirect instead |
| `PREVIEW_SECRET` | **NOT SET YET — set it, matching Vercel** | Live Preview renders the **not-found page** with nothing logged. This is exactly how the bug was first found (ticket 19) |

- [ ] Add `PREVIEW_SECRET` to Coolify, byte-identical to the value on Vercel (the value is outside the repo
      at `../.env.preview`, never committed).
- [ ] Confirm both shared secrets actually match: `REVALIDATE_SECRET` and `PREVIEW_SECRET`, Coolify vs
      Vercel. A single character of drift produces a silent failure, not an error.

## 3. Vercel (storefront) environment

- [ ] `REVALIDATE_SECRET` — set.
- [ ] `PREVIEW_SECRET` — set for Production, Preview and Development (all as encrypted `Sensitive`).
- [ ] `PAYLOAD_URL` and `NEXT_PUBLIC_PAYLOAD_URL` — the CMS base.
- [ ] `NEXT_PUBLIC_SITE_URL` — used for canonical and OG URLs.
- [ ] **Changing a Vercel env var only affects NEW deployments.** After any change, redeploy, or the old
      value stays live.
- [ ] Vercel CLI is the agent's route to these — `vercel env add`, `vercel env pull` to verify. Preview
      deployments are protected, so `vercel curl <url> --deployment <url>` is how to reach one.

## 4. After the deploy — the domain re-claim (ticket 24, item 7)

Production's domains are currently **aliased down** to the 2026-10-09 pre-homepage build, deliberately, so
the "Espéranos Pronto!" expectation page stayed up. That is a stopgap: **the next production deployment
re-claims the domain on its own**, and the merge is that deployment.

- [ ] `wasigranel.com` serves the **real** storefront — `Productos Populares` present, the "Espéranos
      Pronto!" title gone.
- [ ] It is no longer the Oct 9 build — `vercel inspect https://www.wasigranel.com`, `created` is recent.
- [ ] **If anything deploys to production before the merge**, the alias is lost and the homepage reappears.
      Re-point it with `npx vercel alias set` (exact commands in ticket 24, item 7). Do **not** "fix" it by
      reverting the homepage merge on `main` — git would then treat that branch as already merged and the
      final `develop → main` merge would silently ship *without* the homepage.

## 5. Production data

- [ ] **The globals will exist but be EMPTY.** The migration creates the `inicio` / `footer` / `contacto`
      tables; it does not put anything in them. The storefront falls back to its hardcoded copy, so nothing
      breaks — but the editor opens a blank admin. Run the site-copy seed:
      ```bash
      docker exec "$CONT" sh -c 'cd /repo/apps/cms && npx tsx src/seed/seed-site-copy.ts'
      ```
      (`pnpm --filter @wasi-granel/cms seed:site-copy` locally.) It seeds all three globals to match
      today's copy exactly.
- [ ] `products.price` / `price_unit` backfill has run on production — **the storefront's sort-by-price
      depends on it** (ticket 12):
      ```bash
      docker exec "$CONT" sh -c 'cd /repo/apps/cms && npx tsx src/seed/backfill-price.ts'
      ```
- [ ] **Prices: 6 products are still at `$0`**, waiting on the store's real prices — Semilla de Apio,
      Semillas de Amapola 25 Gr, Manzana Deshidratada, Cloruro de Calcio, Agar Agar, Alginato. Shipping
      with `$0` is a decision, not an accident.
- [ ] Product images (ticket 22) — the sourcing decision is the owner's and his parents'.
- [ ] Catalog is already loaded on production — 278 products + 53 media files (ticket 09).
- [ ] **Back up before the release**, and pull the archives off the VPS (runbook → Backups).

## 6. Features that can ONLY be proven in production

This is the section the owner asked for. Each of these was verified as far as locally possible; production
is the only place the real thing can be exercised.

- [ ] **Ticket 19 — drafts + Live Preview.** Open `https://payload.wasigranel.com/admin`, edit a field, and
      confirm the preview pane updates **without a reload**. Needs `PREVIEW_SECRET` on **both** sides.
      It cannot be tested on a Vercel preview even locally, because preview deployments sit behind Vercel
      Authentication (verified: plain requests get `302`) and the pane is an iframe.
- [ ] **Ticket 26 — cache invalidation.** Save a product in the production CMS and confirm the storefront
      reflects it **without a redeploy**. Needs `REVALIDATE_SECRET` on both sides. Remember it is
      stale-while-revalidate: the first request after invalidation may still serve the old page.
- [ ] **Ticket 27 — the legal documents.** `/legal/terms` and `/legal/privacy` return 200 on production,
      the footer's two links resolve, and the consent link on `/contacto` opens the policy in a new tab.
- [ ] **The contact form still delivers nothing** (ticket 25) — it validates and says so honestly. Confirm
      that is still the intended interim state at release, or land 25 first.
- [ ] **Checkout does not exist** (ticket 23). If the storefront goes public before 23, ordering is by
      WhatsApp only.

## 7. Decisions only the owner can make

- [ ] **Lawyer review** of Términos y Condiciones and Política de Privacidad before the wording binds
      anyone (ticket 27).
- [ ] **Is the storefront ready to be public?** The merge publishes it — the placeholder goes away.
- [ ] Payment provider and the **free-shipping threshold** (ticket 23).
- [ ] Email provider + DNS/secret (ticket 25).
- [ ] Product image sourcing (ticket 22).

## 8. Infrastructure hygiene before release

- [ ] **Ticket 17** — rotate the VPS root password and move to key-only SSH.
- [ ] **Ticket 20** — optimise the Docker build (not blocking, but it fronts every deploy).
- [ ] Coolify **auto-deploy** confirmed on for `main`, so a push actually triggers the rebuild.
- [ ] Backups pulled offsite — and ideally scheduled, because "regularly" is not a schedule.
- [ ] Ticket 18's remaining **DNS** item.

## 9. Known items that will ship as-is (ticket 24 — a choice, not an oversight)

- [ ] The root layout's default page title is stale (`Wasi Granel - Espéranos Pronto!`) — only the 404 page
      shows it.
- [ ] Two image warnings on every visit: the nav logo is the LCP and is lazy; the `/contacto` hero can
      distort.
- [ ] The newsletter (and, later, the contact form) writes to a **Google Apps Script endpoint** whose URL is
      hardcoded and accepts unauthenticated POSTs — to be replaced after launch.
- [ ] The dead "Borrar filtros" control, unused `grams`/`suffix`, and coffee filed under Endulzantes.
- [ ] The pre-existing CMS typecheck error noted on ticket 24.

## 10. The gate — run these on `develop` immediately before the merge

- [ ] `pnpm lint` — 0 errors.
- [ ] `pnpm build` — succeeds, and the route table matches expectations.
- [ ] `pnpm --filter @wasi-granel/web check:layout` — all pass. AGENTS.md: a failing check must be fixed,
      not weakened.
- [ ] `git status` clean and `develop` in sync with `origin/develop`. Unpushed work is work that exists on
      one machine only — this session alone had 40 commits sitting unpushed at one point.
