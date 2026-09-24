# 1. Headless Payload CMS on VPS with Next.js on Vercel

## Context

Wasi Granel requires an administrative panel for catalog and order management. Running a full CMS like Payload inside Vercel serverless functions risks exceeding free-tier limits (function execution time, cold starts, and the lack of persistent local storage for product image uploads).

## Decision

We will run **Payload CMS headlessly on a private VPS** (backed by PostgreSQL with media stored directly on the VPS disk) and deploy the **Next.js customer storefront on Vercel**. The Next.js frontend will consume product data from the VPS API using Incremental Static Regeneration (ISR).

## Consequences

- **Cost & Limits**: Zero external S3/blob storage costs and minimal Vercel compute consumption.
- **Operations**: The VPS requires Docker/Node and SSL setup (e.g. Caddy/Nginx) for `api.wasigranel.com`, while the storefront benefits from Vercel's global CDN edge.
