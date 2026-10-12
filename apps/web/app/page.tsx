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

export const metadata: Metadata = {
  title: "Wasi Granel — Despensa urbana y consciente",
  description:
    "Frutos secos, semillas, granos y productos naturales a granel, al peso exacto. Riobamba, Ecuador.",
}

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

const getDataForHomePage = async (): Promise<[CategoryWithCount[], Product[]]> => {
  try {
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
  } catch (err) {
    console.error("[homepage] failed to load catalog from Payload:", err)
    // Sections render empty rather than crashing the page.
    return [[], []] as const;
  }
}

export default async function HomePage() {
  const [categories, popular] = await getDataForHomePage();


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
