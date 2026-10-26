import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { HomeSections } from "@/components/home/home-sections"
import { RefreshRouteOnSave } from "@/components/refresh-route-on-save"
import { type CategoryWithCount } from "@/components/home/category-grid"
import { getCategories, getPopularProducts, getProducts, priceDisplay, Product, productImageUrl } from "@/lib/payload"
import { Metadata } from "next"
import { draftMode, headers } from "next/headers"
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
  // Draft mode is the cookie the CMS's preview pane turns on for the logged-in editor. It MUST reach
  // the resolvers, or the editor would be shown the published copy and conclude editing is broken.
  const { isEnabled: draft } = await draftMode()
  const [footer, inicio] = await Promise.all([
    resolveFooterProps({ draft }),
    resolveInicio({ draft }),
  ])

  // TEMPORARY DIAGNOSTIC (remove once the preview pane is confirmed working). This is the only place that
  // can say what the SERVER rendered on a given refresh: the draft flag it saw and the headline it built.
  // A pane showing published content has exactly three possible causes — the render lost draft mode, the
  // CMS handed back a published document for a draft read, or the client never applied the update — and
  // this line separates them. Server-side, so it lands in the dev-server log with no admin session.
  const h = await headers()
  // eslint-disable-next-line no-console
  console.warn(
    `[preview] render draft=${draft} headline=${JSON.stringify(inicio.hero.title)}` +
      ` fetchMode=${h.get("sec-fetch-mode") ?? "-"} dest=${h.get("sec-fetch-dest") ?? "-"}` +
      ` rsc=${h.get("rsc") ? "yes" : "no"} bypassCookie=${h.get("cookie")?.includes("__prerender_bypass") ? "yes" : "no"}`,
  )


  return (
    <>
      <Navigation />
      {/* In the preview pane only: refresh this route after each save so the SERVER re-renders, using
          the draft cookie to decide whether the reads return drafts. Renders nothing. */}
      {draft ? <RefreshRouteOnSave /> : null}
      <main className="flex-1">
        <HomeSections copy={inicio} popular={popular} categories={categories} />
      </main>
      <Footer copy={footer} />
    </>
  )
}
