# 01: Normalize design tokens to the cream + brand palette

**What to build:** Bring `app/globals.css` (and any Tailwind theme wiring) in line with the agreed palette so every later ticket builds on correct, single-source tokens: cream background `#fff8f4`, primary Amarillo Wasi `#FCBF00` (with brown `#544738` as the readable on-primary text), foreground/café `#544738`, warm gray `#A08D7F`, sand `#C1B1A3`, and fonts Fredoka + Zalando Sans (already wired in `layout.tsx`).

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] `globals.css` exposes the five brand colors under clear token names mirroring the brand manual (primary / foreground / neutral-medium / neutral-light / background).
- [ ] Background resolves to cream `#fff8f4` and foreground to café `#544738`; text on `#FCBF00` is brown, not white.
- [ ] No hardcoded brand hex values remain in page/component code (they reference the tokens).
- [ ] `next build` and `next lint` pass with no regressions on the existing pages.
