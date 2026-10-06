# Payload CMS — deployment & update runbook

Target: **Payload CMS 3.90.2** hosted on the Wasi Granel VPS (`82.197.67.162`),
served at **`https://payload.wasigranel.com`**, with Postgres on the same VPS.
The storefront (root domain, landing page) runs on Vercel — no overlap.

## Architecture

- Monorepo; `apps/cms` is the Payload app. Its `Dockerfile` builds from the
  **workspace root** (it needs `pnpm-lock.yaml` + `pnpm-workspace.yaml`, which
  live there, not in `apps/cms`).
- `apps/cms/docker-compose.yml` runs two containers:
  - `wasi-payload-db` — `postgres:16-alpine`, data in the `pgdata` volume.
  - `wasi-payload-app` — the Payload/Next server, port `3000:3000`, uploads in
    the `media` volume.
- The source lives on the VPS at `/opt/wasi-granel`, synced from your machine
  with rsync. Secrets are in `/opt/wasi-granel/apps/cms/.env` — **never
  committed to git and never rsync'd** (so updates can't wipe them).

## One-time setup (done; recorded for a fresh server)

1. Sync source: `rsync -az -e ssh ... <repo>/ wasi-vps:/opt/wasi-granel/`
   (or just run the deploy script against an empty `/opt/wasi-granel`).
2. Create `/opt/wasi-granel/apps/cms/.env` with two secrets:
   - `POSTGRES_PASSWORD` — `openssl rand -base64 24 | tr -dc 'A-Za-z0-9' | head -c 32`
   - `PAYLOAD_SECRET`   — `openssl rand -base64 32 | tr -dc 'A-Za-z0-9' | head -c 40`
   Store a copy somewhere safe; regenerating them later resets the DB password / admin sessions.
3. `cd /opt/wasi-granel && docker compose -f apps/cms/docker-compose.yml up -d --build`

## Update & redeploy (every time, no agent needed)

From your machine:

```
/apps/cms/scripts/deploy.sh    # (repo-root relative: ./apps/cms/scripts/deploy.sh)
```

That syncs new code and runs `docker compose up -d --build`, recreating the
`payload` container. The `pgdata`/`media` volumes persist.

**Schema & migrations:** the container runs `payload migrate` at every start, so
pending migrations apply automatically on deploy. When you add/change collections
(e.g. ticket 08), generate a new migration (`npx payload migrate:create -n <name>`
against a reachable `DATABASE_URL`) and commit it — deploy.sh will apply it.

First ever boot: open `https://payload.wasigranel.com/admin` and create the
first admin user. Later boots reuse the created user.

## Domain & SSL

- DNS: `payload.wasigranel.com` is covered by the existing **`*.wasigranel.com`**
  wildcard already on the VPS (same cert path as your other services). No new DNS record needed.
- TLS: managed the same way your other `*.wasigranel.com` services are
  (Coolify/Traefik + Let's Encrypt). Payload binds host port **3000** only —
  it does not touch 80/443.
- Vercel owns the **root** `wasigranel.com` (landing page). No conflict.

## Backups

From your machine:

```
# Postgres → dump on the VPS
ssh wasi-vps 'docker exec wasi-payload-db pg_dump -U payload payload | gzip > /root/cms-db-$(date +%F).sql.gz'

# Media (uploads) volume → tarball on the VPS
ssh wasi-vps 'docker run --rm -v media:/mnt -w /mnt alpine tar czf /root/cms-media-$(date +%F).tar.gz .'
```

Then pull both to your machine / offsite regularly.

## From-scratch rebuild (e.g. server wipe)

1. `ssh wasi-vps 'mkdir -p /opt/wasi-granel'`
2. Recreate `apps/cms/.env` with fresh secrets (above).
3. `./apps/cms/scripts/deploy.sh`
4. Re-apply the domain + SSL via Coolify (see "Domain & SSL").
5. Restore from the latest backups if you have them.