# 24: Small cleanups — dead code, a broken control, stale warnings

**What to build:** A home for small defects and hygiene items that don't deserve their own ticket. Each one below was verified against the code, not assumed — the causes are recorded so the fixes stay mechanical.

**Blocked by:** nothing.

**Status:** ready-for-agent

## Items

### 1. "Borrar filtros" does nothing (user-reported)
`apps/web/components/tienda/active-chips.tsx:66`:

```tsx
onClick={() => setParams(() => {})}
```

`setParams` receives a **no-op mutate**, so the handler only deletes `page` and then rewrites the URL with the same filters. Nothing is cleared, and the row stays on screen.

Fix: delete the four filter params instead of nothing —

```tsx
onClick={() =>
  setParams((p) => {
    ;["categoria", "modalidad", "precioMax", "q"].forEach((k) => p.delete(k))
  })
}
```

Add a gate assertion: with a filter active, clicking "Borrar filtros" removes every chip and the row disappears.

### 2. Dead code left in the Quick View
`apps/web/components/tienda/weight-modal.tsx`:
- **line 77** — `grams` is computed and never read.
- **line 89** — `suffix` is a ~10-line IIFE, computed and never read.

Both are leftovers from the ticket-12 price rework (the big price stopped using `suffix` when it became the canonical rate, and the current-selection line took over). Delete both; the `eslint` `no-unused-vars` warnings go with them.

### 3. Ticket 16 describes a storefront that no longer exists — ✅ DONE (closed 2026-10-21)
`.scratch/storefront/issues/16-wire-payload.md` asked to "replace the mock fixtures with live data" and "demote the mock fixtures to tests/dev-only". The storefront had read **live Payload** since ticket 12 — there were no fixtures in the data path at all, so the ticket was stale. It was checked anyway, and that check paid off: it surfaced the homepage swallowing Next's `DYNAMIC_SERVER_USAGE` sentinel and logging it as a fake CMS failure on every build. Fixed, and its one parked question (the homepage had no declared cache strategy — three uncached CMS calls per request) became **ticket 26**, also now closed.

### 4. Remaining lint warnings (6, none blocking)
- `apps/web/eslint.config.mjs:7` — `__dirname` assigned, never used.
- `apps/web/hooks/use-toast.ts:18` and `apps/web/components/ui/use-toast.ts:18` — `actionTypes` only used as a type.
- `apps/web/app/layout.tsx:50` — `@next/next/no-page-custom-font` for the Material Symbols `<link>` in `<head>`.

The `use-toast` files are shadcn scaffolding; if nothing uses them, deleting them is cleaner than silencing the warning.

### 5. Coffee is filed under "Endulzantes" (user-approved move)
`CAF-001 Café Grano` and `CAF-002 Café Polvo` are live but effectively invisible: both sit in the 5-product **Endulzantes** category, and the taxonomy has no Café category at all, so nobody browsing the store can find the coffee.

Do: create a **Café** category, move both products into it, and add an entry to `lib/category-icons.ts` (the homepage grid and the tienda sidebar share that map, so the new category needs an icon or it renders blank in both). The 0-images gap for these two is ticket 22.

### 5b. The footer's legal links go nowhere (found 2026-10-24 while inventorying copy for ticket 19)
`apps/web/components/footer.tsx` has three links under "Legal" — **Términos y Condiciones**,
**Política de Privacidad** and **Devoluciones** — all pointing at `href="#"`. They look like real links
and do nothing; on a store that ships to customers that is worse than not showing them.

**Owner decision (2026-10-24):**
- **"Devoluciones" removed entirely** — done in code, not a page we want.
- **Términos y Condiciones and Política de Privacidad both stay**, and moved off this ticket to
  **ticket 27** (owner: *"let's note to add both on the other ticket for legal terms and related"*).
  Ticket 27 covers the wording, the reusable modal and the wiring; it blocks checkout (ticket 23).

### 5c. Footer should show both store addresses (owner request, 2026-10-24 — later)
The footer's "Ubicación" column currently says only *"Riobamba, Ecuador · Matriz · Sucursal"*. The
owner wants the actual addresses of both stores there. Trivial once ticket 19 lands, since the
addresses then live in the `contacto` global — read them from there rather than duplicating strings.

### 6. Verify the CMS webhook actually fires (owner request) — after the final merge
Ticket 26's revalidation webhook is **configured but inert**. Everything is in place except the code path:

| piece | state |
| --- | --- |
| Storefront route `/api/revalidate` | ✅ live on `develop`, **proven** on a real deployment (right secret → `{"revalidated":true}`, wrong → 401) |
| `REVALIDATE_SECRET` on Vercel | ✅ set (Production/Preview/Development), verified functionally |
| `REVALIDATE_SECRET` in Coolify | ✅ set by the owner |
| The Payload hooks | ❌ **not deployed** — they are on `develop`, but Coolify builds the CMS from `main` |

So the hook cannot fire yet. After the merge, confirm in this order:
1. The `payload` container actually has the var — `docker inspect <container> --format '{{range .Config.Env}}{{println .}}{{end}}' | grep -c '^REVALIDATE_SECRET='` → expect `1`.
2. Save a product in Payload and watch the CMS log for `[revalidate] storefront answered …` (a non-2xx here means the two secrets differ).
3. Load the storefront **twice** and confirm the edit shows. The first request after an invalidation legitimately serves the stale page while it regenerates (stale-while-revalidate) — a stale first look is not a broken webhook.
4. If it never fires, remember the hook is deliberately silent on failure (`STOREFRONT_URL` unreachable → logged and ignored) and the cache then only clears by hand:
   `curl -X POST https://wasigranel.com/api/revalidate -H "x-wasi-secret: $REVALIDATE_SECRET"`

### 7. Restore the real homepage to production (owner request) — after the final merge
Production's domains were **aliased down** to the Oct 9 pre-homepage build, because the homepage had been live since PR #2 and the owner expected the "Espéranos Pronto!" expectation page until launch:

```
www.wasigranel.com, wasigranel.com  →  wasi-granel-website-5twj59chs-…  (created 2026-10-09)
```

This is a **stopgap, not a state**: the next production deployment re-claims the domain on its own, which is exactly what the final merge does. So after the merge:
- [ ] Confirm `wasigranel.com` serves the **real** storefront (`Productos Populares` present; `Espéranos Pronto!` title gone).
- [ ] Confirm it is no longer pointing at the Oct 9 deployment — `vercel inspect https://www.wasigranel.com`, check `created` is recent.
- **If anything deploys to production before the merge**, the alias is lost and the homepage reappears — re-point it:
  ```
  npx vercel alias set https://wasi-granel-website-5twj59chs-sebastian-avalos-projects.vercel.app www.wasigranel.com
  npx vercel alias set https://wasi-granel-website-5twj59chs-sebastian-avalos-projects.vercel.app wasigranel.com
  ```
  (The alternative — reverting the homepage merge on `main` — is **not** safe: git can then treat that branch as already merged and the final `develop → main` merge would silently ship *without* the homepage.)

## Acceptance
- [ ] "Borrar filtros" clears every filter and the active-chips row disappears; covered by a gate test.
- [ ] The dead `grams` / `suffix` code is gone and `lint` reports 0 warnings from our own files.
- [x] Ticket 16 closed with evidence (2026-10-21 — it surfaced the swallowed `DYNAMIC_SERVER_USAGE` sentinel, and its parked caching question became ticket 26, now closed too).
- [ ] Coffee has a Café category, both products moved, icon added.
- [ ] `check:layout` stays green (32 passed, 2 skipped at time of writing — the count grows as guards are added).
- [ ] **After the final merge** — the CMS webhook is genuinely firing, not just configured (item 6).
- [ ] **After the final merge** — the real storefront is live on `wasigranel.com` and the expectation page is gone (item 7).
