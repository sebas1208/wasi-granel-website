#!/usr/bin/env bash
# Reproducible deploy of the Payload CMS to the VPS (Docker Compose over SSH).
#
# Run from the repo root:
#     bash scripts/deploy-cms.sh
#
# Requires: an SSH alias `wasi-vps` in ~/.ssh/config (or export VPS=...).
# Idempotent: re-run anytime to pull the latest code and rebuild/redeploy.
# Secrets (POSTGRES_PASSWORD, PAYLOAD_SECRET) are created once and reused.
set -euo pipefail

VPS="${VPS:-wasi-vps}"
VPS_DIR="${VPS_DIR:-/opt/wasi-granel}"
COMPOSE_FILE="apps/cms/docker-compose.yml"

echo "▶ 1/3 Syncing source -> ${VPS}:${VPS_DIR}"
ssh "$VPS" "mkdir -p ${VPS_DIR}"
rsync -az -e ssh \
  --exclude node_modules --exclude '.next' --exclude .git --exclude .scratch \
  --exclude '.turbo' --exclude '.env*' --exclude 'apps/web/public' \
  ./ "$VPS:${VPS_DIR}/"

echo "▶ 2/3 Ensuring secrets (only generated the first time)"
if ! ssh "$VPS" "test -f ${VPS_DIR}/apps/cms/.env"; then
  PG="$(openssl rand -base64 24 | tr -dc '[:alnum:]' | head -c 32)"
  PS="$(openssl rand -base64 32 | tr -dc '[:alnum:]' | head -c 40)"
  ssh "$VPS" "printf 'POSTGRES_PASSWORD=%s\nPAYLOAD_SECRET=%s\n' '$PG' '$PS' > ${VPS_DIR}/apps/cms/.env"
  echo "   (generated fresh secrets)"
else
  echo "   (reusing existing secrets)"
fi

echo "▶ 3/3 Building + starting (a few minutes on first run)"
ssh "$VPS" "cd ${VPS_DIR} && docker compose -f ${COMPOSE_FILE} up -d --build"

echo
echo "✓ Done. The CMS container is up — verify:"
echo "    ssh wasi-vps 'docker compose -f apps/cms/docker-compose.yml ps'"
echo "    curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/admin"
echo "  Admin UI will be served at payload.wasigranel.com once wired through Coolify — see docs/deploy.md."