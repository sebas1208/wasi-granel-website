# Deploying the Payload CMS

This document captures how the CMS is deployed to the VPS and exposed at a domain, so it can be reproduced **without asking an agent**.

## 1. The container (Docker Compose)

The compose + Dockerfile live in `apps/cms/` and are **the reproducible unit**:

- `apps/cms/docker-compose.yml` — `postgres:16` + `payload` (built from `../..` = repo root), with a persistent `media` volume.
- `apps/cms/Dockerfile` — monorepo-aware: build context is the workspace root (pnpm-lock.yaml lives there), installs the workspace deps, builds only `@wasi-granel/cms`, and runs Next's standalone output.

**One-command deploy** (from the repo root):

```bash
bash scripts/deploy-cms.sh
```

That script: rsyncs the source to the VPS (`/opt/wasi-granel`), generates `POSTGRES_PASSWORD`/`PAYLOAD_SECRET` once (into `apps/cms/.env` on the VPS), then `docker compose up -d --build`. Re-run it after any code change — it pushes, rebuilds, and redeploys. Set `VPS=alias` / `VPS_DIR=/path` to override the defaults.

To take the whole stack down / up:

```bash
ssh wasi-vps 'cd /opt/wasi-granel && docker compose -f apps/cms/docker-compose.yml down'   # down
ssh wasi-vps 'cd /opt/wasi-granel && docker compose -f apps/cms/docker-compose.yml up -d'  # up (no rebuild)
```

## 2. The domain — `payload.wasigranel.com`

The VPS already runs Coolify's Traefik on port 80/443 and serves `*.wasigranel.com` (wildcard TLS), so **the CMS should be exposed through Coolify**, not on a raw port.

To wire it (do this once in the Coolify UI, or via its API):

1. In Coolify → **+ Add Resource → Docker Compose** (or Application if using a repo), set the **base directory** to `apps/cms`, and paste/point at `apps/cms/docker-compose.yml`.
2. Set the **domain** to `payload.wasigranel.com` (Coolify's Traefik routes it + issues the wildcard cert).
3. Set the two env vars in Coolify: `POSTGRES_PASSWORD` and `PAYLOAD_SECRET` (use the ones from the VPS `apps/cms/.env`, or let Coolify manage them).
4. Deploy. `https://payload.wasigranel.com/admin` is the CMS.

> Root domain (`wasigranel.com`) is **reserved for Vercel / the storefront**, so don't point the CMS at the root.

## What's where (ports)

- Coolify / Traefik: 80 / 443 (owns the wildcard DNS + TLS).
- Payload (this compose): container port 3000, bound to host 3000 for direct checks only.
- Storefront (Vercel): `wasigranel.com` root.

## Notes

- The CMS media (uploaded images) persist in the `media` volume — it survives `down`/`up`.
- Backups: `pg_dump` the Postgres volume and tar the `media` volume (see the Payload deploy runbook).