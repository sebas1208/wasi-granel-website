# 16: Wire the frontend to Payload (ISR)

**What it was:** Replace the mock fixtures with live data from the Payload API per ADR-0001, using
Incremental Static Regeneration so the storefront reads products/categories from Payload and rebuilds
on change.

**Blocked by:** 09 (Payload loaded), 11, 12, 13 (pages exist on mocks). — all Done.

**Status:** **Done — closed 2026-10-21** (`develop` — see the commit that closed this ticket).

## Outcome: the premise was already obsolete

This ticket's body described work that had been done organically as 11/12/13 landed. Checked on
2026-10-21 before starting it:

- **No mock fixtures exist in the repo at all.** `find apps/web -iname '*fixture*' -o -iname '*mock*'`
  returns nothing; ticket 03's fixtures were never carried into the app. So "demote the fixtures" is
  a no-op, and "replace fixtures with live data" was already true.
- **13 files read the live CMS** through `lib/payload.ts` — the homepage, `/tienda`, the catalog
  cards, Quick View, the filter sidebar, the toolbar, the active chips, the cart drawer: the whole
  storefront data path.
- **Catalog edits already propagate with no redeploy** — via Next's *data cache* rather than route
  ISR: `revalidate: 60` on the tienda/deep-link reads and `revalidate: 120` on the category counts.
  The homepage reads with `no-store` (deliberate fresh reads).
- **`next build` passes against the live API** — verified, exit 0.

So this ticket is not "wire it up"; it is a *verification and tidying* ticket, and it found one real
defect:

### The defect it found

The build logged this on every run:

```
[homepage] failed to load catalog from Payload: Error: Dynamic server usage:
Route / couldn't be rendered statically because it used revalidate: 0 fetch ...
```

Nothing had failed. With `no-store` reads, Next attempts a static pass, the fetch throws its
**DYNAMIC_SERVER_USAGE sentinel** to say "this route must be dynamic", and the homepage's `catch`
swallowed that sentinel and reported it as a CMS failure. Catching a control-flow error is fragile —
Next relies on it propagating to classify the route.

Fixed: the homepage now declares `export const dynamic = "force-dynamic"` (its actual, already-true
intent, so Next no longer attempts the impossible static pass), and the `catch` rethrows the sentinel
via an `isDynamicServerUsage` guard while still degrading gracefully on real fetch errors. The build
output is now clean and `/` is still `ƒ (Dynamic)`.

## Acceptance — verified
- [x] Products and categories render from Payload across homepage/Tienda/deep links (13 files; no fixtures exist).
- [x] Catalog edits propagate without a manual redeploy (`revalidate: 60` reads on tienda; fresh reads on the homepage).
- [x] Mock fixtures demoted / absent — none exist in the repo.
- [x] `next build` passes against the live API (exit 0).
- [x] Cache intent is declared per route, and Next's control-flow sentinel is no longer swallowed as a data error.

## Open — parked, not blocking (the only thing this ticket leaves behind)

**The homepage's freshness/caching trade is a deliberate choice that should be revisited if CMS load
matters.** It currently makes three uncached Payload calls per request (categories, popular, full
catalog). At low traffic that is fine and gives instant freshness; if the site gets real traffic it
triples CMS load per visit on a single VPS. The alternative is one line —
`export const revalidate = 60` instead of `force-dynamic` — matching `/tienda`, at the cost of up to
60s of staleness after a CMS edit.

Not started, because it is a behaviour decision, not a defect. The line to change is commented in
`apps/web/app/page.tsx`.
