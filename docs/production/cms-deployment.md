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
- **Env vars (Coolify):** `POSTGRES_PASSWORD`, `PAYLOAD_SECRET`, plus the two below — the compose's
  `DATABASE_URL` interpolates `POSTGRES_PASSWORD`, and migrations run at boot.
  - `REVALIDATE_SECRET` — shared with the storefront (Vercel). Enables the cache-invalidation webhook
    (ticket 26): saving a product/category/media POSTs to the site so it refreshes without a redeploy.
    **While unset the hook is a silent no-op** and the storefront's cache then only clears on a
    redeploy, or by hand.
  - `STOREFRONT_URL` — where to send that POST. Defaults to `https://wasigranel.com`.
- **Cache invalidation (ticket 26):** the two env vars above must **match** between Coolify (CMS) and
  Vercel (web). To invalidate by hand after a missed webhook:
  ```
  curl -X POST https://wasigranel.com/api/revalidate -H "x-wasi-secret: $REVALIDATE_SECRET"
  ```
  Note it is stale-while-revalidate: the *first* request after invalidation may still serve the old
  page while it regenerates in the background; a refresh then shows the change.
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

## Migration hygiene — a bad migration is a prod outage

The container boots with `payload migrate && next start`, so **if a migration
throws, the CMS never starts**. `migrate:create` diffs against your *local* DB —
which here is usually `push`-created — so the generated SQL can re-add columns
production already has. That happened with `20261015_020120`, which re-added
`products.popular` even though `20261009_120000` had already applied it on prod;
shipped as-is it would have aborted the boot.

Before pushing any migration:

1. See what prod has: `docker exec <pg-container> psql -U payload -d payload -c 'select name, batch from payload_migrations order by id;'`
2. Make the SQL **idempotent and additive**: `ADD COLUMN IF NOT EXISTS`,
   `CREATE INDEX IF NOT EXISTS`, enum creation wrapped in
   `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
   and `ALTER TYPE ... ADD VALUE IF NOT EXISTS`. Delete statements a
   previously-applied migration already covers.
3. Smoke-test it **twice** against a prod-shaped scratch DB — the second run must
   emit only `already exists, skipping` notices. Never test against a
   `push`-created local DB: `payload migrate` would try to replay every migration.

Deploy is automatic: `git push origin main` → Coolify rebuilds (~4 min) → the new
image tag (`payload:<sha>`) appears in `docker ps`. Verify after:
`select name, batch from payload_migrations;` should list the new migration.

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

## Seeding the catalog (production)

The 278-product catalog is already loaded, but these steps are reproducible for a
fresh instance or after a data reset. The canonical data + product photos are
**not** in the Docker image (`.scratch` and the `images/` dir are git-ignored), so
ship them into the running app container, then run the loader from inside it:

```bash
# 1. canonical JSONs (products.json, categories.json) -> /opt/wasi-canonical on the VPS
# 2. product photos -> /opt/wasi-images on the VPS
CONT=$(docker ps --format '{{.Names}}' | grep -i '^payload-' | head -1)
docker exec "$CONT" sh -c 'mkdir -p /repo/.scratch/storefront/canonical /repo/.scratch/storefront/catalog-docx/images'
docker cp /opt/wasi-canonical/products.json   "$CONT":/repo/.scratch/storefront/canonical/
docker cp /opt/wasi-canonical/categories.json "$CONT":/repo/.scratch/storefront/canonical/
docker cp /opt/wasi-images/.                  "$CONT":/repo/.scratch/storefront/catalog-docx/images/
docker exec "$CONT" sh -c 'cd /repo/apps/cms && npx tsx src/seed/seed-catalog.ts'
```

The loader is idempotent — re-running upserts descriptions and fills any gaps.

### Backfilling the canonical price (ticket 12)

`products.price` + `products.price_unit` (`lb | kg | gr | unidad`) is the canonical
rate that purchase options derive from; the storefront sorts on it. After the
schema migration lands, derive it from the existing tier prices:

```bash
docker exec "$CONT" sh -c 'cd /repo/apps/cms && npx tsx src/seed/backfill-price.ts'
# -> backfill done: 278 updated, 0 skipped (no priced options)
```

Idempotent. Any product whose options are all unpriced stays at `0` (as of the
last run: Semilla de Apio, Semillas de Amapola 25 Gr, Manzana Deshidratada,
Cloruro de Calcio, Agar Agar, Alginato — waiting on real prices from the store).