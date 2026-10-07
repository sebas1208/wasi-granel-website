# 08: Define Payload collections (Categories, Products + purchase options)

**What to build:** Implement the Payload collections that mirror the **refined** data contract (ticket 03): **Categories** and **Products**, with a nested **purchase-options** array (weight tiers and fixed units) — this supersedes the earlier "Bulk vs Packaged" discriminator. Fields mirror `categorySchema` / `productSchema` / `purchaseOptionSchema`: slug, name, description, category **relation**, images (≥1 uploads with alt), origin?, inStock, ref?, taxRate? (decimal 0–1), purchaseOptions (≥1: `weight` → grams+price | `unit` → price+label).

**Blocked by:** 00 (monorepo — lives in `apps/cms`), 07 (Payload provisioned), 03 (data contract).

**Status:** ready-for-agent

- [ ] `categories` and `products` collections exist with the contract's fields and relations (product → category, product → media, category → media).
- [ ] A product can carry multiple purchase options: weight tiers (grams + price) and/or fixed units (price + label); weight options require grams.
- [ ] The admin can create/read a product end-to-end (with a category + image) and re-read it back unchanged.