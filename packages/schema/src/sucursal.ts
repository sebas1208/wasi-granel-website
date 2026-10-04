import { z } from 'zod'

/** A physical store location. The store has two: Riobamba and Quito. */
export const sucursalSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  city: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().optional(),
  /** WhatsApp number for order handoff (E.164). */
  whatsapp: z.string().optional(),
  hours: z.string().optional(),
  /** Maps / directions link. */
  locationUrl: z.string().url().optional(),
})

export type Sucursal = z.infer<typeof sucursalSchema>