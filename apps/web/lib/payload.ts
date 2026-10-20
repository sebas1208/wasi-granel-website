// Minimal, typed read-layer over the Payload REST API.
// Local dev can override the base with `PAYLOAD_URL` (e.g. http://localhost:3001);
// default is the production CMS so it works everywhere with no env wiring.
const base = (process.env.PAYLOAD_URL ?? "https://payload.wasigranel.com").replace(/\/+$/, "")

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

async function fetcher<T>(path: string, init?: RequestInit & { next?: { revalidate?: number } }): Promise<T> {
  // Default: no-store (homepage wants fresh reads). Tienda passes `next.revalidate`
  // to opt into Next's data cache instead.
  const opts: RequestInit = init?.next ? init : { ...init, cache: "no-store" }
  const res = await fetch(`${base}${path}`, opts)
  if (!res.ok) throw new Error(`Payload GET ${path} -> ${res.status}`)
  return res.json()
}

/** Payload returns relative media URLs (`/api/media/file/...`) — make them absolute. */
export function absoluteImage(img?: PayloadImage | null): string | null {
  if (!img?.url) return null
  return img.url.startsWith("http") ? img.url : `${base}${img.url}`
}

/** Products store their media nested under `images[].image`. Resolve the first photo URL. */
export function productImageUrl(p: Product): string | null {
  const first = p.images?.[0]
  if (!first) return null
  return absoluteImage((first as { image?: PayloadImage | null }).image ?? null)
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
    { next: { revalidate: 60 } },
  )
  return { docs: d.docs, totalDocs: d.totalDocs ?? d.docs.length, page: d.page ?? 1, totalPages: d.totalPages ?? 1, limit: d.limit ?? 12 }
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
            { next: { revalidate: 120 } },
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
