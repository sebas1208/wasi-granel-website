# 18: Fix Vercel deployment (monorepo build + private-repo author access)

**What to build:** Restore the storefront (`apps/web`) deployment to Vercel. Two independent problems block it:

1. **Monorepo build** — Vercel must build `apps/web`, not the repo root. **Root Directory is a dashboard-only setting** — it is *not* a valid `vercel.json` property (confirmed against the official project-configuration schema). Fix: set Project → Settings → General → **Root Directory = `apps/web`**; `vercel.json` keeps only `framework: nextjs` (valid).
2. **Deploy blocked by author access** — Vercel error: *"deployment was blocked because the commit author did not have contributing access to the project on Vercel. The Hobby Plan does not support collaboration for private repositories."* Commits are authored as `Sebastian Avalos <sebas1208.avalos@gmail.com>` (GitHub `sebas1208`, repo owner). On Hobby + private repo, the commit author must be the single Vercel-project owner.

**Status:** **Done — closed 2026-10-24** — every acceptance item verified against the live project (see below). The "needs-info" blocker evaporated: the project deploys cleanly and the CLI is now authenticated as `sebas1208`, so this was checked directly rather than answered by the owner.

- [x] Root Directory set to `apps/web` (dashboard — NOT a vercel.json property) + storefront builds (`pnpm --filter @wasi-granel/web build` → green).
- [x] Confirm the Vercel project's connected GitHub account (`sebas1208` — was the rename-to-`wasi-granel-website` stale link; re-linked). 
- [x] Resolve the author-access/plan issue (re-linked the correct repo; deploy now works).
- [x] **Storefront domain + DNS — wired, verified 2026-10-24.** `wasigranel.com` + `www.wasigranel.com` attached to the Vercel project and `verified=true` (served through Cloudflare; both answer 200). `payload.wasigranel.com` resolves to `82.197.67.162` — the VPS — so the split is exactly as this ticket specified: root/www → Vercel, `payload.*` → VPS.
- [~] **(optional) Deploy hook / separate Vercel+Coolify branch — deliberately skipped.** A `main` push does rebuild both, but `main` only moves at release time, so the waste is two builds per release rather than a recurring cost. Not worth a second branch's complexity; revisit if `main` starts moving often.

## Closure evidence (2026-10-24)
Read straight from the Vercel API rather than inferred:

| check | value |
| --- | --- |
| `rootDirectory` | **`apps/web`** — item 1, exactly as required (and confirmed as a dashboard-only setting, not a `vercel.json` property) |
| `framework` / `nodeVersion` | `nextjs` / `22.x` |
| `link` (git) | `github` → **`sebas1208/wasi-granel-website`**, productionBranch `main` — item 2/3, the re-link held and the author-access block is gone (deployments build from real commits; verified `meta.githubCommitSha` on production deployments) |
| domains | `wasigranel.com`, `www.wasigranel.com`, `wasi-granel-website.vercel.app` all `verified=true` |
| DNS | root/www → Vercel, `payload.wasigranel.com` → `82.197.67.162` (VPS) |

Also proved in passing: `vercel redeploy` rebuilds a preview cleanly, and a production deploy from `main` builds the storefront without error.

## Comments

- Reporter: `git push` fails + "conflicts with my user". Confirmed author = `sebas1208.avalos@gmail.com` → GitHub `sebas1208` (repo owner `sebas1208/wasi-granel-website`, was renamed from `jatunwasi-website`).
- The Hobby+private-repo collaboration limitation is a **Vercel account/plan** matter, not a code issue. Options: (a) author commits under the GitHub account connected to the Vercel project (so it's the single owner on Hobby), or (b) upgrade to Pro to add the author as a team member. Need to know which GitHub account the Vercel project is connected to.