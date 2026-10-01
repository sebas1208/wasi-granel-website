#!/usr/bin/env bash
set -euo pipefail

# Local dev entrypoint: bring up the podman VM + Postgres (idempotent), then run Payload.
# Usage: pnpm --filter @wasi-granel/cms dev:local

echo "▶ Ensuring podman machine is running (no-op if already up)..."
podman machine start || true

echo "▶ Starting Postgres (no-op if already up)..."
podman compose up -d postgres

echo "▶ Waiting for Postgres to accept connections..."
waited=0
until podman exec wasi-payload-db pg_isready -U payload -d payload >/dev/null 2>&1; do
  if [ "$waited" -ge 60 ]; then
    echo "✗ Postgres didn't become ready in 60s. Check: podman logs wasi-payload-db" >&2
    exit 1
  fi
  sleep 1
  waited=$((waited + 1))
done
echo "✓ Postgres ready."

echo "▶ Starting Payload dev server → http://localhost:3000/admin"
exec pnpm dev