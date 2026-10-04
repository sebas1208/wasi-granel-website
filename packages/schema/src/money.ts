import { z } from 'zod'

/**
 * Price in United States Dollars (USD) — the store's single currency.
 * Represented as decimal dollars (e.g. `9.5` === $9.50) to match the Dolibarr
 * source and on-screen display.
 *
 * OPEN QUESTION (schema review): integer cents (`950`) would be immune to float
 * rounding. Kept as decimal dollars for readability against the source data.
 */
export const moneySchema = z.number().nonnegative()

export type Money = z.infer<typeof moneySchema>