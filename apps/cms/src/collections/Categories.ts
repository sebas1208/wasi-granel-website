import type { CollectionConfig } from 'payload'

/**
 * Product categories (mirrors `categorySchema` from @wasi-granel/schema).
 * Flat list; `slug` is the URL-stable key that products reference.
 */
export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'sortOrder'],
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
      admin: { description: 'URL-stable identifier, e.g. "frutos-secos".' },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Short category blurb (optional).' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      index: true,
      admin: { description: 'Manual display order (Dolibarr styled categories "1.", "2.", …).' },
    },
    {
      name: 'image',
      type: 'relationship',
      relationTo: 'media',
      admin: { description: 'Optional category cover image.' },
    },
  ],
}