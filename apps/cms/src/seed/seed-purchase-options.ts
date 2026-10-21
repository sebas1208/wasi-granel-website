/**
 * Seed sensible DEFAULT purchase options per product from the canonical `price` + `priceUnit`.
 * These are defaults, not rules — the editor can add or remove options in the admin afterwards.
 *
 *   pnpm --filter @wasi-granel/cms exec tsx src/seed/seed-purchase-options.ts [--limit N] [--dry-run] [--force]
 *
 * Rules (weight-priced products):
 *   lb -> 1 lb, ½ lb, 500 g, 1 kg      kg -> 1 kg, ½ kg, 250 g, 1 lb      g -> 100 g, 250 g, 500 g, 1 kg
 *   plus a "$1" money option, but ONLY when $1 buys at least MIN_GRAMS (50 g) — an expensive product
 *   would otherwise sell less than the minimum purchase.
 * Unit-priced products get a single `unit` option at the canonical price; the storefront asks for a
 * plain quantity instead of presets.
 *
 * Weight-option prices are intentionally left empty: the storefront derives them from the canonical
 * rate, so there is one source of truth. Idempotent — re-running skips products already matching.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'

const LB_G = 453.592
const MIN_GRAMS = 50

type Unit = 'lb' | 'kg' | 'gr' | 'unidad'
type Opt = { kind: 'weight' | 'unit' | 'money'; weightGrams?: number; amount?: number; price?: number; label?: string | null }

function template(price: number, unit: Unit): Opt[] {
  if (unit === 'unidad') return [{ kind: 'unit', price, label: 'unidad' }]

  const perGram = price / (unit === 'gr' ? 1 : unit === 'kg' ? 1000 : LB_G)
  const presets: { g: number; label: string | null }[] =
    unit === 'kg'
      ? [{ g: 1000, label: '1 kg' }, { g: 500, label: '½ kg' }, { g: 250, label: null }, { g: LB_G, label: '1 lb' }]
      : unit === 'gr'
        ? [{ g: 100, label: null }, { g: 250, label: null }, { g: 500, label: null }, { g: 1000, label: null }]
        : [{ g: LB_G, label: '1 lb' }, { g: LB_G / 2, label: '½ lb' }, { g: 500, label: null }, { g: 1000, label: null }]

  const opts: Opt[] = presets.map((p) => ({
    kind: 'weight' as const,
    weightGrams: Number(p.g.toFixed(3)),
    label: p.label,
  }))
  if (1 / perGram >= MIN_GRAMS) opts.push({ kind: 'money', amount: 1 })
  return opts
}

/** Stable comparison so re-runs are no-ops. */
function fingerprint(opts: Opt[]): string {
  return JSON.stringify(
    opts.map((o) => [o.kind, o.weightGrams ?? null, o.amount ?? null, o.price ?? null, o.label ?? null]),
  )
}

function arg(name: string, fallback?: string) {
  const i = process.argv.indexOf(`--${name}`)
  if (i === -1) return fallback
  const v = process.argv[i + 1]
  return !v || v.startsWith('--') ? 'true' : v
}

const DRY = process.argv.includes('--dry-run')
const FORCE = process.argv.includes('--force')
const LIMIT = Number(arg('limit', '0'))

async function main() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'products', limit: 0, depth: 0 })
  const targets = LIMIT > 0 ? docs.slice(0, LIMIT) : docs
  let updated = 0, skipped = 0, noprice = 0

  for (const doc of targets) {
    const p = doc as unknown as {
      id: number; slug?: string; price?: number | null; priceUnit?: Unit | null
      purchaseOptions?: Opt[] | null
    }
    if (typeof p.price !== 'number' || p.price <= 0) { noprice++; continue }
    const opts = template(p.price, (p.priceUnit ?? 'lb') as Unit)

    const current: Opt[] = (p.purchaseOptions ?? []).map((o) => ({
      kind: o.kind, weightGrams: o.weightGrams ?? null, amount: o.amount ?? null,
      price: o.price ?? null, label: o.label ?? null,
    } as Opt))
    if (!FORCE && fingerprint(current) === fingerprint(opts)) { skipped++; continue }
    if (DRY) { updated++; continue }

    await payload.update({ collection: 'products', id: p.id, data: { purchaseOptions: opts } })
    updated++
    if (updated % 25 === 0) console.log(`  ...${updated} updated`)
  }

  console.log(`options seed done: ${updated} ${DRY ? 'to update (dry-run)' : 'updated'}, ${skipped} already matching, ${noprice} without a canonical price`)
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
