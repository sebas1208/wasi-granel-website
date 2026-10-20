import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { CatalogSkeleton } from "@/components/tienda/catalog-skeleton"

/** Mirrors app/tienda/page.tsx's outer structure so the shimmer lines up with the real page. */
export default function Loading() {
  return (
    <>
      <Navigation />
      <CatalogSkeleton />
      <Footer />
    </>
  )
}