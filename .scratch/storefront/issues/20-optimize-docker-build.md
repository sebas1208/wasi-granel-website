# 20: Optimize the Payload Docker build (Coolify redeploys are slow) — LOW PRIORITY

**What to build:** Reduce the Payload CMS (appx/cms) Coolify redeploy time. Each deploy currently rebuilds slowly (several minutes), suspected to be (a) the runner image copying the **entire workspace `node_modules`** (~1 GB, web + cms + schema deps) whose layer *export* alone takes 100–170 s, and (b) no persistent build cache across Coolify builds (so `next build` re-runs fully and possibly `pnpm install` re-fetches if the deps layer isn't reused).

**Blocked by:** none (can start anytime; NOT blocking the current catalog seed).

**Status:** ready-for-agent
**Priority:** low (deferred — landed the VPS push/seed first; revisit when redeploys actually annoy)

- [ ] Slim the runner stage so only `cms`'s **production** deps are shipped (not the whole pnpm workspace node_modules).
- [ ] Add a **BuildKit cache mount** for `.next` (and the pnpm store) so `next build` is incremental across rebuilds.
- [ ] Confirm the `deps` (pnpm install) layer is **reused** across Coolify builds (only re-runs when manifests change); fix if Coolify isn't reusing it.
- [ ] Measure and record deploy time before/after (target: cut from ~8–10 min to ~2–3 min).

## Comments

- Reporter noted Coolify "is automatically [deploying], just takes time to rebuild… docker cache issue?" — captured here so we can optimize without derailing the current live seed.
- Do **not** change the Dockerfile mid-flight of the current deploy; pick this up after the catalog is seeded on the VPS.