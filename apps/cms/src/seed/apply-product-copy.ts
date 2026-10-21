/**
 * Apply AI-drafted marketing copy (shortDescription + description + benefits) into the CMS.
 *
 *   pnpm --filter @wasi-granel/cms exec tsx src/seed/apply-product-copy.ts [--limit N] [--dry-run] [--pv v4]
 *
 * Idempotent: products already matching the draft are skipped, so re-running is safe.
 */
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'
import config from '../payload.config'

const REPO_ROOT = path.resolve(fileURLToPath(new URL('../../../../', import.meta.url)))

function arg(name: string, fallback?: string) {
  const i = process.argv.indexOf(`--${name}`)
  if (i === -1) return fallback
  const v = process.argv[i + 1]
  return !v || v.startsWith('--') ? 'true' : v
}

const DRY = process.argv.includes('--dry-run')
const LIMIT = Number(arg('limit', '0'))
const PV = arg('pv', 'v4')!
const FILE = path.join(REPO_ROOT, '.scratch/storefront/copy/drafts.jsonl')

type Draft = { slug: string; name?: string; pv?: string; shortDescription?: string; description?: string; benefits?: string[] }
type ProductDoc = { id: number; slug?: string; shortDescription?: string | null; description?: string | null; benefits?: { text?: string | null }[] | null }

async function main() {
  if (!fs.existsSync(FILE)) throw new Error(`drafts file not found: ${FILE}`)
  const bySlug = new Map<string, Draft>()
  for (const line of fs.readFileSync(FILE, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t) continue
    try {
      const o = JSON.parse(t) as Draft
      if (o?.slug && o.pv === PV) bySlug.set(o.slug, o)
    } catch { /* ignore bad line */ }
  }
  let drafts = [...bySlug.values()]
  if (LIMIT > 0) drafts = drafts.slice(0, LIMIT)
  console.log(`drafts at pv=${PV}: ${drafts.length} (file ${FILE})`)

  const payload = await getPayload({ config })
  let updated = 0, skipped = 0, missing = 0

  for (const d of drafts) {
    const found = await payload.find({
      collection: 'products',
      where: { slug: { equals: d.slug } },
      limit: 1,
      depth: 0,
    })
    const p = found.docs[0] as ProductDoc | undefined
    if (!p) { missing++; console.log(`  ! no product for slug ${d.slug}`); continue }

    const same =
      (p.shortDescription ?? null) === (d.shortDescription ?? null) &&
      (p.description ?? null) === (d.description ?? null) &&
      JSON.stringify((p.benefits ?? []).map((b) => b?.text ?? null)) === JSON.stringify(d.benefits ?? [])

    if (same) { skipped++; continue }
    if (DRY) { updated++; continue }

    await payload.update({
      collection: 'products',
      id: p.id,
      data: {
        shortDescription: d.shortDescription ?? null,
        description: d.description ?? null,
        benefits: (d.benefits ?? []).map((text) => ({ text })),
      },
    })
    updated++
    if (updated % 25 === 0) console.log(`  ...${updated} updated`)
  }

  console.log(`apply done: ${updated} ${DRY ? 'to update (dry-run)' : 'updated'}, ${skipped} already current, ${missing} missing`)
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
