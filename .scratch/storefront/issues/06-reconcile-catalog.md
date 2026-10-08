# 06: Reconcile docx + Dolibarr into the canonical catalog + category taxonomy

**What to build:** Merge the docx extraction (ticket 04) and the Dolibarr export (ticket 05) into one canonical catalog: de-duplicate products, settle the authoritative category taxonomy (aligning with the 8 Stitch categories), and flag conflicts for owner review. This is where the source-of-truth decision is made explicit — Payload (ticket 09) loads the canonical result.

**Blocked by:** 04 (docx extraction), 05 (Dolibarr export).

**Status:** ready-for-agent

- [x] A single canonical product set is produced with no duplicates and one category per product.
- [x] The final category list is authored (starting from the 8 Stitch categories, extended as the data requires).
- [x] Conflicts between the two sources are listed in a short report for the owner to resolve (or auto-resolved where unambiguous).
- [x] The output is in the contract shape (ticket 03) and ready to load into Payload.

## Comments
- v1 reconcile done. Outputs in `.scratch/storefront/canonical/`: `products.json` (**278** products, contract shape: slug/name/description/categorySlug/images/inStock/ref/taxRate/purchaseOptions), `categories.json` (10 categories = 8 Stitch + `aceites-aceitunas`, `infusiones-tes`, `ajies-ajos`, `endulzantes/semillas-granos`), `products.csv`, `report.md`. Tool: `tools/catalog/reconcile.py`.
- **Purchase options preserved** (per owner): each row's presentation becomes its own option — lb/grams stay separate weight tiers, cm3/ml/funda/porción stay unit options; presentation rows merge into one product (e.g. "Aceite de Coco Extra Virgen" ×3 sizes → 1 product, 3 options; "Aji Panca" Libra + Porción → 2 options). 100 products carry >1 option.
- **OPEN (owner review):** 31 products have no confident category (Dolibarr "Otros" + not in docx) — listed in `report.md`; and the 2 no-suffix products (Manzana Deshidratada, Miel de Abeja Natural Honey Pequeña) have no price-unit. Decide these before/while ticket 09 loads.
- 9 Dolibarr categories mapped onto the 10 canonical; docx provides description + photo for ~120 products (marketing subset ~198; the docx-only remainder is listed in the report, Dolibarr stays source of truth for structure).
