import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { CatalogSkeleton } from "@/components/tienda/catalog-skeleton"
import { footerDefaults } from "@/lib/site-copy"

/** Mirrors app/tienda/page.tsx's outer structure so the shimmer lines up with the real page. */
export default function Loading() {
  // A skeleton must never wait on a fetch, so it renders the fallback copy.
  const footer = footerDefaults()

  return (
    <>
      <Navigation />
      <CatalogSkeleton />
      <Footer copy={footer} />
    </>
  )
}