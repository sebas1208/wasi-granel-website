# 16: Wire the frontend to Payload (ISR)

**What to build:** Replace the mock fixtures with live data from the Payload API per ADR-0001, using Incremental Static Regeneration so the storefront reads products/categories from Payload and rebuilds on change. Touches the homepage, Tienda, and product detail (and cart totals where they read price).

**Blocked by:** 09 (Payload loaded), 11, 12, 13 (pages exist on mocks).

**Status:** ready-for-agent

- [ ] Products and categories render from Payload, not fixtures, across homepage/Tienda/detail.
- [ ] ISR is configured so catalog edits in Payload propagate without manual redeploy.
- [ ] The mock fixtures are demoted to tests/dev-only, not the production data path.
- [ ] A product changed in Payload appears on the site after revalidation.
- [ ] `next build` passes against the live API.
