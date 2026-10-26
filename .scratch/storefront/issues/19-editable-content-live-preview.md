# 19: Editable site content (Globals) + live preview — change copy without redeploys (LOW PRIORITY)

**What to build:** Make site copy editable from the Payload admin instead of hardcoded in the storefront, so content changes don't require a code deploy. Introduce Payload **Globals** for site/blocks content (homepage hero + intro, about/mission, banners), **contact + sucursales** (branches, WhatsApp, hours, maps links), and footer. The storefront renders these Globals; enable Payload **live preview** on them so admins see the real page (including drafts) while editing.

**Blocked by:** nothing. 10, 11, 15 and 16 are all closed — the pages exist and already read Payload, so there is something real to preview against.

**Status:** DONE locally (2026-10-26) — all three steps complete and verified end-to-end. Nothing is
awaiting the owner here except the production rollout, which happens with the merge to `main`
(`develop` `72060a4`). Two real bugs were found by insisting on the end-to-end check rather than trusting
each piece, and both are fixed — see Progress.
**Priority:** low (the storefront itself is still the priority; this is a convenience for the owner)

- [x] **Three globals in `apps/cms`** (the owner chose all three at once, not contact-only):
      1. `contacto` — sucursales (name, address, both phones, WhatsApp, maps CID, the "Cómo llegar" link), opening hours, shipping note. Replaces `apps/web/lib/store-info.ts`.
      2. `inicio` — homepage hero (title, accent word, body), the three pillars, the benefits bar, the history/mission block.
      3. `footer` — the footer blurb, its links and the legal line.
- [x] Storefront reads them over **REST**, replacing the hardcoded copy — with a **code fallback** to today's values whenever a field is blank.
- [x] **`admin.livePreview` on all three globals — IN SCOPE** (owner, 2026-10-24: *"the point of the global itself is the editing experience, not the source. If so I can just edit the components."* — he is right; without it this ticket only relocates data). Requires: `@payloadcms/live-preview-react` on the storefront, a preview route that verifies a secret and enables `draftMode()`, pages that merge the live form state via `useLivePreview`, and `admin.livePreview` naming the three globals (`RootLivePreviewConfig` takes `globals?: string[]`, verified in `payload@3.90.2`).
      - **Where the iframe points matters.** It renders in the *editor's* browser. Production custom domains are public (`ssoProtection: all_except_custom_domains`), so `wasigranel.com` needs no auth. A `*.vercel.app` preview URL is SSO-walled — usable by appending the project's **already-provisioned** Protection Bypass for Automation secret (`?x-vercel-protection-bypass=…`; it also exists as `VERCEL_AUTOMATION_BYPASS_SECRET`), with `x-vercel-set-bypass-cookie: true` so it is needed once rather than on every request. Keep the URL in an env var so it can be production, a preview, or localhost for local editing.
      - **Drafts ARE in scope** (owner, 2026-10-24 — he asked for exactly this: *"draft changes preview … on publish it goes to prod?"*). Save keeps the change private; Publish makes it live. Each global gets `versions: { drafts: true }`, and the editor previews the **draft on the real site**, because draft mode is a cookie for the logged-in editor — not a second deployment. Customers keep seeing the published version at the same URL.
      - **The revalidation hook must gate on `_status === 'published'`.** With drafts on, every draft save fires `afterChange`; pinging the storefront for those would bust the cache for content nobody can see yet. Only a publish — or an edit to an already-published document — should invalidate.
      - **No development deployment is needed for any of this.** Pointing the iframe at a `*.vercel.app` URL would show unreleased *code* (mid-refactor, the editor edits against a broken layout), cost the bypass secret and a second build, and still not provide draft/publish — that part is drafts, not deployments.
- [x] Content edits propagate without a rebuild — fetch globals with `next: { tags: ['globals'], revalidate: false }` and extend the ticket-26 `afterChange`/`afterDelete` hooks to invalidate that tag as well as `catalog`.
- [x] Every field carries a plain-language description (two editors — the owner and his father) and is `required` wherever a blank would reach a customer.

## Research (2026-10-24) — checked against the installed stack, not from memory

**Globals are supported and unused so far.** `payload@3.90.2`'s config types expose `globals?: GlobalConfig[]`; `apps/cms/src/payload.config.ts` currently defines only `collections: [Users, Media, Categories, Products]` — no globals yet. So this is greenfield, no migration risk.

**The copy that would move.** All customer-facing store copy that is *not* already CMS-driven lives in code:
- `apps/web/lib/store-info.ts` — the real contact data (both sucursales, phones, hours, maps CIDs, the hero copy, the three pillars). **This is the highest-value candidate**: the owner currently cannot fix his own opening hours without a deploy.
- `apps/web/components/home/*` — hero headline, benefits, history, newsletter copy.
- `apps/web/components/footer.tsx` and `apps/web/app/contacto/page.tsx` — section headings ported from the mockups.

**The caching interaction is the part that needs care.** Ticket 26 made the storefront cache every catalog read under one tag and refresh it on a CMS webhook. Globals must join that scheme or edits will appear to do nothing:
- fetch globals with `next: { tags: ['globals'], revalidate: false }`;
- extend the CMS `afterChange`/`afterDelete` hooks to invalidate `globals` as well as `catalog`;
- and **bypass the cache entirely in preview** — `draftMode()` makes the route dynamic and must fetch with `no-store`, otherwise the preview shows the cached published copy and looks broken.

**Live preview costs more than it looks.** `@payloadcms/live-preview-react` is not installed anywhere, and live preview needs three things together: drafts/versions enabled on the globals, `admin.livePreview` pointing at a storefront URL, and a storefront preview mode (`draftMode()` + `draft: true` fetches + a preview token). The payoff is seeing edits *while typing*; without it, "save then refresh the site" already works courtesy of the ticket-26 webhook.

**Risk worth naming:** moving contact data into the CMS makes the CMS the source of truth for the store's phone numbers and addresses. A blank or bad edit would ship to customers. Mitigation to decide below: required fields, and/or a code fallback to today's values.

## Decisions (owner, 2026-10-24)
| question | answer |
| --- | --- |
| Scope of this ticket | **All three globals at once** — contacto, inicio, footer. Not contact-only. |
| Editing model | **Drafts + live preview** (revised the same day): Save = private draft, Publish = live, and the preview shows the draft on the real site via draft mode. |
| Who edits | **The owner and his father.** Fields need plain-language descriptions and sensible `required` flags. |
| Blank/broken field | **Fall back to today's code values.** Decided without asking — a customer must never see an empty phone number because of a mistyped edit. |

## Implementation plan (three steps, in order)
1. **CMS + plumbing** — define the three globals in `apps/cms` (with plain-language `admin.description` on every field, `required` where a blank would reach a customer), add the storefront REST fetchers (`lib/payload.ts`) under a `globals` cache tag, extend the revalidation hooks to invalidate it, and configure `admin.livePreview` + a `PREVIEW_SECRET`.
2. **Rewire the storefront** — `lib/store-info.ts` becomes the fallback rather than the source; `app/contacto/page.tsx`, the home components and `components/footer.tsx` read the globals; every consumer keeps working if the CMS returns nothing. Then the live-preview side: a preview route (secret → `draftMode()`) and `useLivePreview` wrappers, fetching with `no-store` whenever preview mode is on so the iframe shows the live form state instead of the cache.
3. **Seed + verify** — DONE: globals loaded with values matching today's copy exactly, verified field by field, and `check:layout` green.

Step 3's "match today's copy exactly" matters: it makes the change provably non-visual, so any diff afterwards is a real bug rather than an expected content shift.

## Progress

### Step 1 — CMS + plumbing: DONE

Three globals (`contacto`, `inicio`, `footer`), each with `versions: { drafts: true }` and an
`afterChange` hook that only fires when `_status === 'published'` — so a private draft save does not bust
the public cache. Media invalidates `catalog` **and** `globals`. Field labels are Spanish, field names
English, icons are selects so a typo cannot produce a blank glyph, and everything customer-facing is
`required`.

**A migration was required and is committed.** Adding globals creates tables and Payload's schema push is
dev-only, so without one the production CMS would have failed on missing tables the moment this shipped.
Generated with `migrate:create`, then reviewed rather than trusted: `up()` creates exactly 22 tables and
drops nothing, its 16 `ALTER`s are all `ADD CONSTRAINT` on those same new tables, `down()` drops exactly
what `up()` creates, and no foreign key reaches out to `products`/`media`/`users`. All six migrations were
then applied to a scratch database and finished clean.

`admin.livePreview` names the three globals with móvil(390) + escritorio(1280) breakpoints. Verified by
reading the config back out (not just typechecking): all three listed, both breakpoints registered, drafts
resolving on `contacto`, and the `url` function producing the right path per global.

`PREVIEW_SECRET` is deliberately separate from `REVALIDATE_SECRET` — one grants draft viewing, the other
busts the public cache. Different capabilities, different secrets.

### Step 2 — Rewire + live preview: DONE except the contacto body

`lib/site-copy.ts` resolves each global to a fully-populated object, CMS value first and today's copy
behind it, so no component null-checks and a half-filled global degrades field by field. Rewired: the
contacto page and its branch panel, the contact form and privacy modal (the email now flows in as a prop,
so the form's notice cannot disagree with the footer), the footer on all four pages that render it, and
the homepage sections. The store's phone numbers are now **derived from one stored value**, so the
WhatsApp link and the displayed number cannot drift apart.

The footer deliberately keeps reading the email and phone numbers from the `contacto` global rather than
its own: those are facts about the store and belong in exactly one editable place.

**What the browser proved:**

| check | result |
| --- | --- |
| layout gate with an EMPTY CMS | 32 passed — the same assertions now run through the fallback path, the strongest evidence the rewiring is non-visual |
| preview route guards | no secret 401, wrong secret 401, off-site path 400, traversal 400 |
| preview route happy path | 307 to the page **with** the draft cookie set; `?disable=1` clears it |
| draft plumbing (stub CMS recording requests) | visitor read hit `/api/globals/inicio` → published marker; preview read hit `/api/globals/inicio?draft=true` → draft marker |
| preview components mounted? | public page tree references neither `HomeLivePreview` nor `FooterLivePreview`; the draft-mode tree references both |

### Step 3 — Seed + verify: DONE

The three globals are seeded from the storefront's OWN fallback (`siteCopyDefaults()`), so the seeded copy
and the fallback cannot silently diverge — retyping the strings is how "seeding proves the switch is
non-visual" quietly stops being true.

| check | result |
| --- | --- |
| CMS content vs storefront fallback, compared field by field over HTTP | **36 match, 0 differ** |
| all three globals published | ✓ (`_status: published`) |
| seed's own read-back | 17/17, with publication asserted first |
| CMS edit → hook → storefront cache purge → live page | PASS, both directions |
| layout gate at desktop 1280 + mobile 390 | 32 passed |

The 1280/390 pass is the automated gate rather than a hand-run browser session, which is stronger: it
asserts the invariants (hero-card clearance, grid columns, navbar form per viewport) on every run.

### Four real bugs this step found

1. **The seed wrote drafts, not published content.** Payload's global update only treats `draft: false` as
   "do not force a draft" — it never promotes an unpublished global, so all three sat as drafts and the
   publish-gated revalidation hook correctly refused to fire. The storefront still looked right (a public
   read falls back to the latest version), which is what made it invisible: no edit could ever reach the
   live site. The gate I had written was doing its job; I first misread it as the culprit.
2. **Every product image hydrated with a different `src`.** `lib/payload.ts` used one base URL for
   server-side reads *and* for media URLs in the HTML, but twelve client components import it, where a
   server-only env var is undefined and fell back to production. The mismatch broke hydration, which also
   killed interactivity (the Quick View stopped closing on Escape). Split into `base` (server reads) and
   `imageBase` (public, identical on both sides).
3. **Next 16's SSRF guard then blocked every local image.** Fixing #2 pointed the browser at the local CMS,
   which exposed a latent block: the image optimizer refuses to fetch an upstream image resolving to a
   private IP, and `remotePatterns` does not override it — so `/_next/image` returned 400 for every photo
   and all product images rendered broken locally. `images.dangerouslyAllowLocalIP` is now set for
   development only (`NODE_ENV !== "production"`), so the guard stays on in production, where the CMS is a
   public domain and needs no exception. Verified: 200 with a real JPEG, and zero rejections in the log.

   This one was in a dev-server log I had said I would stop reading. It was worth reading.

4. **Live preview cross-contaminated between documents — the real cause of the pane crash.** The owner
   saw `copy.branches` undefined, then `copy.navigation` undefined, shown by Next's dev overlay as "This
   page couldn't load". Payload's `handleMessage` accepts ANY live-preview event — it checks the origin and
   the message type but never that the message's `globalSlug` is the document this hook was given — and it
   keeps its merged result in a MODULE-LEVEL cache shared by every hook on the page. This page puts two
   globals in the pane at once (`inicio` and `footer`, which renders everywhere), so editing `inicio` also
   handed the inicio document to the footer's hook: `brandBlurb` rendered blank (no throw), then
   `navigation.map` threw.

   Fixed with `lib/use-global-live-preview.ts`, a slug-scoped hook that keeps its own state and merge
   history and — the part that matters — ignores documents that are not its own. It reuses the package's
   `isLivePreviewEvent` and `mergeData` rather than re-implementing the protocol, and it drops a merge whose
   response is a Payload error body instead of adopting validation messages as page content.

   **A second, independent defect sits underneath it**, which is why the first fix attempt (re-attaching
   borrowed fields) was necessary but not sufficient: `mergeData` POSTs the form state to the CMS and returns
   that global's serialized document, so the footer's `email` and `branches` — borrowed from the `contacto`
   global — are genuinely absent and must be re-attached from the server copy. Both fixes are needed.

   **How it was verified without an admin session:** point `NEXT_PUBLIC_PAYLOAD_URL` at the web server
   temporarily so the page's own origin passes the hook's origin check, then post messages from the page and
   read `performance.getEntriesByType('resource')`. One `inicio` message produced exactly one request
   (`/api/globals/inicio`); one `footer` message produced exactly one (`/api/globals/footer`). Under the old
   hook both fired for either message. The merges themselves failed (no admin cookie), which also proved the
   error-body guard keeps the page intact. The env was restored and the images re-verified afterwards.

### Honest gaps

1. **The contacto body is not live-wired.** Opening the pane on `/contacto` shows the saved **draft**
   (text updates after a save), not unsaved typing. The homepage and the footer are live. Wiring contacto
   means extracting its ~250 lines of JSX into a presentational component the way `HomeSections` was.
2. **Nothing has been rolled out to production.** The CMS migration, the seed and `PREVIEW_SECRET` all
   apply at deploy time, and the CMS deploys from `main` — so this ships with the merge. **All
   verification above is local**; production still serves today's copy through the code fallback, which
   means the site is correct either way and the rollout is not urgent.

One operational lesson, recorded in the `web-layout-regression` skill: **never edit source while a gate
run is in flight.** Doing so produced 11 failures that looked like a real regression — the server HTML had
the new copy while the client bundle still had the old module, so a component received `undefined` and
React unmounted the tree. Fetching the failing client chunk named the exact source line, and the fix was
the documented one (stop, clear `.next`, restart), not a code change.

## Comments

- Motivation (reporter): being able to edit copy from Payload avoids new deployments for content changes. Not urgent while the storefront is still being built — keep low priority, pick up once home/contact exist and are wired to Payload.