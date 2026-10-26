import { notFound } from "next/navigation"
import { timingSafeEqual } from "node:crypto"
import { HomeContent } from "@/app/page"
import { ContactoContent } from "@/app/contacto/page"

/**
 * The Live Preview target, and the reason it exists as a separate route.
 *
 * WHY NOT /api/preview + DRAFT MODE. That is the pattern Payload's docs describe, and it is what this
 * app did first: the pane loads `/api/preview?…`, the route enables draft mode, and it REDIRECTS to the
 * real page. It works — until the editor keeps working, and then it silently stops.
 *
 * Next signs the bypass cookie PER BUILD ("a new bypass cookie value will be generated each time you run
 * `next build`"). So every deploy — and in development every server restart — invalidates the cookie the
 * pane is holding. The pane then keeps using the dead one:
 *
 *   - its post-save REFRESHES are fetches carrying that dead cookie, so the server renders the PUBLISHED
 *     page and the editor watches their text appear to revert;
 *   - a RELOAD works, because that re-navigates through the preview route and mints a fresh cookie.
 *
 * That is exactly the "it only shows on reload" symptom, and no amount of retrying or cache-busting in
 * the storefront can fix it, because the fault is the cookie's lifetime.
 *
 * WHY THIS ROUTE FIXES IT. The pane's URL must not change when it enters preview. Here nothing redirects:
 * the iframe sits on `/preview?path=/&secret=…` for the whole session, so `router.refresh()` re-requests
 * that same URL and the secret travels with it every time. There is no cookie in the loop, so there is
 * nothing to invalidate, rotate, or expire — the preview survives restarts and deploys.
 *
 * WHY IT COSTS NOTHING IN PRODUCTION. `force-dynamic` applies to THIS route only. The public `/` and
 * `/contacto` keep the prerendered, tag-invalidated caching from ticket 26; the dynamic rendering the
 * editor needs is confined to a URL only the editor ever sees.
 *
 * The content components take `draft` as a prop precisely so this route can render the same markup as
 * the real pages with the draft forced on, instead of duplicating any of it.
 */
export const dynamic = "force-dynamic"

const ALLOWED_PATHS = new Set(["/", "/contacto"])

function secretMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  // timingSafeEqual throws on a length mismatch, so compare lengths first (that leaks only length).
  return a.length === b.length && timingSafeEqual(a, b)
}

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ path?: string; secret?: string }>
}) {
  const params = await searchParams
  const expected = process.env.PREVIEW_SECRET

  // 404 rather than an error page: an unauthenticated caller should not learn that this route exists.
  if (!expected || !secretMatches(params.secret ?? null, expected)) notFound()

  const path = params.path ?? "/"
  if (!ALLOWED_PATHS.has(path)) notFound()

  // `draft` is passed explicitly — this route exists to render drafts, so it does not consult a cookie.
  if (path === "/contacto") return <ContactoContent draft />
  return <HomeContent draft />
}
