# 04: Extract the catalog from the prose .docx into structured data

**What to build:** Turn `~/Documents/Projects/Wasi Granel/Información para catálogo.docx` (99.7 MB, ~2,463 paragraphs of prose with no tables) into a normalized structured dataset — products with name, category, description, and any detectable weight/price info, plus extracted images. This is a data-cleaning task, not a copy: segment the prose per product/section, infer categories, and emit a JSON/CSV plus an `images/` dir. Output lands under `.scratch/storefront/` (never commit the 100 MB source).

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] A manifest lists every product detected in the document, with its inferred category and a source location (heading index).
- [ ] Each product's description/benefits text is captured verbatim or clearly summarized into the contract shape (ticket 03).
- [ ] Embedded images are exported to `images/` keyed by product where associate-able.
- [ ] A coverage note states any products whose category or fields could not be confidently inferred (hand-off to the reconcile ticket 06).
