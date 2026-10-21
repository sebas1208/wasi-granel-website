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
      name: 'shortDescription',
      type: 'text',
      maxLength: 140,
      admin: {
        description:
          'Marketing one-liner for the catalog card (<=110 chars, no price, no trailing period). AI-drafted, editable.',
      },
    },
    {
      name: 'benefits',
      type: 'array',
      maxRows: 3,
      admin: {
        description:
          'Up to 3 short benefits (<=80 chars) shown in the Quick View. Factual nutrition/wellbeing only — never disease, treatment or dosing claims.',
      },
      fields: [{ name: 'text', type: 'text', required: true }],
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
      admin: { description: 'Ordered photos — first is the cover. Photo-less products load without images (added later).' },
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
      name: 'popular',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Featured on the homepage "Productos Populares" carousel.',
      },
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
      name: 'price',
      type: 'number',
      min: 0,
      index: true,
      admin: {
        description:
          'Canonical price (USD) — the rate the purchase options derive from, e.g. 6 for "$6 per pound". Drives price sorting.',
      },
    },
    {
      name: 'priceUnit',
      type: 'select',
      defaultValue: 'lb',
      options: [
        { label: 'Por libra (lb)', value: 'lb' },
        { label: 'Por kilogramo (kg)', value: 'kg' },
        { label: 'Por gramo (g)', value: 'gr' },
        { label: 'Por unidad', value: 'unidad' },
      ],
      admin: {
        description: 'What the canonical price is per (Ecuador mixes lb / kg / g).',
        condition: (data) => typeof data?.price === 'number',
      },
    },
    {
      name: 'purchaseOptions',
      type: 'array',
      minRows: 1,
      admin: { description: 'Ways this product can be bought (weight tiers, fixed units, or money amounts). Seeded with sensible defaults derived from the canonical price (1 lb / ½ lb / 500 g / 1 kg / $1) — add or remove freely.' },
      fields: [
        {
          name: 'kind',
          type: 'select',
          required: true,
          defaultValue: 'weight',
          options: [
            { label: 'By weight (tier)', value: 'weight' },
            { label: 'Fixed unit', value: 'unit' },
            { label: 'Money amount', value: 'money' },
          ],
        },
        {
          name: 'weightGrams',
          type: 'number',
          min: 1,
          admin: {
            description: 'Weight in grams for this option (bulk). Price derives from the canonical price.',
            condition: (data, siblingData) => siblingData?.kind === 'weight',
          },
          validate: (value: number | null | undefined, { siblingData }: { siblingData?: { kind?: string } }) =>
            siblingData?.kind === 'weight' && (typeof value !== 'number' || value <= 0)
              ? 'Required for weight options.'
              : true,
        },
        {
          name: 'amount',
          type: 'number',
          min: 0,
          admin: {
            description: 'Money amount in USD for this option (e.g. 1 = "$1 de almendras").',
            condition: (data, siblingData) => siblingData?.kind === 'money',
          },
          validate: (value: number | null | undefined, { siblingData }: { siblingData?: { kind?: string } }) =>
            siblingData?.kind === 'money' && (typeof value !== 'number' || value < 0)
              ? 'Required for money options.'
              : true,
        },
        {
          name: 'price',
          type: 'number',
          min: 0,
          admin: {
            description:
              'Price in USD. Weight options derive this from the canonical price (auto in seed/backfill) — only set manually for unit/money overrides.',
          },
        },
        {
          name: 'label',
          type: 'text',
          admin: {
            description: 'Option label, e.g. "Funda" (nuts), "Frasco" (jars), "porción".',
            condition: (data, siblingData) => siblingData?.kind === 'unit' || siblingData?.kind === 'weight',
          },
        },
      ],
    },
  ],
}