import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  /**
   * `useAPIKey: true` so the storefront can create orders (ticket 23). The web app talks to Payload from a
   * server-side route handler, because the CMS is a different origin and the browser has no session — so the
   * handler authenticates with an API key minted here, in the admin, for a user. The key must never reach the
   * browser: it lives in the web app's environment as `PAYLOAD_API_KEY`.
   */
  auth: {
    useAPIKey: true,
  },
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
}
