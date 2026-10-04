import { describe, expect, it } from 'vitest'
import { productSchema } from './product'
import { purchaseOptionSchema } from './purchase-option'
import { categorySchema } from './category'
import { sucursalSchema } from './sucursal'
import { mockCategories, mockProducts, mockSucursales } from './catalog-mocks'

describe('schema package', () => {
  it('parses every mock product, category and sucursal', () => {
    for (const p of mockProducts) expect(productSchema.safeParse(p).success).toBe(true)
    for (const c of mockCategories) expect(categorySchema.safeParse(c).success).toBe(true)
    for (const s of mockSucursales) expect(sucursalSchema.safeParse(s).success).toBe(true)
  })

  it('allows one product to mix weight and unit purchase options (hybrid)', () => {
    const almonds = mockProducts.find((p) => p.slug === 'almendras-naturales')!
    const kinds = new Set(almonds.purchaseOptions.map((o) => o.kind))
    expect(kinds).toEqual(new Set(['weight', 'unit']))
    expect(productSchema.safeParse(almonds).success).toBe(true)
  })

  it('rejects a product with no purchase options', () => {
    const p = { ...mockProducts[0], purchaseOptions: [] }
    expect(productSchema.safeParse(p).success).toBe(false)
  })

  it('rejects a non-positive weight tier', () => {
    expect(
      purchaseOptionSchema.safeParse({ kind: 'weight', weightGrams: 0, price: 1 }).success,
    ).toBe(false)
  })

  it('rejects a tax rate outside 0–1', () => {
    const p = { ...mockProducts[0], taxRate: 1.5 }
    expect(productSchema.safeParse(p).success).toBe(false)
  })

  it('rejects unknown product fields (strict)', () => {
    expect(productSchema.safeParse({ ...mockProducts[0], flavour: 'salado' }).success).toBe(false)
  })

  it('requires at least one image', () => {
    expect(productSchema.safeParse({ ...mockProducts[0], images: [] }).success).toBe(false)
  })
})