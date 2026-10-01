# 06: Reconcile docx + Dolibarr into the canonical catalog + category taxonomy

**What to build:** Merge the docx extraction (ticket 04) and the Dolibarr export (ticket 05) into one canonical catalog: de-duplicate products, settle the authoritative category taxonomy (aligning with the 8 Stitch categories), and flag conflicts for owner review. This is where the source-of-truth decision is made explicit — Payload (ticket 09) loads the canonical result.

**Blocked by:** 04 (docx extraction), 05 (Dolibarr export).

**Status:** ready-for-agent

- [ ] A single canonical product set is produced with no duplicates and one category per product.
- [ ] The final category list is authored (starting from the 8 Stitch categories, extended as the data requires).
- [ ] Conflicts between the two sources are listed in a short report for the owner to resolve (or auto-resolved where unambiguous).
- [ ] The output is in the contract shape (ticket 03) and ready to load into Payload.
