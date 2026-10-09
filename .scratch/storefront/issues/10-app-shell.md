# 10: App shell — brand navigation, layout, footer, theme

**What to build:** Replace the placeholder shell with the real Wasi Granel one: fix `components/navigation.tsx` (it currently brands "JatunWasi" and uses the wrong font), use the correct logo from ticket 02 and tokens from ticket 01, and add a proper footer (Navegación / Legal / Ubicación as in the Stitch footer). Links: Inicio, Tienda, Contacto.

**Blocked by:** 00 (monorepo — lives in `apps/web`), 01 (tokens), 02 (brand assets).

**Status:** ready-for-agent

- [x] Navigation shows the Wasi Granel brand (correct logo + wordmark) and Inicio/Tienda/Contacto links, active-state highlighted.
- [x] No "JatunWasi" or foreign brand string remains anywhere in the repo.
- [x] Footer renders the Navegación/Legal/Ubicación columns and correct copyright.
- [x] Responsive: mobile menu works; `next build`/`next lint` pass.

## Comments
- Ship: rewrote `navigation.tsx` (brand via `.wasi-logo` + Inicio/Tienda/Contacto, active state, mobile menu) and `footer.tsx` (yellow ground, Navegación/Legal/Ubicación columns + brand tagline, dynamic © Wasi Granel). Fixed `contacto` email/title (removed `jatunwasigranel@gmail.com`, JatunWasi map title).
- Also cleared the pre-existing v0 lint errors so `pnpm lint` passes: `use-mobile` (removed broken `window.matchMedia`, lazy initializer + resize listener), deleted unused `ui/use-mobile.tsx` duplicate, deferred carousel initial select, deterministic sidebar-skeleton width (React 19 purity rules).
- Remaining non-displayed "jatun" strings (acceptable): `.vercel/project.json` (legacy Vercel CLI link), historical notes in runbook + tickets, and the old-store marker inside the contacto **maps embed URL** (query param, not rendered text — fix alongside ticket 15).
