# 03: Catalog data contract (types + Zod + mock fixtures)

**What to build:** Define the single shape the catalog will take across frontend and Payload, in the project's domain vocabulary, and ship mock fixtures so UI tickets aren't blocked on live data. Types cover Product (Bulk vs Packaged), Weight Tier, Category, and Sucursal. The fixtures embed the products and categories already visible in the Stitch catalog pages (9 products, 8 categories, Riobamba + Quito) as placeholder data.

**Blocked by:** 00 (monorepo — authored as the shared `packages/schema`).

**Status:** done

- [x] TypeScript types + Zod schemas exist for Product, Category, Purchase Option (Weight Tier + Unit), and Sucursal.
- [x] Mock fixtures supply the 9 Stitch-listed products and 8 categories under the agreed structure.
- [x] The shape is documented as the contract both the frontend data layer and the Payload collections (ticket 08) will implement.
