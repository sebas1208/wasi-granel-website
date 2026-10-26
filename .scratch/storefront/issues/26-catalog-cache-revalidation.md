# 26: Cache the catalog and invalidate it from Payload (webhook → on-demand revalidation)

**Status:** **Done — closed 2026-10-23** (`develop` `526fa41`). **Not in production** and **not yet
active**: the code is complete and verified, but the shared secret is not set on either platform yet,
so the webhook is currently a silent no-op — see *To activate* at the bottom.

**What to build:** Stop reading the catalog uncached, and stop relying on a timer. Prerender the
storefront, tag the cached catalog reads, and have Payload tell the site when something changed so
only the affected cache is busted.

This closes the one decision ticket 16 parked: the homepage currently makes **three uncached Payload
calls per request**. Correct at low traffic, wasteful at any real traffic.

## Decisions taken (owner, 2026-10-23) — deliberately NOT what I first proposed

| I proposed | Owner chose | Why |
| --- | --- | --- |
| A 1-hour safety-net revalidate, so a missed webhook self-heals | **No timer — the cache lives until invalidated** | The catalog barely changes, "at least until we introduce catalog existence". A missed webhook can be re-published or invalidated by hand. |
| Per-entity tags (`product:<slug>`) so one edit doesn't bust all 278 products | **Coarse `catalog` tag** | Enough at this size; fine tags stay the upgrade path if the catalog grows. |
| — | **Do it now** | On the free tier, every avoided CMS round-trip is the point. |

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
   ~~Keep a long `revalidate` (e.g. 3600) as a safety net.~~ **NOT DONE — the owner rejected a timer:**
   the cache now lives until it is invalidated. A missed webhook means the site keeps serving the old
   catalog until someone calls the endpoint by hand or redeploys. That is the accepted trade.
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

## Acceptance — how each item was actually verified

- [x] **`next build` shows the homepage prerendered** — build output `┌ ○ /`, with `/api/revalidate`
      as `ƒ`. Exact, no interpretation needed.
- [x] **An unauthenticated POST is rejected** — no secret → `401`, wrong secret → `401`. Also posted
      `{"tags":["../../etc/passwd","ok-tag"]}`; the response shows only `["ok-tag"]`, so the traversal
      tag was filtered out.
- [x] **The hook cannot block a save** — ran the real hook function with `STOREFRONT_URL` pointing at a
      dead port: it logged and returned **without throwing**. The no-secret case is a silent no-op.
- [x] **The layout gate stays green** — `check:layout` **31 passed, 1 skipped**; `tsc` clean in both packages.
- [x] **Invalidation really does refresh cached content** — proved with a **stub CMS**, the only way to
      tell cached from fresh content unambiguously. Ran the built server with `PAYLOAD_URL` pointed at a
      stub carrying a marker the real catalog cannot contain:

      | step | result |
      | --- | --- |
      | before invalidation | real catalog present, stub marker absent |
      | `POST /api/revalidate` | `{"revalidated":true,"tags":["catalog"]}` |
      | cache headers | `x-nextjs-cache: HIT` → **`STALE`** |
      | following request | **stub marker present, real catalog gone** — it re-rendered from new data |
      | then | back to `x-nextjs-cache: HIT` |

- [x] **"An edit in Payload appears on the site" — now PROVEN against the real CMS** (2026-10-26, closing
      this ticket's only open item). `verify:cms-to-site` edits a Global, waits, polls the running
      storefront and reverts, against a **production build** so the cache is genuinely in play:

      | reading | result |
      | --- | --- |
      | control, before any edit | `false` — the stale copy really was being served from cache |
      | after the edit | `true`, on the **second** request |
      | after the revert | `false`, on the second request |

      The second request is not a quirk: it is the stale-while-revalidate behaviour this ticket
      documented — the first request after an invalidation can still serve the old page while the new one
      regenerates behind it. A single-fetch check therefore reports a false negative, which is exactly
      how the probe first "failed".

      Two real bugs were in the way and are fixed: the site-copy seed was writing drafts rather than
      publishing (so the publish-gated hook correctly refused to fire), and a server/client base-URL
      divergence made every product image hydrate differently. Both are committed.

## To activate (one-time, owner)
1. Generate a secret and set **the same value** in both places:
   - **Coolify** (CMS): `REVALIDATE_SECRET` — optionally `STOREFRONT_URL` (defaults to `https://wasigranel.com`).
   - **Vercel** (web): `REVALIDATE_SECRET`.
2. Redeploy the CMS so the collection hooks are picked up.
3. Then: edit a product in Payload, load the site, refresh once — it should show the change.
4. If a webhook is ever missed, invalidate by hand:
   `curl -X POST https://wasigranel.com/api/revalidate -H "x-wasi-secret: $REVALIDATE_SECRET"`

## Two behaviours worth knowing
- **It is stale-while-revalidate.** The FIRST request after an invalidation can still serve the old page
  while it regenerates in the background; a refresh then shows the change. Worth telling the owner, so a
  stale first look isn't mistaken for a broken webhook.
- **Once the secret is set, an edit is only as live as the webhook.** With no timer, a failed POST is
  silent (by design) and the catalog stays stale until step 4 above or a redeploy.

## Follow-up discovered while verifying (worth remembering)
Running `next build` while `next dev` is running **wedges the dev server** — both write to `.next`. The
homepage degraded to an empty carousel and the layout gate failed, which looked exactly like a
regression from this change. It was not: the fix is the documented one (kill the dev server,
`rm -rf .next`, restart), after which the homepage rendered all 11 cards again and the gate went green.
Do not trust a gate run taken immediately after a build.

(A second false alarm in the same sitting: `grep -c` counts matching LINES, and the page HTML is a
single line — so an 11-card homepage reported as "1". Count occurrences with `grep -o … | wc -l`.)

## Note: the bigger Next 16 option, deliberately NOT chosen here
Next 16's **Cache Components** (`cacheComponents: true` + `'use cache'` + `cacheTag()`) is the modern
route and would give true partial prerendering — a static shell with the catalog as a cached component
that updates by tag. It is a larger semantic change (Suspense boundaries, no runtime APIs inside cached
components) and not needed to get what was asked for. Worth revisiting after launch if page speed or
CMS load becomes a real problem.
