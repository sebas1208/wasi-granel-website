/**
 * Backfill canonical `price` + `priceUnit` on products from existing purchaseOptions.
 * - weight options present  -> price = per-lb rate (price / weightGrams * 453.592), unit "lb"
 * - only unit options       -> price = first unit price, unit "unidad"
 * Run: pnpm --filter @wasi-granel/cms exec tsx src/seed/backfill-price.ts
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'

const LB_G = 453.592

async function main() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'products', limit: 0, depth: 1 })
  let updated = 0
  let skipped = 0

  for (const p of docs) {
    const opts = ((p as { purchaseOptions?: unknown }).purchaseOptions ?? []) as {
      kind: string
      weightGrams?: number | null
      price?: number | null
    }[]

    let price: number | null = null
    let priceUnit: 'lb' | 'kg' | 'gr' | 'unidad' = 'lb'

    const w = opts
      .filter((o) => o.kind === 'weight' && o.weightGrams && typeof o.price === 'number')
      .sort((a, b) => (a.weightGrams ?? 0) - (b.weightGrams ?? 0))[0]
    const u = opts.filter((o) => o.kind === 'unit' && typeof o.price === 'number')[0]

    if (w) {
      price = Number((((w.price as number) / (w.weightGrams as number)) * LB_G).toFixed(2))
      priceUnit = 'lb'
    } else if (u) {
      price = Number((u.price as number).toFixed(2))
      priceUnit = 'unidad'
    }

    if (price == null) {
      skipped++
      continue
    }

    await payload.update({
      collection: 'products',
      id: p.id,
      data: { price, priceUnit },
    })
    updated++
  }

  console.log(`backfill done: ${updated} updated, ${skipped} skipped (no priced options)`)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})