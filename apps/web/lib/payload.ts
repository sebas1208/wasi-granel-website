// Minimal, typed read-layer over the Payload REST API.
//
// TWO bases, deliberately — they answer different questions, and conflating them caused a real bug.
//
// `base` is for SERVER-side reads. It may point at an address only the server can reach (a private or
// local CMS), which is why it is read from a server-only variable.
//
// `imageBase` is for URLs that end up in the HTML. This module is imported by TWELVE client components,
// so it is evaluated in the browser too, and the browser has to be able to load what it names. It
// therefore reads only a `NEXT_PUBLIC_` variable — the one kind that resolves identically on both sides.
//
// They must never collapse back into one expression. When the image URL fell back to `PAYLOAD_URL`, the
// server rendered `/_next/image?url=http://localhost:3001/...` while the browser rendered
// `...payload.wasigranel.com...`: every product photo produced an attribute mismatch, React logged a
// hydration error on the catalog routes, and the interactivity tests (the Quick View's Escape handler)
// failed with it. The same hazard exists in production the moment `PAYLOAD_URL` is set there.
const base = (
  process.env.PAYLOAD_URL ??
  process.env.NEXT_PUBLIC_PAYLOAD_URL ??
  "https://payload.wasigranel.com"
).replace(/\/+$/, "")

/** Media URLs rendered into HTML: reads a public variable so server and client always agree. */
const imageBase = (process.env.NEXT_PUBLIC_PAYLOAD_URL ?? "https://payload.wasigranel.com").replace(/\/+$/, "")

export type PayloadImage = {
  url: string
  width?: number
  height?: number
  alt?: string
}

export type Category = {
  id: number
  slug: string
  name: string
  description?: string | null
  sortOrder?: number | null
  image?: PayloadImage | null
}

export type PurchaseOption = {
  id?: string
  kind: "weight" | "unit" | "money"
  weightGrams?: number | null
  amount?: number | null
  price?: number | null
  label?: string | null
}

export type PriceUnit = "lb" | "kg" | "gr" | "unidad"

export type Product = {
  id: number
  slug: string
  name: string
  description?: string | null
  shortDescription?: string | null
  benefits?: ({ text?: string | null } | null)[] | null
  category?: { id: number; slug?: string; name?: string } | null
  origin?: string | null
  price?: number | null
  priceUnit?: PriceUnit | null
  images?: ({ image?: PayloadImage | null } | null)[] | null
  purchaseOptions?: PurchaseOption[] | null
  inStock?: boolean | null
  popular?: boolean | null
}

/** Tienda query (server-side): filters + pagination resolved by Payload's REST `where`. */
export type TiendaQuery = {
  categoria?: string | null
  precioMin?: number | null
  precioMax?: number | null
  modalidad?: "weight" | "unit" | null
  q?: string | null
  sort?: string | null
  page?: number
  limit?: number
}

export type TiendaResult = {
  docs: Product[]
  totalDocs: number
  page: number
  totalPages: number
  limit: number
}

/**
 * Every catalog read is cached under ONE tag and never expires on its own.
 *
 * Invalidation is event-driven, not time-based: the CMS's `afterChange`/`afterDelete` hooks POST to
 * `/api/revalidate`, which calls `revalidateTag(CATALOG_TAG)`. A timer would be pure waste here — the
 * catalog barely changes (at least until we introduce catalog existence) — and we are on a free tier,
 * so every avoided CMS round-trip is the point of this.
 *
 * If a webhook is ever missed, invalidate by hand:
 *   curl -X POST <site>/api/revalidate -H "x-wasi-secret: $REVALIDATE_SECRET"
 * A redeploy also clears everything, since the build id is part of the cache key.
 */
export const CATALOG_TAG = "catalog"

/**
 * Site copy edited as Global documents (ticket 19) caches under its own tag, so publishing a global
 * refreshes the pages without throwing away the catalog cache.
 */
export const GLOBALS_TAG = "globals"

type FetchOptions = {
  /** Cache tags this read is invalidated by. Defaults to the catalog. */
  tags?: string[]
  /**
   * Bypass the cache completely. Required in preview: the editor has to see the DRAFT, and a cached
   * read would hand them the published copy — which looks exactly like live preview being broken.
   */
  noStore?: boolean
}

async function fetcher<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { tags = [CATALOG_TAG], noStore = false } = opts
  const res = await fetch(
    `${base}${path}`,
    // `revalidate: false` == keep until the tag is invalidated. Deliberate; see above.
    noStore ? { cache: "no-store" } : { next: { tags, revalidate: false } },
  )
  if (!res.ok) throw new Error(`Payload GET ${path} -> ${res.status}`)
  return res.json()
}

/** Payload returns relative media URLs (`/api/media/file/...`) — make them absolute. */
export function absoluteImage(img?: PayloadImage | null): string | null {
  if (!img?.url) return null
  return img.url.startsWith("http") ? img.url : `${imageBase}${img.url}`
}

/** Products store their media nested under `images[].image`. Resolve the first photo URL. */
export function productImageUrl(p: Product): string | null {
  const first = p.images?.[0]
  if (!first) return null
  return absoluteImage((first as { image?: PayloadImage | null }).image ?? null)
}

/** All photo URLs for a product, in order (the Quick View shows them as a carousel). */
export function productImageUrls(p: Product): string[] {
  return (p.images ?? [])
    .map((i) => absoluteImage((i as { image?: PayloadImage | null })?.image ?? null))
    .filter((u): u is string => !!u)
}

/** Grams expressed in a customer-friendly unit — "1.67 lb", "0.76 kg", "757 g". */
export function formatInUnit(grams: number, unit: PriceUnit | null | undefined): string {
  if (unit === "kg") return `${(grams / 1000).toFixed(2)} kg`
  if (unit === "gr") return `${Math.round(grams)} g`
  if (unit === "unidad") return `${Math.round(grams)} g`
  return `${(grams / 453.592).toFixed(2)} lb`
}

export async function getCategories(): Promise<Category[]> {
  const d = await fetcher<{ docs: Category[] }>("/api/categories?limit=50&depth=1")
  return [...d.docs].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

export async function getProducts(): Promise<Product[]> {
  const d = await fetcher<{ docs: Product[] }>("/api/products?limit=300&depth=1")
  return d.docs
}

export async function getPopularProducts(): Promise<Product[]> {
  try {
    const d = await fetcher<{ docs: Product[] }>(
      "/api/products?where[popular][equals]=true&limit=12&depth=1",
    )
    return d.docs
  } catch {
    // Defensive: a missing column / CMS hiccup shouldn't blank the homepage.
    return []
  }
}

/**
 * Server-side catalog query for /tienda: filters + pagination go straight to Payload's
 * REST `where` (no client-side load-all). Callers pass an already-resolved category id
 * (resolve slug -> id via getCategories()).
 */
export async function getTiendaProducts(q: TiendaQuery, categoryId?: number | null): Promise<TiendaResult> {
  const params = new URLSearchParams()
  params.set("limit", String(q.limit ?? 12))
  params.set("page", String(q.page ?? 1))
  params.set("depth", "1")
  if (categoryId) params.set("where[category][equals]", String(categoryId))
  if (q.precioMin != null && q.precioMin > 0) params.set("where[purchaseOptions.price][greater_than_equal]", String(q.precioMin))
  if (q.precioMax != null && q.precioMax > 0) params.set("where[purchaseOptions.price][less_than_equal]", String(q.precioMax))
  if (q.modalidad) params.set("where[purchaseOptions.kind][equals]", q.modalidad)
  // text search
  if (q.q) params.set("where[name][contains]", q.q)
  // Default + "Más Populares" = popular first, then alphabetical. Payload supports
  // comma-separated multi-field sort. Nested purchaseOptions.price isn't sortable, so
  // price sorts fall back to the default (flagged as a follow-up needing a top-level field).
  const sortMap: Record<string, string> = {
    "": "-popular,name",
    populares: "-popular,name",
    "precio-asc": "price",
    "precio-desc": "-price",
    "-createdAt": "-createdAt",
    novedades: "-createdAt",
  }
  params.set("sort", sortMap[q.sort ?? ""] ?? "-popular,name")
  const d = await fetcher<{ docs: Product[]; totalDocs: number; page: number; totalPages: number; limit: number }>(
    `/api/products?${params.toString()}`,
  )
  return { docs: d.docs, totalDocs: d.totalDocs ?? d.docs.length, page: d.page ?? 1, totalPages: d.totalPages ?? 1, limit: d.limit ?? 12 }
}

/**
 * A single product by slug — used by the /tienda deep link (`?producto=<slug>`) to open a
 * product's Quick View from a shared URL. Returns null when the slug is unknown so the caller
 * can degrade to the plain catalog. Cached like the catalog read.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!slug) return null
  try {
    const d = await fetcher<{ docs: Product[] }>(
      `/api/products?where[slug][equals]=${encodeURIComponent(slug)}&limit=1&depth=1`,
    )
    return d.docs[0] ?? null
  } catch {
    return null
  }
}

/** Per-category product counts for the sidebar badges (limit=1 + totalDocs = cheap). Cached. */
export async function getCategoryCounts(): Promise<Record<string, number>> {
  try {
    const cats = await getCategories()
    const entries = await Promise.all(
      cats.map(async (c) => {
        try {
          const d = await fetcher<{ totalDocs: number }>(
            `/api/products?where[category][equals]=${c.id}&limit=1`,
          )
          return [c.slug, d.totalDocs] as const
        } catch {
          return [c.slug, 0] as const
        }
      }),
    )
    return Object.fromEntries(entries)
  } catch {
    return {}
  }
}


/* ——— Site copy (Payload Globals, ticket 19) ——————————————————————————————————————
 * Three single documents the owner edits himself: contacto, inicio, footer.
 *
 * Every field is OPTIONAL and every fetch returns `null` on failure, on purpose. Two reasons:
 *  1. a global can legitimately be saved before all its fields are filled in;
 *  2. the storefront falls back to the copy in `lib/store-info.ts` and the components, so a CMS
 *     hiccup — or a global that has not been seeded yet — degrades to today's text instead of blanking
 *     the site. A customer must never see an empty phone number because of a mistyped edit.
 */

export type ContactoBranch = {
  name?: string | null
  tabLabel?: string | null
  badge?: string | null
  region?: string | null
  description?: string | null
  address?: string | null
  /** Digits as the owner types them. WhatsApp + the spaced display form are derived, not stored. */
  phone?: string | null
  mapsUrl?: string | null
  /** Decimal form of the listing id — what makes the embedded map show the real business. */
  mapsCid?: string | null
  services?: ({ service?: string | null } | null)[] | null
}

export type GlobalContacto = {
  general?: {
    email?: string | null
    city?: string | null
    courier?: string | null
    courierScope?: string | null
  } | null
  hero?: {
    eyebrow?: string | null
    titleTop?: string | null
    titleAccent?: string | null
    body?: string | null
    visitTitle?: string | null
    visitSub?: string | null
  } | null
  pillars?: ({ icon?: string | null; title?: string | null; text?: string | null } | null)[] | null
  hours?: ({ line?: string | null } | null)[] | null
  branches?: (ContactoBranch | null)[] | null
  faq?: { question?: string | null; answer?: string | null } | null
}

export type GlobalInicio = {
  hero?: {
    eyebrow?: string | null
    kicker?: string | null
    title?: string | null
    body?: string | null
    ctaPrimaryLabel?: string | null
    ctaSecondaryLabel?: string | null
  } | null
  benefits?: ({ icon?: string | null; label?: string | null; sub?: string | null } | null)[] | null
  history?: {
    eyebrow?: string | null
    title?: string | null
    body1?: string | null
    body2?: string | null
    stats?: ({ value?: string | null; label?: string | null } | null)[] | null
    badgeTitle?: string | null
    badgeSub?: string | null
  } | null
  categories?: { eyebrow?: string | null; title?: string | null; ctaLabel?: string | null } | null
  popular?: { title?: string | null; ctaLabel?: string | null } | null
  newsletter?: {
    title?: string | null
    body?: string | null
    ctaLabel?: string | null
    placeholder?: string | null
  } | null
}

export type LegalDocumentSlug = "terms" | "privacy"

export type GlobalFooter = {
  brandBlurb?: string | null
  navigation?: ({ label?: string | null; path?: string | null } | null)[] | null
  legal?: ({ label?: string | null; document?: LegalDocumentSlug | null } | null)[] | null
  location?: { city?: string | null; branchesLine?: string | null } | null
  legalLine?: string | null
}

/**
 * Read one global. `draft: true` asks Payload for the unpublished version AND bypasses the cache —
 * that combination is what makes live preview show what the editor is typing.
 *
 * THE RETRY IS LOAD-BEARING, not defensive padding, and it must WAIT before retrying. Payload resolves a
 * draft through a `latest` flag, and an autosave briefly moves that flag while writing. A read landing in
 * that window does not fail — it silently returns the PUBLISHED document, which the pane then renders as
 * the editor's own text being thrown away. Measured against a running autosave loop: 2 of 210 concurrent
 * draft reads came back published.
 *
 * An immediate retry does NOT help: it arrives inside the same write window and sees the same thing. The
 * retry therefore sleeps first, long enough for the write to settle. A double failure is logged, because
 * this is the failure mode that looks like "live preview is broken" from the editor's seat and it should
 * never be silent.
 */
const DRAFT_RETRY_DELAY_MS = 250
const DRAFT_RETRY_ATTEMPTS = 3

async function fetchGlobal<T>(slug: string, opts: { draft?: boolean } = {}): Promise<T | null> {
  const read = () =>
    fetcher<T>(`/api/globals/${slug}${opts.draft ? "?draft=true" : ""}`, {
      tags: [GLOBALS_TAG],
      noStore: !!opts.draft,
    })

  try {
    const first = await read()
    if (!opts.draft) return first

    // A published `_status` on a draft request means the race (or a global that has no draft at all —
    // in which case every attempt returns published and we accept it after the attempts run out).
    let current = first
    for (let attempt = 1; attempt <= DRAFT_RETRY_ATTEMPTS; attempt++) {
      if ((current as { _status?: string } | null)?._status !== "published") return current
      if (attempt === DRAFT_RETRY_ATTEMPTS) break
      await new Promise((r) => setTimeout(r, DRAFT_RETRY_DELAY_MS))
      current = await read()
    }

    // eslint-disable-next-line no-console
    console.warn(
      `[preview] draft read for "${slug}" returned a PUBLISHED document after ${DRAFT_RETRY_ATTEMPTS} attempts (either this global has no draft saved yet, which is normal, or the write race beat every retry)`,
    )
    return current
  } catch {
    return null
  }
}

export const getContacto = (o?: { draft?: boolean }) => fetchGlobal<GlobalContacto>("contacto", o)
export const getInicio = (o?: { draft?: boolean }) => fetchGlobal<GlobalInicio>("inicio", o)
export const getFooter = (o?: { draft?: boolean }) => fetchGlobal<GlobalFooter>("footer", o)

/** Grams per canonical unit (priceUnit). null = not a weight-based price. */
export function unitGrams(u: PriceUnit | null | undefined): number | null {
  if (u === "gr") return 1
  if (u === "kg") return 1000
  if (u === "lb") return 453.592
  return null // "unidad"
}

/** Canonical price as $/gram (weight products) or null. */
export function ratePerGram(p: Product): number | null {
  if (p.price == null) return null
  const g = unitGrams(p.priceUnit)
  if (!g) return null
  return p.price / g
}

/**
 * Price for an option: money -> amount; weight -> canonical rate × grams
 * (falls back to the stored price when no canonical rate exists); unit -> stored price.
 */
export function optionPrice(p: Product, o: PurchaseOption): number | null {
  if (o.kind === "money" && o.amount != null) return o.amount
  if (o.kind === "weight") {
    const rate = ratePerGram(p)
    if (rate != null && o.weightGrams) return Number((rate * o.weightGrams).toFixed(2))
    return o.price ?? null
  }
  return o.price ?? null
}

/** Price shown on a card. Prefers the canonical price, then a derived weight tier, then a unit option. */
export function priceDisplay(p: Product): { amount: string; suffix: string } {
  const opts = p.purchaseOptions ?? []

  // Canonical price first ("$6.00 / lb")
  if (p.price != null) {
    const unit = p.priceUnit ?? "lb"
    const suffix = unit === "unidad" ? "" : `/${unit === "gr" ? "100g" : unit}`
    if (unit === "gr") return { amount: `$${(p.price * 100).toFixed(2)}`, suffix: "/100g" }
    return { amount: `$${Number(p.price).toFixed(2)}`, suffix: suffix ? ` ${suffix}` : "" }
  }

  const weights = opts
    .filter((o) => o.kind === "weight" && o.weightGrams && o.price != null)
    .sort((a, b) => (a.weightGrams ?? 0) - (b.weightGrams ?? 0))
  if (weights.length) {
    const w = weights[0]
    const per100 = ((w.price ?? 0) / (w.weightGrams ?? 100)) * 100
    return { amount: `$${per100.toFixed(2)}`, suffix: "/100g" }
  }
  const unit = opts.find((o) => o.kind === "unit")
  if (unit && unit.price != null) {
    return { amount: `$${Number(unit.price).toFixed(2)}`, suffix: unit.label ? `/${unit.label}` : "" }
  }
  return { amount: "", suffix: "" }
}

/* ——— Purchase-option model (ticket 12 v2) ————————————————————————————————————————
 * The canonical `price` + `priceUnit` is the single source of truth; every option price derives
 * from it. The options themselves are CMS data — seeded defaults, freely editable by hand.
 */

/** Minimum purchasable weight: we never sell 1 g. */
export const MIN_GRAMS = 50

export const fmtPrice = (n: number) => `$${n.toFixed(2)}`

/** Unit label as shown to customers — always `lb`, never "libra". */
export function unitLabel(u: PriceUnit | null | undefined): string {
  if (u === "kg") return "kg"
  if (u === "gr") return "100 g"
  if (u === "unidad") return "unidad"
  return "lb"
}

/** "500 g" / "1 kg" — used when an option carries no explicit label. */
export function formatGrams(g: number): string {
  const r = Math.round(g * 1000) / 1000
  if (r >= 1000) return `${Number((r / 1000).toFixed(2))} kg`
  return `${Number(r.toFixed(r < 10 ? 2 : 0))} g`
}

/** True when the canonical price is per weight (lb/kg/gr) — i.e. the product can be customised. */
export function hasWeightPricing(p: Product): boolean {
  return unitGrams(p.priceUnit) != null && typeof p.price === "number"
}

export function optionLabel(o: PurchaseOption): string {
  const l = o.label?.trim()
  if (l) return l
  if (o.kind === "weight" && o.weightGrams) return formatGrams(o.weightGrams)
  if (o.kind === "money" && o.amount != null) return fmtPrice(o.amount)
  return "unidad"
}

/** Options for display: deduped (legacy data has genuine duplicate tiers), in CMS order.
 *  Order is meaningful — the seed puts the canonical unit first (1 lb for a lb-priced product) and
 *  that first option is what the card and the Quick View select by default. */
export function productOptions(p: Product): PurchaseOption[] {
  const seen = new Set<string>()
  const out: PurchaseOption[] = []
  for (const o of p.purchaseOptions ?? []) {
    const key = `${o.kind}:${o.weightGrams ?? ""}:${o.amount ?? ""}:${o.label ?? ""}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(o)
  }
  return out
}

export const weightOptions = (p: Product) =>
  productOptions(p).filter((o) => o.kind === "weight" && !!o.weightGrams)
export const moneyOptions = (p: Product) =>
  productOptions(p).filter((o) => o.kind === "money" && o.amount != null)
export const unitOptions = (p: Product) => productOptions(p).filter((o) => o.kind === "unit")

/** Grams a money amount buys at the canonical rate (null when not weight-priced). */
export function gramsForMoney(p: Product, amount: number): number | null {
  const rate = ratePerGram(p)
  return rate ? amount / rate : null
}

/** Cheapest purchasable money amount — the 50 g floor at the canonical rate. */
export function minMoney(p: Product): number | null {
  const rate = ratePerGram(p)
  return rate ? Number((rate * MIN_GRAMS).toFixed(2)) : null
}

/** Equivalent rates for the Quick View badge. */
export function equivalentRates(p: Product): { per100g: number; perKg: number } | null {
  const rate = ratePerGram(p)
  if (!rate) return null
  return { per100g: Number((rate * 100).toFixed(2)), perKg: Number((rate * 1000).toFixed(2)) }
}

/** Canonical rate as a display string, e.g. "$5.99 / lb". */
export function canonicalRateLabel(p: Product): string | null {
  if (typeof p.price !== "number") return null
  return `${fmtPrice(p.price)} / ${unitLabel(p.priceUnit)}`
}
