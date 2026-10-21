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

### 3. Ticket 16 describes a storefront that no longer exists
`.scratch/storefront/issues/16-wire-payload.md` still asks to "replace the mock fixtures with live data" and "demote the mock fixtures to tests/dev-only". The storefront has read **live Payload** since ticket 12 — there are no fixtures in the data path. Re-scope it to what is genuinely left (ISR / revalidation so a CMS edit propagates without a redeploy) or close it as done. Its "Blocked by: 09, 11, 12, 13" is also stale.

### 4. Remaining lint warnings (6, none blocking)
- `apps/web/eslint.config.mjs:7` — `__dirname` assigned, never used.
- `apps/web/hooks/use-toast.ts:18` and `apps/web/components/ui/use-toast.ts:18` — `actionTypes` only used as a type.
- `apps/web/app/layout.tsx:50` — `@next/next/no-page-custom-font` for the Material Symbols `<link>` in `<head>`.

The `use-toast` files are shadcn scaffolding; if nothing uses them, deleting them is cleaner than silencing the warning.

### 5. Coffee is filed under "Endulzantes" (user-approved move)
`CAF-001 Café Grano` and `CAF-002 Café Polvo` are live but effectively invisible: both sit in the 5-product **Endulzantes** category, and the taxonomy has no Café category at all, so nobody browsing the store can find the coffee.

Do: create a **Café** category, move both products into it, and add an entry to `lib/category-icons.ts` (the homepage grid and the tienda sidebar share that map, so the new category needs an icon or it renders blank in both). The 0-images gap for these two is ticket 22.

## Acceptance
- [ ] "Borrar filtros" clears every filter and the active-chips row disappears; covered by a gate test.
- [ ] The dead `grams` / `suffix` code is gone and `lint` reports 0 warnings from our own files.
- [ ] Ticket 16 is either re-scoped to real remaining work or closed with evidence.
- [ ] Coffee has a Café category, both products moved, icon added.
- [ ] `check:layout` stays green (27 passed, 1 skipped at time of writing).
