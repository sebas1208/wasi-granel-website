import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/home/hero"
import { Benefits } from "@/components/home/benefits"
import { PopularProducts } from "@/components/home/popular-products"
import { CategoryGrid, type CategoryWithCount } from "@/components/home/category-grid"
import { History } from "@/components/home/history"
import { Newsletter } from "@/components/home/newsletter"
import { getCategories, getProducts, priceDisplay, productImageUrl } from "@/lib/payload"

export const metadata = {
  title: "Wasi Granel — Despensa urbana y consciente",
  description:
    "Frutos secos, semillas, granos y productos naturales a granel, al peso exacto. Riobamba, Ecuador.",
}

export default async function HomePage() {
  let categories: CategoryWithCount[] = []
  let popular: Awaited<ReturnType<typeof getProducts>> = []

  try {
    const [rawCategories, products] = await Promise.all([getCategories(), getProducts()])

    // "Productos Populares": products with a photo and real price, one per category for variety.
    const seenCategories = new Set<string>()
    popular = products
      .filter((p) => productImageUrl(p) && priceDisplay(p).amount !== "")
      .filter((p) => {
        const slug = p.category?.slug ?? ""
        if (!slug || seenCategories.has(slug)) return false
        seenCategories.add(slug)
        return true
      })
      .slice(0, 6)

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
