# 04: Extract the catalog from the prose .docx into structured data

**What to build:** Turn `~/Documents/Projects/Wasi Granel/Información para catálogo.docx` (99.7 MB, ~2,463 paragraphs of prose with no tables) into a normalized structured dataset — products with name, category, description, and any detectable weight/price info, plus extracted images. This is a data-cleaning task, not a copy: segment the prose per product/section, infer categories, and emit a JSON/CSV plus an `images/` dir. Output lands under `.scratch/storefront/` (never commit the 100 MB source).

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [x] A manifest lists every product detected in the document, with its inferred category and a source location (heading index).
- [x] Each product's description/benefits text is captured verbatim or clearly summarized into the contract shape (ticket 03).
- [x] Embedded images are exported to `images/` keyed by product where associate-able.
- [x] A coverage note states any products whose category or fields could not be confidently inferred (hand-off to the reconcile ticket 06).

## Comments
- Extraction done (best-effort, v1). Outputs in `.scratch/storefront/catalog-docx/`: `products.json` (198 products: name, category, sourceIndex, description, images[], note), `products.csv`, `coverage.md`, `images/` (121 photos; git-ignored, regenerable from the source docx via `python3 tools/catalog/extract_docx.py`). Residual noise (a few benefit-bullets) is flagged in `coverage.md` for ticket 06. The docx is a curated marketing subset (~198 products) vs Dolibarr's 423 — Dolibarr remains the source of truth for structure (names/prices/weights); docx enriches with descriptions + photos.
