import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/home/hero"
import { Benefits } from "@/components/home/benefits"
import { PopularProducts } from "@/components/home/popular-products"
import { CategoryGrid, type CategoryWithCount } from "@/components/home/category-grid"
import { History } from "@/components/home/history"
import { Newsletter } from "@/components/home/newsletter"
import { getCategories, getPopularProducts, getProducts, priceDisplay, Product, productImageUrl } from "@/lib/payload"
import { Metadata } from "next"
import { resolveFooterProps, resolveInicio } from "@/lib/site-copy"

export const metadata: Metadata = {
  title: "Wasi Granel — Despensa urbana y consciente",
  description:
    "Frutos secos, semillas, granos y productos naturales a granel, al peso exacto. Riobamba, Ecuador.",
}

/**
 * The homepage is PRERENDERED now, not dynamic.
 *
 * The catalog is cached under a tag and invalidated by the CMS (see lib/payload.ts and
 * app/api/revalidate/route.ts), so this page is built once and re-rendered only when something
 * actually changed. That is why there is no `force-dynamic` here any more: a dynamic route re-fetches
 * the catalog from Payload on EVERY visit — three round-trips per page view — which is precisely the
 * cost this change removes.
 */

const getPopularProductsFallback = async (popular: Product[], products: Product[]) => {
  if (popular.length > 0) return popular;

  const seen = new Set<string>()
  return products
    .filter((p) => productImageUrl(p) && priceDisplay(p).amount !== "")
    .filter((p) => {
      const slug = p.category?.slug ?? ""
      if (!slug || seen.has(slug)) return false
      seen.add(slug)
      return true
    })
    .slice(0, 6)

}

/**
 * Deliberately NO try/catch around the catalog load.
 *
 * This page's output is cached until the CMS invalidates it, so swallowing a failed load would bake an
 * EMPTY homepage into the cache and keep serving it — far worse than before, when the next request
 * simply retried. Failing loudly is the correct behaviour now: at build time it fails the deploy (no
 * empty homepage is ever shipped), and during a tag revalidation Next keeps the last good cache entry
 * rather than replacing it with nothing.
 *
 * (`getPopularProducts` keeps its own internal fallback — an empty popular list is a legitimate state,
 * and `getPopularProductsFallback` below derives one from the full catalog.)
 */
const getDataForHomePage = async (): Promise<[CategoryWithCount[], Product[]]> => {
  const [rawCategories, popular, products] = await Promise.all([
    getCategories(),
    getPopularProducts(),
    getProducts(),
  ]);

  const popularFinal = await getPopularProductsFallback(popular, products);

  // Per-category variety counts, derived from the catalog.
  const counts = new Map<string, number>()
  for (const p of products) {
    const slug = p.category?.slug ?? ""
    if (slug) counts.set(slug, (counts.get(slug) ?? 0) + 1)
  }
  const categories = rawCategories.map((c) => ({ ...c, count: counts.get(c.slug) ?? 0 }))

  return [categories, popularFinal];
}

export default async function HomePage() {
  const [categories, popular] = await getDataForHomePage();
  const [footer, inicio] = await Promise.all([resolveFooterProps(), resolveInicio()])


  return (
    <>
      <Navigation />
      <main className="flex-1">
        <Hero copy={inicio.hero} />
        <Benefits copy={inicio.benefits} />
        <PopularProducts products={popular} copy={inicio.popular} />
        <CategoryGrid categories={categories} copy={inicio.categories} />
        <History copy={inicio.history} />
        <Newsletter copy={inicio.newsletter} />
      </main>
      <Footer copy={footer} />
    </>
  )
}
