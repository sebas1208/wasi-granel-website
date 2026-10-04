import { z } from 'zod'
import { imageSchema } from './image'

export const categorySchema = z.object({
  /** URL-stable identifier, also the key products reference. */
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string().optional(),
  /** Manual display order (Dolibarr styled its categories "1.", "2.", …). */
  sortOrder: z.number().int().nonnegative(),
  image: imageSchema.optional(),
})

export type Category = z.infer<typeof categorySchema>