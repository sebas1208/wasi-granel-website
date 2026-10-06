# 02: Promote brand assets (logos) into the site

**What to build:** Place the correct Wasi Granel logo files — fetched from Stitch into `.scratch/stitch-fetch/` — into `public/` and reconcile them with the existing `public/logo.svg`. The navbar uses the horizontal imagotipo (isotipo + "WASI GRANEL"), the favicon/small contexts use the isotipo alone. Confirm the existing `public/logo.svg` is actually the Wasi Granel mark and not a stale placeholder, and replace if needed.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] `public/logo.svg` verified as the current official Wasi Granel mark (kept as the single source).
- [x] A runtime-recolorable `.wasi-logo` utility (CSS mask + `currentColor`) replaces the planned static `logo-white.svg` / `isotipo.svg` copies — colour is set via Tailwind `text-*` at runtime (yellow / white / any future colour from one source).
- [x] `docs/logo-usage.md` documents which rendering to use where, per the manual's contrast rules.
