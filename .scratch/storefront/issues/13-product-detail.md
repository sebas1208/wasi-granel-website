# 13: Product Detail + quick-view (weight tiers)

**What to build:** Build the Product Detail view and the quick-view modal from "Modal Detalle de Producto (Quick View)": high-resolution photo, origin, nutritional profile / usage suggestions, and weight-tier selection for bulk products, with add-to-cart. Data from mock fixtures (ticket 03).

**Blocked by:** 10 (app shell), 03 (data contract/fixtures).

**Status:** ready-for-agent

- [ ] A product route renders image, name, origin, description/nutrition, and price.
- [ ] Bulk products offer Weight Tier selection (100/250/500/1000 g); packaged products add as a single unit.
- [ ] The quick-view modal opens from a Catalog Card and shows the same essentials with add-to-cart.
- [ ] Selecting a tier + quantity correctly forms a cart line (passes to the cart ticket 14).
- [ ] `next build`/`next lint` pass.
