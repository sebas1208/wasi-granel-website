# 09: Load the canonical catalog into Payload

**What to build:** Import the canonical catalog (ticket 06) — products, categories, and weight tiers, with images — into Payload so it is the live source of truth. Use Payload's import/seed mechanism or the admin API.

**Blocked by:** 06 (canonical catalog), 08 (Payload collections).

**Status:** ready-for-agent

- [x] All categories are created in Payload.
- [x] All products are created, linked to their categories and (for bulk) weight tiers, with images uploaded.
- [x] A verification read-back confirms product count/categories match the canonical catalog exactly.

## Comments
- **Strategy: run the load LOCALLY first** (podman + `pnpm dev`) so the owner can preview products in the admin and fix issues before deploying to the VPS.
- Missing-prices decision (owner): 6 products with no price in Dolibarr load as **0** (placeholder) — real prices come later from the owner's father; they stay flagged in `report.md`.
- Loader: `apps/cms/src/seed/seed-catalog.ts` (run via `payload run`), reads `.scratch/storefront/canonical/products.json` + `categories.json`, uploads media, creates categories + products idempotently.
- **DONE on VPS**: Coolify deployed `1d10686`; seed ran inside the app container → production now has 12 categories / 278 products, 95 photos attached, 6 price-0 placeholders. Verified read-back via `https://payload.wasigranel.com/api/products` → 278, categories → 12. The `apps/cms` dev server + postgres were left running on the owner's machine for ongoing preview (Local DB, not affected by the VPS prod load).
- Note: `canonical/` + the docx `images/` are **not in the Docker image** (`.scratch` git-ignored), so re-seeding prod requires shipping those into the container — steps documented in `docs/production/cms-deployment.md` → "Seeding the catalog".
