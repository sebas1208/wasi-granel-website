# 21: Post-launch polish — carousel movement + hero images

**What to build:** Deferred polish (explicitly parked for later, not this session):

1. **Carousel movement (autoplay)** — the Productos Populares carousel only moves via the arrow buttons / swipe. Give it "movement": auto-advance on a timer, pause on hover/focus, and respect `prefers-reduced-motion`. Confirm exact behavior (interval, pause, loop) when picked up.
2. **Hero background alternatives** — generate + evaluate more hero images (the concept-A family: corner/aisle view, counter + shelf wall, wide shelf facade) and pick a better alternative to the current `hero-store-v1.jpg` if one reads stronger.
3. **Contacto hero photo** — the Contacto page's hero reuses `hero-store-v1.jpg` as a stand-in and wants its own photo of the Riobamba storefront. Noted here rather than as a `TODO` in the source: deferred work lives in tickets.

**Status:** backlog (parked — not started)
**Blocked by:** 11 (homepage) merged to develop/main.

- [ ] Productos Populares carousel autoplays (movement) — pause on hover/focus, `prefers-reduced-motion` respected, loop ok.
- [ ] Evaluate hero image alternatives vs `hero-store-v1.jpg` and swap in the winner (or confirm current stays).
- [ ] Contacto hero has its own storefront photo (currently reuses `hero-store-v1.jpg`).

## Comments
- Parked 2026-10-12 during ticket-11 review loop at the user's request; hero-alternative renders live in `/tmp/hero-{corner,counter,facade}.jpg` + `/tmp/wasi-photos/` if useful.
- nano-banana Google quota was exhausted during this window (fallback = flux.2-pro); check quota when resuming hero generation.
- 2026-10-21: added item 3 (the Contacto hero photo) at the owner's request — *"not a TODO in the code, we have a ticket for later tasks"*. The code comment it replaces was removed.