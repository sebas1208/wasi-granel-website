# 26: Cache the catalog and invalidate it from Payload (webhook → on-demand revalidation)

**What to build:** Stop reading the catalog uncached, and stop relying on a timer. Prerender the
storefront, tag the cached catalog reads, and have Payload tell the site when something changed so
only the affected cache is busted.

This closes the one decision ticket 16 parked: the homepage currently makes **three uncached Payload
calls per request**. Correct at low traffic, wasteful at any real traffic.

## Why this is possible (verified against the installed code, 2026-10-21)

- **Payload has no built-in `webhooks` config** — checked: there is no `webhooks` key in
  `payload@3.90.2`'s config types. But every collection exposes
  `hooks.afterChange` / `afterDelete` (`collections/config/types.d.ts:534-542`), and a hook can do an
  HTTP POST. That is the documented Payload + Next.js pattern; it is a few lines, not a missing feature.
- **Next 16.2.0 exports** `revalidateTag`, `revalidatePath`, `updateTag`, `cacheTag`, `cacheLife` from
  `next/cache` (confirmed by introspecting the installed package).
- Payload (VPS, Coolify) can reach the storefront (Vercel) over outbound HTTPS. No networking work.

## Current state (so this ticket is honest about what changes)

| read | today | after |
| --- | --- | --- |
| homepage: categories / popular / full catalog | `no-store` (3 calls per request) + `force-dynamic` | prerendered, cached under tag `catalog` |
| `/tienda` query, deep link, category counts | `revalidate: 60` / `120` (data cache) | same tagging, timer removed |
| `/contacto` | already static (`○`) — no CMS data | unchanged |

`lib/payload.ts`'s `fetch` is the single chokepoint — every read goes through it, which is what makes
this a small change rather than a sweep.

## Plan

1. **Tag at the chokepoint.** `lib/payload.ts` passes `next: { tags: [...], revalidate: <fallback> }`
   instead of `no-store`. Coarse tag `catalog` for everything, plus per-entity tags
   (`product:<slug>`, `category:<slug>`) where the call knows its entity — a coarse tag alone busts all
   278 products on any single edit, which is fine now but would not be at 10× the catalog.
   Keep a long `revalidate` (e.g. 3600) as a safety net: if a webhook is ever missed, the site
   self-heals within the hour rather than serving stale content forever.
2. **Drop `force-dynamic` from `app/page.tsx`** so the homepage actually prerenders. That reverses part
   of the 16 fix — deliberately: 16 bought correctness at build time, this buys caching. The
   `isDynamicServerUsage` guard stays (it is still the right way to treat that sentinel).
3. **Add the revalidation endpoint** — `app/api/revalidate/route.ts`: `POST`, requires a shared secret
   header, reads the tags/paths from the body, calls `revalidateTag` / `revalidatePath`. Reject
   anything without the secret (401). Untagged/unknown input is ignored, never trusted into a path.
4. **Add the Payload hooks** — `afterChange` + `afterDelete` on Products, Categories and Media, POSTing
   `{ tags: [...] }` to the storefront with the secret. Fire-and-forget with a timeout and a logged
   failure: **a CMS save must never fail because the storefront was unreachable.**
5. **Wire the secret** — `REVALIDATE_SECRET` in both Vercel (web) and Coolify (cms). To be stored as
   secrets, never committed. Until it is set, the endpoint returns 503 and the site still works off the
   time-based fallback, so landing the code before the secret cannot break anything.
6. **Redeploy the CMS** (Coolify) to pick up the hooks — the container runs `payload migrate && next start`.

## Acceptance
- [ ] A product edited in Payload appears on the homepage **and** its tienda card within seconds, with no redeploy.
- [ ] The same product's deep link (`/tienda?producto=<slug>`) reflects the edit.
- [ ] An unauthenticated POST to `/api/revalidate` is rejected (401), asserted in the gate or a test.
- [ ] Saving a product with the storefront unreachable still succeeds in the CMS (the hook cannot block a save) — assert by pointing the hook at a dead URL.
- [ ] `next build` output shows the homepage as prerendered (`○`), not `ƒ`.
- [ ] The layout gate stays green.

## Open questions for the owner (answer before/while building)
- **Staleness window if a webhook is missed:** proposing a 1-hour safety-net revalidate. Acceptable? 
- **Coarse vs fine tags now:** fine-grained (`product:<slug>`) is a little more code and much better at
  scale. Recommending we do it now, while `lib/payload.ts` is the only place to touch.
- Nothing here changes what the customer sees except **speed** — the visible content stays identical.

## Note: the bigger Next 16 option, deliberately NOT chosen here
Next 16's **Cache Components** (`cacheComponents: true` + `'use cache'` + `cacheTag()`) is the modern
route and would give true partial prerendering — a static shell with the catalog as a cached component
that updates by tag. It is a larger semantic change (Suspense boundaries, no runtime APIs inside cached
components) and not needed to get what was asked for. Worth revisiting after launch if page speed or
CMS load becomes a real problem.
