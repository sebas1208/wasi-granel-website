# 19: Editable site content (Globals) + live preview — change copy without redeploys (LOW PRIORITY)

**What to build:** Make site copy editable from the Payload admin instead of hardcoded in the storefront, so content changes don't require a code deploy. Introduce Payload **Globals** for site/blocks content (homepage hero + intro, about/mission, banners), **contact + sucursales** (branches, WhatsApp, hours, maps links), and footer. The storefront renders these Globals; enable Payload **live preview** on them so admins see the real page (including drafts) while editing.

**Blocked by:** nothing. 10, 11, 15 and 16 are all closed — the pages exist and already read Payload, so there is something real to preview against.

**Status:** ready-for-agent — researched 2026-10-24; the findings below correct two of this ticket's own assumptions, and the open questions are at the bottom.
**Priority:** low (the storefront itself is still the priority; this is a convenience for the owner)

- [ ] Define Globals in `apps/cms`: site copy (homepage hero/intro, about, banners), contact + sucursales, footer.
- [ ] Storefront reads the Globals over **REST**, replacing the hardcoded copy. (**Correction:** this ticket said "via the Payload Local API" — that is not possible here. The Local API only exists server-side *inside* the Payload app; `apps/web` is a separate application and reaches Payload over HTTP, exactly like the catalog already does via `lib/payload.ts`.)
- [ ] Enable `admin.livePreview` on the Globals with a storefront preview route (renders draft content via preview token).
- [ ] Content edits propagate without a rebuild (revalidates Vercel ISR / refetches).

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

## Open questions for the owner
1. **Which content first?** Strong recommendation: **contact + sucursales only** (it is the piece you cannot currently change yourselves, and it proves the pattern end-to-end). Homepage copy and footer can follow as separate small steps. — *Would you rather do all of it in one go?*
2. **Live preview now, or "save and refresh"?** Recommendation: **skip live preview initially.** Save-then-refresh already works via the webhook, and live preview adds drafts + draft mode + a new package. Add it later if editing feels blind. — *Agree, or is seeing it while typing worth the extra work to you?*
3. **Who will edit this?** You, your father, or both? It decides how strict the fields should be (required vs optional) and whether drafts matter.
4. **Do you want drafts** (prepare a change, publish later), or is "save = live" fine?
5. **If a global is blank or broken, should the site fall back** to today's hardcoded values, or show the gap plainly? Recommendation: **fall back** — a customer must never see an empty phone number because of a mistyped edit.

## Comments

- Motivation (reporter): being able to edit copy from Payload avoids new deployments for content changes. Not urgent while the storefront is still being built — keep low priority, pick up once home/contact exist and are wired to Payload.