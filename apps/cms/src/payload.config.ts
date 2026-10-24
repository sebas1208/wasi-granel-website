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
 * The storefront's preview route: it verifies `PREVIEW_SECRET`, turns on draft mode for THIS browser
 * session, and redirects to the real page. Draft mode is a cookie, not a second site — so the editor
 * sees the unpublished draft at the normal URL while a visitor still gets the published version.
 *
 * `PREVIEW_SECRET` is deliberately separate from `REVALIDATE_SECRET`: one enables draft viewing, the
 * other busts the public cache. Different capabilities, so they get different secrets.
 */
const previewUrl = ({ globalConfig }: { globalConfig?: { slug?: string } }): string => {
  const base = (process.env.STOREFRONT_URL ?? 'https://wasigranel.com').replace(/\/+$/, '')
  const path = PREVIEW_PATHS[globalConfig?.slug ?? ''] ?? '/'
  const secret = process.env.PREVIEW_SECRET ?? ''
  return `${base}/api/preview?path=${encodeURIComponent(path)}&secret=${encodeURIComponent(secret)}`
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
