# 18: Fix Vercel deployment (monorepo build + private-repo author access)

**What to build:** Restore the storefront (`apps/web`) deployment to Vercel. Two independent problems block it:

1. **Monorepo build** — Vercel must build `apps/web`, not the repo root. **Fixed**: added root `vercel.json` (`framework: nextjs`, `rootDirectory: apps/web`); also confirm "Root Directory = `apps/web`" in the Vercel dashboard.
2. **Deploy blocked by author access** — Vercel error: *"deployment was blocked because the commit author did not have contributing access to the project on Vercel. The Hobby Plan does not support collaboration for private repositories."* Commits are authored as `Sebastian Avalos <sebas1208.avalos@gmail.com>` (GitHub `sebas1208`, repo owner). On Hobby + private repo, the commit author must be the single Vercel-project owner.

**Status:** needs-info (needs the Vercel-account answer below)

- [x] Add `vercel.json` (rootDirectory `apps/web`) + confirm storefront builds (`pnpm --filter @wasi-granel/web build` → green).
- [ ] Confirm the Vercel project's connected GitHub account.
- [ ] Resolve the author-access/plan issue (see options).
- [ ] Storefront live on Vercel at the root domain (`wasigranel.com`) + wire DNS.

## Comments

- Reporter: `git push` fails + "conflicts with my user". Confirmed author = `sebas1208.avalos@gmail.com` → GitHub `sebas1208` (repo owner `sebas1208/wasi-granel-website`, was renamed from `jatunwasi-website`).
- The Hobby+private-repo collaboration limitation is a **Vercel account/plan** matter, not a code issue. Options: (a) author commits under the GitHub account connected to the Vercel project (so it's the single owner on Hobby), or (b) upgrade to Pro to add the author as a team member. Need to know which GitHub account the Vercel project is connected to.