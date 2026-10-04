import { z } from 'zod'
import { imageSchema } from './image'
import { purchaseOptionSchema } from './purchase-option'

export const productSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  /** Clean name with no unit/presentation suffix ("Aceituna Negra", not "… - Libra"). */
  name: z.string().min(1),
  description: z.string(),
  /** Reference to a Category slug. */
  categorySlug: z.string(),
  /** Ordered photos — first is the cover. */
  images: z.array(imageSchema).min(1),
  /** Where it is grown/sourced (region, country). */
  origin: z.string().optional(),
  inStock: z.boolean(),
  /** Legacy ERP SKU (e.g. "ACE-001"), kept for traceability during migration. */
  ref: z.string().optional(),
  /**
   * IVA rate as a decimal fraction (0 = 0%, 0.12 = 12%). Absent = zero-rated —
   * most of the store's food is 0-rated, but processed items may carry tax.
   */
  taxRate: z.number().min(0).max(1).optional(),
  /** One or more ways to buy this product (weight tiers and/or fixed units). */
  purchaseOptions: z.array(purchaseOptionSchema).min(1),
}).strict()

export type Product = z.infer<typeof productSchema>