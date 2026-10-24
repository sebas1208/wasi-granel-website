import { Benefits } from "@/components/home/benefits"
import { CategoryGrid, type CategoryWithCount } from "@/components/home/category-grid"
import { Hero } from "@/components/home/hero"
import { History } from "@/components/home/history"
import { Newsletter } from "@/components/home/newsletter"
import { PopularProducts } from "@/components/home/popular-products"
import type { Product } from "@/lib/payload"
import type { InicioCopy } from "@/lib/site-copy"

/**
 * The homepage body in one place, driven entirely by its props.
 *
 * It exists so the same markup serves BOTH paths (ticket 19): the public page renders this on the
 * server, and the live-preview pane renders it from the owner's unsaved draft. Keeping the section list
 * here means the two can never drift apart, which is the usual way a preview starts lying about what
 * the real page looks like.
 */
export function HomeSections({
  copy,
  popular,
  categories,
}: {
  copy: InicioCopy
  popular: Product[]
  categories: CategoryWithCount[]
}) {
  return (
    <>
      <Hero copy={copy.hero} />
      <Benefits copy={copy.benefits} />
      <PopularProducts products={popular} copy={copy.popular} />
      <CategoryGrid categories={categories} copy={copy.categories} />
      <History copy={copy.history} />
      <Newsletter copy={copy.newsletter} />
    </>
  )
}
