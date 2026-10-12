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
  kind: "weight" | "unit"
  weightGrams?: number | null
  price?: number | null
  label?: string | null
}

export type Product = {
  id: number
  slug: string
  name: string
  category?: { id: number; slug?: string; name?: string } | null
  images?: ({ image?: PayloadImage | null } | null)[] | null
  purchaseOptions?: PurchaseOption[] | null
  inStock?: boolean | null
  popular?: boolean | null
}

async function fetcher<T>(path: string): Promise<T> {
  const res = await fetch(`${base}${path}`, { cache: "no-store" })
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

/** Price shown on a card. Prefers a weight tier computed as per-100g; falls back to a unit option. */
export function priceDisplay(p: Product): { amount: string; suffix: string } {
  const opts = p.purchaseOptions ?? []
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
