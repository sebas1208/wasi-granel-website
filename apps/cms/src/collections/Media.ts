import type { CollectionConfig } from 'payload'

import {
  revalidateCatalogAndGlobals,
  revalidateCatalogAndGlobalsAfterDelete,
} from '../hooks/revalidateStorefront'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  /**
   * Replacing a photo must not wait for a manual revalidation. Media is used by BOTH the catalog and
   * the site-copy globals, so this invalidates both caches (tickets 26 + 19).
   */
  hooks: {
    afterChange: [revalidateCatalogAndGlobals],
    afterDelete: [revalidateCatalogAndGlobalsAfterDelete],
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
