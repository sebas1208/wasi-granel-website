# 12: Tienda — catalog with filters and Catalog Cards

**What to build:** Build the Tienda page from "Tienda y Catálogo Interactivo y Animado" (+ "Con Carrito Lateral Interactivo" for the side-cart affordance, which is ticketed separately): a product grid of Catalog Cards with weight-tier chips and an add-to-cart action, plus a filter sidebar (Categorías, Rango de Precio, Origen y Certificación, Modalidad). Data from mock fixtures (ticket 03).

**Blocked by:** 10 (app shell), 03 (data contract/fixtures).

**Status:** ready-for-agent

- [ ] `/tienda` lists products as Catalog Cards (image, name, weight-tier chips, price, add-to-cart).
- [ ] Filter sidebar filters by category, price range, origin/certification, and modality.
- [ ] A Catalog Card's quick weight-tier chips let a bulk product be selected by tier.
- [ ] Matches the Stitch desktop + Catálogo Móvil references; `next build`/`next lint` pass.
