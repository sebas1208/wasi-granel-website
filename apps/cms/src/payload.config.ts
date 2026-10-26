import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Products } from './collections/Products'
import { Contacto } from './globals/Contacto'
import { Inicio } from './globals/Inicio'
import { Footer } from './globals/Footer'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/** Where each global is visible on the storefront — the live-preview iframe points at these. */
const PREVIEW_PATHS: Record<string, string> = {
  contacto: '/contacto',
  inicio: '/',
  // The footer renders on every page; home is the representative one.
  footer: '/',
}

/**
 * The storefront's preview route.
 *
 * It verifies `PREVIEW_SECRET` and renders the page with drafts FORCED ON, right there — it does not
 * redirect and it does not use draft mode. That is deliberate, and it is what makes the pane keep
 * working: Next signs the draft-mode cookie per build, so every deploy (and every dev-server restart)
 * invalidates the cookie a pane is holding, after which its refreshes render the PUBLISHED page and
 * only a reload recovers. Keeping the pane on `/preview?…` means the secret travels with every request,
 * including `router.refresh()`, and there is no cookie to go stale.
 *
 * `PREVIEW_SECRET` is deliberately separate from `REVALIDATE_SECRET`: one enables draft viewing, the
 * other busts the public cache. Different capabilities, so they get different secrets.
 */
const previewUrl = ({ globalConfig }: { globalConfig?: { slug?: string } }): string => {
  const base = (process.env.STOREFRONT_URL ?? 'https://wasigranel.com').replace(/\/+$/, '')
  const path = PREVIEW_PATHS[globalConfig?.slug ?? ''] ?? '/'
  const secret = process.env.PREVIEW_SECRET ?? ''
  return `${base}/preview?path=${encodeURIComponent(path)}&secret=${encodeURIComponent(secret)}`
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    livePreview: {
      // Which documents get the Live Preview pane. The root config names them, so the three globals
      // do not each repeat the setup.
      globals: ['contacto', 'inicio', 'footer'],
      url: previewUrl,
      openByDefault: true,
      // The owner edits content from a phone as often as a laptop; these are the widths that matter
      // for this store (most customers arrive on mobile).
      breakpoints: [
        { name: 'movil', label: 'Móvil', width: 390, height: 844 },
        { name: 'escritorio', label: 'Escritorio', width: 1280, height: 900 },
      ],
    },
  },
  /**
   * This CMS's own public origin. Payload warns when it is unset ("Falling back to empty string as
   * request origin... recommended to explicitly set the serverURL") and uses it to build file URLs, so
   * it is set from `SERVER_URL` rather than left empty.
   *
   * `cors` / `csrf` are deliberately NOT set. They are only required when the front-end calls this API
   * CROSS-ORIGIN — which is what payload's CLIENT-side live preview does (its hook POSTs the editor's form
   * state back here to re-serialize it). This site uses the SERVER-side preview Payload recommends for the
   * App Router instead: the pane only calls `router.refresh()`, and every read of this API happens
   * server-to-server, so no browser CORS policy is involved and there is nothing to allowlist. If
   * client-side preview is ever adopted, the docs' snippet is
   * `cors: [storefrontOrigin], csrf: [storefrontOrigin]` — and `csrf` must stay non-strict-safe, because
   * the admin's own POSTs carry an Origin too.
   */
  serverURL: process.env.SERVER_URL ?? 'https://payload.wasigranel.com',
  collections: [Users, Media, Categories, Products],
  // Site copy the owner and his father edit themselves (ticket 19). Globals are single documents —
  // one form each, no list, no create/delete. See src/globals/ for the reasoning per global.
  globals: [Contacto, Inicio, Footer],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
