# 21: Homepage post-launch polish — carousel movement + hero image alternatives

**What to build:** Two deferred homepage improvements (explicitly parked for later, not this session):

1. **Carousel movement (autoplay)** — the Productos Populares carousel only moves via the arrow buttons / swipe. Give it "movement": auto-advance on a timer, pause on hover/focus, and respect `prefers-reduced-motion`. Confirm exact behavior (interval, pause, loop) when picked up.
2. **Hero background alternatives** — generate + evaluate more hero images (the concept-A family: corner/aisle view, counter + shelf wall, wide shelf facade) and pick a better alternative to the current `hero-store-v1.jpg` if one reads stronger.

**Status:** backlog (parked — not started)
**Blocked by:** 11 (homepage) merged to develop/main.

- [ ] Productos Populares carousel autoplays (movement) — pause on hover/focus, `prefers-reduced-motion` respected, loop ok.
- [ ] Evaluate hero image alternatives vs `hero-store-v1.jpg` and swap in the winner (or confirm current stays).

## Comments
- Parked 2026-10-12 during ticket-11 review loop at the user's request; hero-alternative renders live in `/tmp/hero-{corner,counter,facade}.jpg` + `/tmp/wasi-photos/` if useful.
- nano-banana Google quota was exhausted during this window (fallback = flux.2-pro); check quota when resuming hero generation.