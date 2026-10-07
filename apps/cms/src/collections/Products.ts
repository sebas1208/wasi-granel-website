import type { CollectionConfig } from 'payload'

/**
 * Products (mirrors `productSchema` + `purchaseOptionSchema` from @wasi-granel/schema).
 *
 * Purchase options are a nested array (one or more ways to buy): either a
 * weight tier (`kind: weight` → grams + price) OR a fixed unit (`kind: unit` →
 * price + label). This is the refined model that superseded the earlier
 * "Bulk vs Packaged" discriminator.
 */
export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'inStock', 'slug'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'Clean name, no unit/presentation suffix.' },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'images',
      type: 'array',
      minRows: 1,
      admin: { description: 'Ordered photos — first is the cover.' },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'alt',
          type: 'text',
          admin: { description: 'Alt text (WCAG). Falls back to the media alt if empty.' },
        },
      ],
    },
    {
      name: 'origin',
      type: 'text',
      admin: { description: 'Where it is grown/sourced (region, country).' },
    },
    {
      name: 'inStock',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'ref',
      type: 'text',
      admin: { description: 'Legacy ERP SKU (e.g. ACE-001).' },
    },
    {
      name: 'taxRate',
      type: 'number',
      min: 0,
      max: 1,
      admin: {
        description: 'IVA as a decimal (0 = 0%, 0.12 = 12%). Empty = zero-rated.',
      },
    },
    {
      name: 'purchaseOptions',
      type: 'array',
      minRows: 1,
      admin: { description: 'Ways this product can be bought (weight tiers and/or fixed units).' },
      fields: [
        {
          name: 'kind',
          type: 'select',
          required: true,
          defaultValue: 'weight',
          options: [
            { label: 'By weight (tier)', value: 'weight' },
            { label: 'Fixed unit', value: 'unit' },
          ],
        },
        {
          name: 'weightGrams',
          type: 'number',
          min: 1,
          admin: {
            description: 'Weight in grams for this option (bulk).',
            condition: (data, siblingData) => siblingData?.kind === 'weight',
          },
          validate: (value: number | null | undefined, { siblingData }: { siblingData?: { kind?: string } }) =>
            siblingData?.kind === 'weight' && (typeof value !== 'number' || value <= 0)
              ? 'Required for weight options.'
              : true,
        },
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0,
          admin: { description: 'Price in USD (decimal dollars).' },
        },
        {
          name: 'label',
          type: 'text',
          admin: {
            description: 'Unit label, e.g. "porción", "500 cm3".',
            condition: (data, siblingData) => siblingData?.kind === 'unit',
          },
        },
      ],
    },
  ],
}