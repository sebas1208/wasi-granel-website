import { z } from 'zod'

/**
 * A photo for a product or category. `alt` is required — the storefront
 * targets WCAG 2.2 (the project carries a Stitch accessibility audit).
 */
export const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().min(1),
  /** Intrinsic dimensions (px) — enables responsive, no-layout-shift rendering. */
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
})

export type Image = z.infer<typeof imageSchema>