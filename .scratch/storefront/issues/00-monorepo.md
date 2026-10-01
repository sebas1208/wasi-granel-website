# 00: Restructure the repo into a Turborepo monorepo

**What to build:** Convert `wasi-granel` from a single Next.js app at the repo root into a pnpm-workspace Turborepo so the storefront and Payload share one codebase and one schema package: `apps/web` (the existing storefront, moved), `apps/cms` (new Payload app), and `packages/schema` (shared TypeScript + Zod types, the single source of truth for the catalog data contract). Root gets `pnpm-workspace.yaml`, `turbo.json`, and a workspace root `package.json`.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Existing Next.js app is moved to `apps/web` (its own `package.json`/`tsconfig.json`/`next.config.mjs`/aliases intact) and `next build` + `next lint` still pass from the workspace.
- [ ] pnpm workspace + Turborepo are configured (`turbo.json`, root `package.json` scripts, `pnpm-workspace.yaml`) so `pnpm build`/`pnpm lint`/`pnpm dev` run across apps.
- [ ] `apps/cms` is scaffolded (Payload + `@payloadcms/db-postgres`, the `Dockerfile` + `docker-compose.yml` from `payload/` are re-homed or referenced there).
- [ ] `packages/schema` is scaffolded as a buildable shared package.
- [ ] Files are moved with `git mv` to preserve history; `.gitignore` covers `apps/cms` build artifacts and local `.env`.
- [ ] Tickets 01 and 02 (tokens/assets) and 04–07 (data + provisioning) are unaffected and can run in parallel with this restructure.