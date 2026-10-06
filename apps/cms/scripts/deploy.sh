#!/usr/bin/env bash
# Wasi Granel — deploy/update the Payload CMS (apps/cms) to the VPS and redeploy.
#
# Run from your machine (no agent needed):
#   ./apps/cms/scripts/deploy.sh
#
# What it does:
#   1. rsyncs the monorepo to the VPS (/opt/wasi-granel), excluding build
#      artifacts and secrets (.env* is NEVER synced, so it can't clobber
#      the VPS .env).
#   2. Rebuilds the Payload image and recreates the containers
#      (docker compose up -d --build).
#
# Prereqs (set up once):
#   - SSH key ~/.ssh/wasi-granel-vps + ~/.ssh/config Host "wasi-vps"
#   - apps/cms/.env exists on the VPS (Postgres password + Payload secret)
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
SSH_HOST="${WASI_VPS_HOST:-wasi-vps}"
REMOTE_DIR="/opt/wasi-granel"

echo "→ Sync ${REPO} → ${SSH_HOST}:${REMOTE_DIR}"
rsync -az -e ssh \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude '.scratch' \
  --exclude '.turbo' \
  --exclude '.env*' \
  --exclude 'apps/web/public' \
  "${REPO}/" "${SSH_HOST}:${REMOTE_DIR}/"

echo "→ Ensure secrets on VPS (generated once, reused on later runs)"
if ! ssh "${SSH_HOST}" "test -f '${REMOTE_DIR}/apps/cms/.env'"; then
  PG="$(openssl rand -base64 24 | tr -dc '[:alnum:]' | head -c 32)"
  PS="$(openssl rand -base64 32 | tr -dc '[:alnum:]' | head -c 40)"
  ssh "${SSH_HOST}" "printf 'POSTGRES_PASSWORD=%s\\nPAYLOAD_SECRET=%s\\n' '$PG' '$PS' > '${REMOTE_DIR}/apps/cms/.env'"
  echo "   (generated fresh secrets — store a copy somewhere safe)"
else
  echo "   (reusing existing ${REMOTE_DIR}/apps/cms/.env)"
fi

echo "→ Rebuild + redeploy on ${SSH_HOST}"
ssh "${SSH_HOST}" "cd '${REMOTE_DIR}' && docker compose -f apps/cms/docker-compose.yml up -d --build"

echo "→ Done. Open https://payload.wasigranel.com/admin (first-boot admin creation only if not created yet)."