# Wasi Granel

Website and e-commerce project for Wasi Granel (selling dried fruits, nuts, and food products).

## Agent skills

### Issue tracker

Local markdown files in `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical five-role vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (`CONTEXT.md` + `docs/adr/`). See `docs/agents/domain.md`.

## Acceptance criteria — browser verification (all UI work)

Every design/UI ticket (desktop AND mobile) is only "done" when verified in a real browser, not just by reading the code. Stitch screens are the pixel source of truth for both.

- Drive a real browser (Hermes `browser_exec` + CDP) against the running app.
- Check BOTH viewports: desktop (~1440px) and mobile (~390×844, per the Stitch "Inicio Móvil" screen).
- Verify each section's computed layout at that viewport matches the Stitch screen: element sizes/positions via `getBoundingClientRect`, `getComputedStyle` (padding, border-radius, grid columns, gap with the overlapping hero card), and that the correct responsive variant is the one actually rendered (e.g. mobile full-width navbar vs desktop floating pill; mobile 3-col benefits grid vs desktop bar; 2-col vs 4-col category grid).
- The flattened/styled screenshots of the page are part of the check; confirm hero card padding, navbar form, carousel slide widths, and section grids.
- The acceptance block on any UI ticket must record which viewport(s) were measured and that the browser pass passed.
- **Automated gate:** run `pnpm --filter @wasi-granel/web check:layout` (Playwright layout-regression suite in `apps/web/e2e/layout.spec.ts`) — it asserts the invariants above at desktop 1280 + mobile 390 (hero-card navbar clearance, no CTA button text-wrap, correct navbar form per viewport, grid column counts, benefits variant) and fails on any regression. A failing check must be fixed, not weakened.
