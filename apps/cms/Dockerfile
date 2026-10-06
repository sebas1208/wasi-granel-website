# Build context = wasi-granel workspace root (so pnpm-lock.yaml + pnpm-workspace.yaml are present).
# Used by apps/cms/docker-compose.yml (build: context ../.., dockerfile apps/cms/Dockerfile).
FROM node:22-alpine AS base
WORKDIR /repo
ENV PNPM_HOME="/pnpm" PATH="/pnpm:$PATH"
RUN corepack prepare pnpm@11.27.1 --activate && corepack enable pnpm && apk add --no-cache libc6-compat

FROM base AS deps
# Workspace manifests + lockfile only (leverages layer cache).
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/cms/package.json apps/cms/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/schema/package.json packages/schema/package.json
RUN pnpm install --frozen-lockfile

FROM base AS builder
# Placeholders so a paranoid prerender can't fail on a live DB; runtime env overrides these.
ARG DATABASE_URL=postgres://payload:build@postgres:5432/payload
ARG PAYLOAD_SECRET=build-time-placeholder
ENV DATABASE_URL=$DATABASE_URL PAYLOAD_SECRET=$PAYLOAD_SECRET NEXT_TELEMETRY_DISABLED=1 NODE_ENV=production
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
RUN pnpm --filter @wasi-granel/cms build

FROM base AS runner
WORKDIR /repo/apps/cms
ENV NODE_ENV=production PORT=3000 NEXT_TELEMETRY_DISABLED=1 PATH="/repo/apps/cms/node_modules/.bin:/repo/node_modules/.bin:$PATH"
# Full node_modules (so the `payload` CLI + sharp are available), the built app,
# and the workspace manifests the app resolves against.
COPY --from=builder /repo/node_modules /repo/node_modules
COPY --from=builder /repo/apps/cms /repo/apps/cms
COPY --from=builder /repo/package.json /repo/pnpm-workspace.yaml /repo/pnpm-lock.yaml /repo/
EXPOSE 3000
# Apply pending DB migrations, then serve the production build.
CMD ["sh", "-c", "npx payload migrate && next start -p 3000"]