# 08: Define Payload collections (Product, Category, WeightTier)

**What to build:** Implement the Payload collections that mirror the data contract (ticket 03): Product (with Bulk vs Packaged discriminator), Category, and Weight Tier, using the domain glossary (Product, Bulk Product, Packaged Product, Weight Tier, Category). Fields cover name, category relation, price, image asset, origin, description, and (for bulk) the allowed weight tiers.

**Blocked by:** 00 (monorepo — lives in `apps/cms`), 07 (Payload provisioned), 03 (data contract).

**Status:** ready-for-agent

- [ ] Product, Category, and Weight Tier collections exist with the contract's fields and relations.
- [ ] A bulk product can reference its allowed Weight Tiers; a packaged product omits them.
- [ ] The admin can create/read a product end-to-end and re-read it back unchanged.
