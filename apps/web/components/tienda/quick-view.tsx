"use client"

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { WeightModal } from "./weight-modal"
import type { Product } from "@/lib/payload"

/**
 * One Quick View for the whole catalog page.
 *
 * The modal used to be owned per card: every CatalogCard held its own `open` state and rendered
 * its own WeightModal, so a 12-card page mounted 12 dialogs and there was nowhere for a URL to
 * open one. This controller owns the single dialog and keeps the URL in step with it, which is
 * what makes a product shareable as `/tienda?producto=<slug>`.
 *
 * URL contract:
 *   open  -> push   `?producto=<slug>` (so Back closes the modal, as a user expects)
 *   close -> Back when we pushed it ourselves, otherwise replace the param away (a visitor who
 *            landed on the deep link directly must not be sent off the site by closing it)
 */

/** The catalog filters, kept so opening/closing the modal never drops them from the URL. */
export type QuickViewQuery = {
  categoria: string | null
  modalidad: "weight" | "unit" | null
  precioMax: number | null
  q: string | null
  sort: string | null
  page: number
}

const QuickViewContext = createContext<{ open: (slug: string) => void } | null>(null)

export function useQuickView() {
  const ctx = useContext(QuickViewContext)
  if (!ctx) throw new Error("useQuickView must be used inside <QuickViewProvider>")
  return ctx
}

export function QuickViewProvider({
  products,
  deepLinked,
  initialSlug,
  query,
  children,
}: {
  /** The products on the current catalog page — opening one of these needs no refetch. */
  products: Product[]
  /** The product named by `?producto=`, fetched server-side; may not be on this page. */
  deepLinked?: Product | null
  initialSlug?: string | null
  query: QuickViewQuery
  children: React.ReactNode
}) {
  const router = useRouter()
  const [slug, setSlug] = useState<string | null>(initialSlug ?? null)
  const [syncedSlug, setSyncedSlug] = useState<string | null>(initialSlug ?? null)
  // Did WE push the ?producto= entry? Decides whether closing can safely go Back.
  const pushedRef = useRef(false)

  // Follow history navigation: Back/Forward change the URL without calling open()/close().
  // Adjusted during render — React's documented way to derive state from a changed prop, and it
  // avoids the cascading render an effect would cause.
  if ((initialSlug ?? null) !== syncedSlug) {
    setSyncedSlug(initialSlug ?? null)
    setSlug(initialSlug ?? null)
  }

  const bySlug = useMemo(() => {
    const map = new Map<string, Product>()
    for (const p of products) map.set(p.slug, p)
    if (deepLinked) map.set(deepLinked.slug, deepLinked)
    return map
  }, [products, deepLinked])

  const buildUrl = useCallback(
    (nextSlug: string | null) => {
      const p = new URLSearchParams()
      if (query.categoria) p.set("categoria", query.categoria)
      if (query.modalidad) p.set("modalidad", query.modalidad)
      if (query.precioMax != null) p.set("precioMax", String(query.precioMax))
      if (query.q) p.set("q", query.q)
      if (query.sort) p.set("sort", query.sort)
      if (query.page > 1) p.set("page", String(query.page))
      if (nextSlug) p.set("producto", nextSlug)
      const qs = p.toString()
      return qs ? `/tienda?${qs}` : "/tienda"
    },
    [query],
  )

  const open = useCallback(
    (nextSlug: string) => {
      pushedRef.current = true
      setSlug(nextSlug)
      router.push(buildUrl(nextSlug), { scroll: false })
    },
    [router, buildUrl],
  )

  const close = useCallback(() => {
    setSlug(null)
    if (pushedRef.current) {
      pushedRef.current = false
      router.back()
    } else {
      router.replace(buildUrl(null), { scroll: false })
    }
  }, [router, buildUrl])

  const product = slug ? (bySlug.get(slug) ?? null) : null

  // Keep the last product mounted so the dialog still has content while it animates out.
  // Same render-phase derivation as above.
  const [mounted, setMounted] = useState<Product | null>(product)
  if (product && product !== mounted) setMounted(product)

  return (
    <QuickViewContext.Provider value={{ open }}>
      {children}
      {mounted && (
        // key: a single dialog instance is reused across products, so remount per slug — otherwise
        // WeightModal's useState initialisers (the selected option, the amount input) would carry
        // over from the previously opened product.
        <WeightModal
          key={mounted.slug}
          product={mounted}
          open={!!product}
          onOpenChange={(v) => {
            if (!v) close()
          }}
        />
      )}
    </QuickViewContext.Provider>
  )
}
