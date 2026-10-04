import { z } from 'zod'
import { moneySchema } from './money'

/**
 * Purchase options: the ways a product can be bought. A single product may
 * expose several — e.g. almonds sold by weight (250 g / 500 g) AND as a fixed
 * "$5 porción". The glossary term for a weight option is a Weight Tier.
 */

/** Weight option — a fixed weight at a price (bulk). Renders as a weight-tier chip. */
export const weightOptionSchema = z.object({
  kind: z.literal('weight'),
  /** Weight in grams. */
  weightGrams: z.number().int().positive(),
  price: moneySchema,
}).strict()

/** Unit option — a fixed-price package, portion, or single item. */
export const unitOptionSchema = z.object({
  kind: z.literal('unit'),
  price: moneySchema,
  /** Human label for the unit ("porción", "500 cm3", "caja 100 g"). */
  label: z.string().optional(),
}).strict()

export const purchaseOptionSchema = z.discriminatedUnion('kind', [
  weightOptionSchema,
  unitOptionSchema,
])

export type WeightOption = z.infer<typeof weightOptionSchema>
export type UnitOption = z.infer<typeof unitOptionSchema>
export type PurchaseOption = z.infer<typeof purchaseOptionSchema>