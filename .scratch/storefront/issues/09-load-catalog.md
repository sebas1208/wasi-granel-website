# 09: Load the canonical catalog into Payload

**What to build:** Import the canonical catalog (ticket 06) — products, categories, and weight tiers, with images — into Payload so it is the live source of truth. Use Payload's import/seed mechanism or the admin API.

**Blocked by:** 06 (canonical catalog), 08 (Payload collections).

**Status:** ready-for-agent

- [ ] All categories are created in Payload.
- [ ] All products are created, linked to their categories and (for bulk) weight tiers, with images uploaded.
- [ ] A verification read-back confirms product count/categories match the canonical catalog exactly.

## Comments
- **Strategy: run the load LOCALLY first** (podman + `pnpm dev`) so the owner can preview products in the admin and fix issues before deploying to the VPS.
- Missing-prices decision (owner): 6 products with no price in Dolibarr load as **0** (placeholder) — real prices come later from the owner's father; they stay flagged in `report.md`.
- Loader: `apps/cms/src/seed/seed-catalog.ts` (run via `payload run`), reads `.scratch/storefront/canonical/products.json` + `categories.json`, uploads media, creates categories + products idempotently.
