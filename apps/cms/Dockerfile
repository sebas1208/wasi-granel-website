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
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /repo/apps/cms/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/cms/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /repo/apps/cms/public ./public
USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["node", "server.js"]