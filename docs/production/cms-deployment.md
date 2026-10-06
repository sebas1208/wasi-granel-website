# Payload CMS — deployment & update runbook

Target: **Payload CMS 3.90.2** hosted on the Wasi Granel VPS (`82.197.67.162`),
served at **`https://payload.wasigranel.com`**, with Postgres on the same VPS.
The storefront (root domain, landing page) runs on Vercel — no overlap.

## Architecture

- Monorepo; `apps/cms` is the Payload app. Its `Dockerfile` builds from the
  **workspace root** (needs `pnpm-lock.yaml` + `pnpm-workspace.yaml`, which live
  there, not in `apps/cms`).
- `apps/cms/docker-compose.yml` runs two containers:
  - `wasi-payload-db` — `postgres:16-alpine`, data in the `pgdata` volume.
  - `wasi-payload-app` — the Payload/Next server, uploads in the `media` volume.
- **Deployment is Coolify-managed** (Docker Compose resource built from the git
  repo via a GitHub App source). The container runs `npx payload migrate && next
  start` at boot, so DB migrations apply automatically on every build.

## How it's set up in Coolify

- **Source:** GitHub App (`wasi-granel-payload`) authorizing repo `wasi-granel-website`
  (the git remote that was `sebas1208/jatunwasi-website`).
- **Application resource:** Build Pack = **Docker Compose**, Base Directory = `apps/cms`,
  Docker Compose Location = `docker-compose.yml`, branch `main`.
- **Env vars (Coolify):** `POSTGRES_PASSWORD`, `PAYLOAD_SECRET` only — the compose's
  `DATABASE_URL` interpolates `POSTGRES_PASSWORD`, and migrations run at boot.
- **Domain:** `payload.wasigranel.com` via Coolify/Traefik (+ Let's Encrypt wildcard).

## Update & redeploy (no agent needed)

Updates are **just `git push`**:

```bash
git push origin main        # Coolify auto-redeploys if auto-deploy is on, else click Deploy
```

The rebuilt container runs **`payload migrate && next start`**, so pending
migrations apply automatically. The `pgdata`/`media` volumes persist across
redeploys.

**Schema changes (e.g. ticket 08):** after editing collections, generate a new
migration locally and commit it:

```bash
cd apps/cms && npx payload migrate:create -n <name>   # needs a reachable DATABASE_URL
git add apps/cms/src/migrations && git commit          # then push
```

First ever boot: open `https://payload.wasigranel.com/admin` and create the first
admin user. Later boots reuse the created user.

## Legacy: raw-SSH deploy (`deploy.sh`)

`apps/cms/scripts/deploy.sh` (rsync → ensure secrets → `docker compose up --build`
over SSH) still works, but it runs a **separate** docker-compose stack. **Do not run
it while Coolify owns the app** — it would create a conflicting second stack and
fight over port 3000 / the domain. It's only relevant if you ever take the CMS out
of Coolify and go fully self-managed again.

## Backups

From your machine (verify the container names with `docker ps | grep wasi` —
Coolify may rename them):

```bash
ssh wasi-vps 'docker exec wasi-payload-db pg_dump -U payload payload | gzip > /root/cms-db-$(date +%F).sql.gz'
ssh wasi-vps 'docker run --rm -v media:/mnt -w /mnt alpine tar czf /root/cms-media-$(date +%F).tar.gz .'
```

Pull both to your machine / offsite regularly.

## From-scratch rebuild (e.g. server wipe)

1. Recreate the GitHub App source + Application resource in Coolify (Base
   Directory `apps/cms`, Build Pack Docker Compose, domain `payload.wasigranel.com`).
2. Set the two env vars and click Deploy — migrations auto-apply on a fresh DB.
3. Restore from the latest backups if you have them.