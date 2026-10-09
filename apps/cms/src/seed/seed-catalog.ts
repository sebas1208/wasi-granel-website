/**
 * Load the canonical catalog (from ticket 06 reconcile) into Payload.
 *
 * Idempotent: creates categories + products + uploaded media (from the docx
 * extraction), skipping anything whose slug already exists. Missing prices load
 * as 0 (placeholder — real prices come later).
 *
 * Run with the Payload runtime, from the repo root or apps/cms:
 *   pnpm --filter @wasi-granel/cms run payload -- run src/seed/seed-catalog.ts
 * (DATABASE_URL / PAYLOAD_SECRET must point at the target instance — use the local
 *  podman Postgres for a preview, the CMS on the VPS when ready to land.)
 */
import path from 'path'
import fs from 'fs'
import { getPayload } from 'payload'
import config from '../payload.config'

function findRootDir() {
  const candidates = [
    path.resolve(process.cwd()),                 // run from repo root
    path.resolve(process.cwd(), '..'),           // run from apps/cms
  ]
  for (const c of candidates) {
    const d = path.join(c, '.scratch', 'storefront', 'canonical')
    if (fs.existsSync(d)) return c
  }
  throw new Error("Could not locate repo root (.scratch/storefront/canonical) — run from wasi-granel or apps/cms")
}

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
}

async function main() {
  const root = findRootDir()
  const canonicalDir = path.join(root, '.scratch', 'storefront', 'canonical')
  const imagesDir = path.join(root, '.scratch', 'storefront', 'catalog-docx', 'images')
  const cats = JSON.parse(fs.readFileSync(path.join(canonicalDir, 'categories.json'), 'utf-8'))
  const prods = JSON.parse(fs.readFileSync(path.join(canonicalDir, 'products.json'), 'utf-8'))

  const payload = await getPayload({ config })

  // ---- categories (idempotent by slug) ----
  const catIds = new Map()
  for (const c of cats) {
    const existing = await payload.find({ collection: 'categories', where: { slug: { equals: c.slug } }, limit: 1 })
    if (existing.docs.length) { catIds.set(c.slug, existing.docs[0].id); continue }
    const doc = await payload.create({ collection: 'categories', data: c })
    catIds.set(c.slug, doc.id)
  }
  console.log(`categories: ${cats.length} (${catIds.size} present/created)`)

  const memoMedia = new Map()
  async function uploadImage(filename: string) {
    if (memoMedia.has(filename)) return memoMedia.get(filename)
    const fp = path.join(imagesDir, filename)
    if (!fs.existsSync(fp)) { memoMedia.set(filename, null); return null }
    const data = fs.readFileSync(fp)
    const ext = path.extname(filename).toLowerCase()
    const mime = (MIME as Record<string, string>)[ext] || 'application/octet-stream'
    const doc = await payload.create({
      collection: 'media',
      data: { alt: '', url: '', filename },
      file: { data, mimetype: mime, name: filename, size: data.length },
    })
    memoMedia.set(filename, doc.id)
    return doc.id
  }

  // ---- products (idempotent by slug) ----
  let created = 0, skipped = 0, withImg = 0, zeroPriced = 0
  for (const p of prods) {
    const existing = await payload.find({ collection: 'products', where: { slug: { equals: p.slug } }, limit: 1 })
    if (existing.docs.length) { skipped++; continue }

    const images = []
    for (const fn of p.images || []) {
      const mid = await uploadImage(fn)
      if (mid) { images.push({ image: mid, alt: p.name }); withImg++ }
    }

    const purchaseOptions = (p.purchaseOptions || []).map((o: any) => {
      const price = typeof o.price === 'number' ? o.price : 0
      if (price === 0) zeroPriced++
      const row: { kind: string; price: number; weightGrams?: number; label?: string } = { kind: o.kind, price }
      if (o.kind === 'weight') row.weightGrams = o.weightGrams ?? 0
      if (o.kind === 'unit' && o.label) row.label = o.label
      return row
    })

    await payload.create({
      collection: 'products',
      data: {
        slug: p.slug,
        name: p.name,
        description: p.description || '',
        category: catIds.get(p.categorySlug) ?? null,
        images,
        inStock: p.inStock ?? true,
        ref: p.ref || undefined,
        taxRate: typeof p.taxRate === 'number' ? p.taxRate : undefined,
        purchaseOptions,
      },
    })
    created++
  }

  const total = await payload.count({ collection: 'products' })
  const catCount = await payload.count({ collection: 'categories' })
  console.log('--- done ---')
  console.log(`products created: ${created}, skipped(existing): ${skipped}`)
  console.log(`images uploaded/attached: ${withImg}`)
  console.log(`options with price 0 (missing price placeholder): ${zeroPriced}`)
  console.log(`totals in Payload -> products: ${total.totalDocs}, categories: ${catCount.totalDocs}`)
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })