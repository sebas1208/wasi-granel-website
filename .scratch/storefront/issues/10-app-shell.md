# 10: App shell — brand navigation, layout, footer, theme

**What to build:** Replace the placeholder shell with the real Wasi Granel one: fix `components/navigation.tsx` (it currently brands "JatunWasi" and uses the wrong font), use the correct logo from ticket 02 and tokens from ticket 01, and add a proper footer (Navegación / Legal / Ubicación as in the Stitch footer). Links: Inicio, Tienda, Contacto.

**Blocked by:** 00 (monorepo — lives in `apps/web`), 01 (tokens), 02 (brand assets).

**Status:** ready-for-agent

- [ ] Navigation shows the Wasi Granel brand (correct logo + wordmark) and Inicio/Tienda/Contacto links, active-state highlighted.
- [ ] No "JatunWasi" or foreign brand string remains anywhere in the repo.
- [ ] Footer renders the Navegación/Legal/Ubicación columns and correct copyright.
- [ ] Responsive: mobile menu works; `next build`/`next lint` pass.
