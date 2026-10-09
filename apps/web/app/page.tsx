import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/home/hero"
import { Benefits } from "@/components/home/benefits"
import { PopularProducts } from "@/components/home/popular-products"
import { CategoryGrid, type CategoryWithCount } from "@/components/home/category-grid"
import { History } from "@/components/home/history"
import { Newsletter } from "@/components/home/newsletter"
import { getCategories, getPopularProducts, getProducts, priceDisplay, productImageUrl } from "@/lib/payload"

export const metadata = {
  title: "Wasi Granel — Despensa urbana y consciente",
  description:
    "Frutos secos, semillas, granos y productos naturales a granel, al peso exacto. Riobamba, Ecuador.",
}

export default async function HomePage() {
  let categories: CategoryWithCount[] = []
  let popular: Awaited<ReturnType<typeof getProducts>> = []

  try {
    const [rawCategories, popularResult, products] = await Promise.all([
      getCategories(),
      getPopularProducts(),
      getProducts(),
    ])
    popular = popularResult
    // Fallback while the CMS `popular` field isn't deployed yet (or nothing flagged):
    // show a photo + priced selection so the section isn't empty.
    if (popular.length === 0) {
      const seen = new Set<string>()
      popular = products
        .filter((p) => productImageUrl(p) && priceDisplay(p).amount !== "")
        .filter((p) => {
          const slug = p.category?.slug ?? ""
          if (!slug || seen.has(slug)) return false
          seen.add(slug)
          return true
        })
        .slice(0, 6)
    }

    // Per-category variety counts, derived from the catalog.
    const counts = new Map<string, number>()
    for (const p of products) {
      const slug = p.category?.slug ?? ""
      if (slug) counts.set(slug, (counts.get(slug) ?? 0) + 1)
    }
    categories = rawCategories.map((c) => ({ ...c, count: counts.get(c.slug) ?? 0 }))
  } catch (err) {
    console.error("[homepage] failed to load catalog from Payload:", err)
    // Sections render empty rather than crashing the page.
  }

  return (
    <>
      <Navigation />
      <main className="flex-1">
        <Hero />
        <Benefits />
        <PopularProducts products={popular} />
        <CategoryGrid categories={categories} />
        <History />
        <Newsletter />
      </main>
      <Footer />
    </>
  )
}
