import { Suspense } from "react"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { CatalogCard } from "@/components/tienda/catalog-card"
import { FilterSidebar } from "@/components/tienda/filter-sidebar"
import { ShopBanner } from "@/components/tienda/shop-banner"
import { Toolbar } from "@/components/tienda/toolbar"
import { ActiveChips } from "@/components/tienda/active-chips"
import { CartToast } from "@/components/tienda/cart-toast"
import { getCategoryCounts, getCategories, getTiendaProducts, type Product } from "@/lib/payload"
import { Pagination } from "./pagination"

export const metadata = { title: "Tienda — Wasi Granel" }

type SP = Record<string, string | string[] | undefined>
function num(v: string | string[] | undefined): number | null {
  const s = Array.isArray(v) ? v[0] : v
  if (!s) return null
  const n = Number(s)
  return isNaN(n) ? null : n
}
function str(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "")
}

export default async function TiendaPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams

  const categoria = str(sp.categoria) || null
  const modalidadRaw = str(sp.modalidad)
  const modalidad = modalidadRaw === "weight" || modalidadRaw === "unit" ? modalidadRaw : null
  const precioMax = num(sp.precioMax)
  const q = str(sp.q) || null
  const sort = str(sp.sort) || null
  const page = Math.max(1, num(sp.page) ?? 1)

  const [categories, counts] = await Promise.all([getCategories(), getCategoryCounts()])
  const categoryId = categoria ? categories.find((c) => c.slug === categoria)?.id ?? null : null
  const grandTotal = Object.values(counts).reduce((a, b) => a + b, 0)

  const { docs, totalDocs, totalPages, limit } = await getTiendaProducts(
    { categoria, modalidad, precioMin: null, precioMax, q, sort, page, limit: 12 },
    categoryId,
  )

  const activeCats = categoria ? categories.filter((c) => c.slug === categoria) : []

  return (
    <>
      <Navigation />

      {/* ============ SHOP HEADER HERO BANNER: FULL BLEED (Stitch) ============ */}
      <ShopBanner />

      {/* ============ MAIN: Filters Sidebar + Right Column (12-col, Stitch) ============ */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        {/* LEFT SIDEBAR: FILTERS (desktop) */}
        <Suspense fallback={<div className="lg:col-span-3 hidden lg:block" />}>
          <FilterSidebar categories={categories} counts={counts} />
        </Suspense>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-9 min-w-0">
          {/* Toolbar: mobile filter toggle + sort + view toggle */}
          <Suspense fallback={<div className="h-10 mb-4" />}>
            <Toolbar categories={categories} counts={counts} q={q} count={totalDocs} total={grandTotal} />
          </Suspense>

          {/* Active filter chips */}
          <Suspense fallback={null}>
            <ActiveChips activeCats={activeCats} modalidad={modalidad} precioMax={precioMax} q={q} />
          </Suspense>

          {docs.length === 0 ? (
            <div
              data-testid="tienda-empty"
              className="bg-surface-container-lowest border border-[#ead7c3] rounded-3xl p-10 text-center"
            >
              <span className="material-symbols-outlined text-4xl text-muted-foreground mb-3 block">search_off</span>
              <h2 className="font-headline text-lg font-bold text-on-surface mb-1">No encontramos productos</h2>
              <p className="text-sm text-secondary">Prueba con otra categoría o sube el rango de precio.</p>
            </div>
          ) : (
            <>
              {/* PRODUCT CATALOG GRID — Stitch grid view: 1 / 2(sm) / 3(lg) */}
              <div
                data-testid="tienda-grid"
                id="product-grid"
                className="grid gap-6 grid-cols-2 lg:grid-cols-3"
              >
                {docs.map((p: Product) => (
                  <CatalogCard key={p.id} product={p} />
                ))}
              </div>
              <Suspense fallback={null}>
                <Pagination page={page} totalPages={totalPages} totalDocs={totalDocs} limit={limit} />
              </Suspense>
            </>
          )}
        </div>
      </div>

      <Footer />
      <CartToast />
    </>
  )
}