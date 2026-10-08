# 19: Editable site content (Globals) + live preview — change copy without redeploys (LOW PRIORITY)

**What to build:** Make site copy editable from the Payload admin instead of hardcoded in the storefront, so content changes don't require a code deploy. Introduce Payload **Globals** for site/blocks content (homepage hero + intro, about/mission, banners), **contact + sucursales** (branches, WhatsApp, hours, maps links), and footer. The storefront renders these Globals; enable Payload **live preview** on them so admins see the real page (including drafts) while editing.

**Blocked by:** 10 (app shell) → 11 (homepage) + 15 (contacto) — the storefront pages must exist and read from Payload (09/16) before there's anything to preview against.

**Status:** ready-for-agent
**Priority:** low (deferred — v1 storefront first; revisit after home/contact pages are built)

- [ ] Define Globals in `apps/cms`: site copy (homepage hero/intro, about, banners), contact + sucursales, footer.
- [ ] Storefront reads the Globals via the Payload Local API (replacing hardcoded copy on home/contact/footer).
- [ ] Enable `admin.livePreview` on the Globals with a storefront preview route (renders draft content via preview token).
- [ ] Content edits propagate without a rebuild (revalidates Vercel ISR / refetches).

## Comments

- Motivation (reporter): being able to edit copy from Payload avoids new deployments for content changes. Not urgent while the storefront is still being built — keep low priority, pick up once home/contact exist and are wired to Payload.