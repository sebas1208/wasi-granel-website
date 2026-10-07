# 18: Fix Vercel deployment (git push / GitHub user conflicts)

**What to build:** Restore the storefront (`apps/web`) deployment to Vercel. `git push` to the repo Vercel watches currently fails, and there are conflicts/ownership issues with the GitHub user. The storefront is now under the **monorepo** (`apps/web`), so the Vercel project must target that subdirectory.

**Status:** needs-info

- [ ] Confirm the intended GitHub repo + owner for Vercel (current remote: `sebas1208/jatunwasi-website`).
- [ ] Resolve push auth / ownership conflicts so `git push origin main` succeeds from this repo.
- [ ] Vercel project connected to the correct repo and building **`apps/web`** (set rootDirectory / base directory in Vercel settings).
- [ ] Landing page (root domain `wasigranel.com`) live on Vercel, auto-deploying on push.

## Comments

- Reporter: `git push` does not work and there are conflicts with my user (likely ownership of the GitHub repo / bot vs personal account). Need: the exact push error, the GitHub handle/repo you want to own it, and the Vercel account/team it should deploy under.