# 22: Product images — fill the gaps and replace the reused stock shots

**What to build:** Get real, correct product photography into the catalog. Today two thirds of the catalog shows no image at all, and most of what does exist is a scraped file reused across several unrelated products. Scope covers sourcing/ingesting the photos, the CMS media pipeline, and the storefront's handling of missing images.

**Blocked by:** nothing. 12 (tienda) is closed; this is a follow-up on its data.

**Status:** needs-triage — the sourcing decision below is the user's (and ultimately needs the parents' camera).

## The problem, measured against production (`payload.wasigranel.com`, 2026-10-21)

278 products, 53 media files.

| images per product | products | share |
| --- | --- | --- |
| **0 (no image)** | **185** | **67%** |
| 1 | 91 | 33% |
| 2 | 2 | <1% |

Missing images are worst exactly where the catalog is largest:

| category | products | no image | % missing |
| --- | --- | --- | --- |
| Infusiones & Tés | 67 | 40 | 60% |
| Frutos Secos | 45 | 19 | 42% |
| Especias & Hierbas | 39 | 24 | 62% |
| Cacao & Chocolates | 30 | 25 | 83% |
| Frutas Deshidratadas | 29 | 27 | **93%** |
| Harinas & Cereales | 23 | 18 | 78% |
| Ajíes & Ajos | 14 | 13 | **93%** |
| Semillas & Granos | 12 | 5 | 42% |
| Aceites & Aceitunas | 8 | 6 | 75% |
| Otros | 5 | 5 | **100%** |
| Endulzantes | 5 | 2 | 40% |
| Legumbres & Menestras | 1 | 1 | 100% |
| **TOTAL** | **278** | **185** | **67%** |

The 95 image slots are filled by only **53 files**, and **21 of those files (40%) are shared by 2–7 products each** — e.g. one file serves 7 products, another 6, another 5. So ~63 products display a photo that also illustrates something else; a customer browsing Frutos Secos sees the same picture on different nuts.

Every one of the 53 files is named `NNNN__imageNN.ext` — scraped from the legacy source rather than shot for this store. Sizes are also all over the place: from **260×148** and **299×168** (too small for a card, will look soft at 2×) up to **1800×1013 / 3.3 MB** PNGs (no resizing, no format conversion, will hurt LCP).

## Decision needed first

Who produces the photos? An agent cannot invent authentic pictures of this family's actual products — inventing them is exactly the "stock image" problem being complained about. Options:

1. **The parents shoot them** (recommended) — a simple shot list per product (top-down on a neutral surface, consistent lighting), then this ticket ingests them. Best result, needs their time.
2. **Reuse official supplier/packaging imagery** where the parents don't shoot — acceptable for commodity goods (harinas, especias), must be legally usable.
3. **AI-generated stand-ins** to unblock the UI now, clearly marked as temporary — the user has said stock images look wrong, so this is likely *worse*, not better; only worth it if a photo pass is months away.

Pick one before implementation starts; the ingest tooling is the same in all three cases.

## Change list

1. **Audit + shot list (agent, no decision needed)** — a script that reports image coverage per product/category and emits a printable checklist grouped by category, so the parents can shoot in one pass instead of per-product requests.
2. **Media pipeline (agent)** — bulk ingest script: resize to a max edge, convert to WebP/AVIF, strip EXIF, generate the thumbnail Payload needs, and set `alt` from the product name (today `alt` is the product name, which is fine, but it must stay populated on every upload). Replaces the current 3 MB PNG situation.
3. **Image ordering / gallery** — where a product has several photos, control which is primary; the Quick View carousel (built in ticket 12) is **dormant until products carry >1 image**, so this ticket is what makes it real.
4. **Missing-image fallback (agent, no decision needed)** — verify what a card and the Quick View render with zero images today; replace with a branded placeholder (category icon + name) rather than a broken/empty box. This alone fixes the 185-product case visually.
5. **Do not ship dead stock:** when a product's only photo is one of the shared files, that's a signal it needs a real shot — surface it in the audit output rather than leaving it silently.

## Acceptance
- [ ] Coverage report exists and is reproducible (per-category counts above are its first run).
- [ ] Ingest script is idempotent: re-running does not duplicate media or reset `alt`/ordering.
- [ ] Every uploaded image is resized + converted; no multi-MB PNGs served to the storefront.
- [ ] A product with zero images renders a branded placeholder on the card **and** in the Quick View — no broken image, no empty box, no layout shift.
- [ ] Carousel is exercised with a product that has ≥2 images, on desktop 1280 and mobile 390.
- [ ] Browser-verified per `AGENTS.md`: `pnpm --filter @wasi-granel/web check:layout` green, both viewports.
- [ ] Re-run the coverage report and record the new no-image count here (target: 0 before launch).

## Open questions
- Do the parents already have photos somewhere (phone camera roll, WhatsApp, a supplier folder) that we can ingest as a first pass?
- Is there a legal constraint on using supplier imagery for the Ecuadorian market?
- Priority order if the photo pass has to be split: the homepage's "Productos Populares" and the top categories (Frutos Secos, Infusiones & Tés) first, or breadth-first across all categories?
