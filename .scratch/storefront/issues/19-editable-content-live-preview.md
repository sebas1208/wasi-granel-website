# 19: Editable site content (Globals) + live preview — change copy without redeploys (LOW PRIORITY)

**What to build:** Make site copy editable from the Payload admin instead of hardcoded in the storefront, so content changes don't require a code deploy. Introduce Payload **Globals** for site/blocks content (homepage hero + intro, about/mission, banners), **contact + sucursales** (branches, WhatsApp, hours, maps links), and footer. The storefront renders these Globals; enable Payload **live preview** on them so admins see the real page (including drafts) while editing.

**Blocked by:** nothing. 10, 11, 15 and 16 are all closed — the pages exist and already read Payload, so there is something real to preview against.

**Status:** ready-for-agent — researched **and scoped with the owner** on 2026-10-24. The findings below correct two of this ticket's own assumptions; the agreed decisions and a three-step plan sit underneath them.
**Priority:** low (the storefront itself is still the priority; this is a convenience for the owner)

- [ ] **Three globals in `apps/cms`** (the owner chose all three at once, not contact-only):
      1. `contacto` — sucursales (name, address, both phones, WhatsApp, maps CID, the "Cómo llegar" link), opening hours, shipping note. Replaces `apps/web/lib/store-info.ts`.
      2. `inicio` — homepage hero (title, accent word, body), the three pillars, the benefits bar, the history/mission block.
      3. `footer` — the footer blurb, its links and the legal line.
- [ ] Storefront reads them over **REST**, replacing the hardcoded copy — with a **code fallback** to today's values whenever a field is blank.
- [x] ~~Enable `admin.livePreview` + drafts~~ — **dropped by the owner (2026-10-24): save = live.** This removes the `@payloadcms/live-preview-react` dependency, the drafts/versions config on the globals, and the `draftMode()` preview route. Content is published the moment it is saved; the ticket-26 webhook is what makes the site pick it up.
- [ ] Content edits propagate without a rebuild — fetch globals with `next: { tags: ['globals'], revalidate: false }` and extend the ticket-26 `afterChange`/`afterDelete` hooks to invalidate that tag as well as `catalog`.
- [ ] Every field carries a plain-language description (two editors — the owner and his father) and is `required` wherever a blank would reach a customer.

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
| Editing model | **Save = live.** No drafts, no live preview (both dropped — see the checklist). |
| Who edits | **The owner and his father.** Fields need plain-language descriptions and sensible `required` flags. |
| Blank/broken field | **Fall back to today's code values.** Decided without asking — a customer must never see an empty phone number because of a mistyped edit. |

## Implementation plan (three steps, in order)
1. **CMS + plumbing** — define the three globals in `apps/cms`, add the storefront REST fetchers (`lib/payload.ts`) under a `globals` cache tag, and extend the revalidation hooks to invalidate it.
2. **Rewire the storefront** — `lib/store-info.ts` becomes the fallback rather than the source; `app/contacto/page.tsx`, the home components and `components/footer.tsx` read the globals; every consumer keeps working if the CMS returns nothing.
3. **Seed + verify** — load globals whose values match today's copy exactly (so nothing changes visually on day one), then verify in the browser at 1280 + 390 and keep `check:layout` green.

Step 3's "match today's copy exactly" matters: it makes the change provably non-visual, so any diff afterwards is a real bug rather than an expected content shift.

## Comments

- Motivation (reporter): being able to edit copy from Payload avoids new deployments for content changes. Not urgent while the storefront is still being built — keep low priority, pick up once home/contact exist and are wired to Payload.