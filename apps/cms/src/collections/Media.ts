import type { CollectionConfig } from 'payload'

import { revalidateCatalog, revalidateCatalogAfterDelete } from '../hooks/revalidateStorefront'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  /** Replacing a photo must not wait for a manual revalidation — invalidate on change (ticket 26). */
  hooks: {
    afterChange: [revalidateCatalog],
    afterDelete: [revalidateCatalogAfterDelete],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
