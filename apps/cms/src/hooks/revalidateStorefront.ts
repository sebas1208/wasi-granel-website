import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

/**
 * Tell the storefront that its cached catalog is stale.
 *
 * Payload 3.90 has no built-in webhook configuration (there is no `webhooks` key in its config types),
 * so this is a collection hook that POSTs — the pattern Payload's own Next.js docs use.
 *
 * Two properties matter more than anything else here:
 *
 *  1. **It can never fail a save.** Every failure is swallowed and only logged. The owner saving a
 *     product must never see an error because the storefront was unreachable, and a CMS save must not
 *     depend on the site being up.
 *  2. **It is awaited under a short timeout** so the request actually completes before the save
 *     request ends — `AbortSignal.timeout` caps the damage at 4s when the storefront is down. Not
 *     awaiting would risk the request being torn down mid-flight, which fails silently.
 *
 * Configured by two env vars on the CMS:
 *   STOREFRONT_URL     — defaults to the production site.
 *   REVALIDATE_SECRET  — must match the storefront's. While unset this is a no-op, and the catalog
 *                        then lives until it is invalidated by hand or the app is redeployed.
 */
const TIMEOUT_MS = 4000

/** The storefront caches the whole catalog under this one tag (coarse on purpose — see ticket 26). */
const CATALOG_TAG = 'catalog'

/** Site copy edited as Global documents is cached under its own tag (ticket 19). */
const GLOBALS_TAG = 'globals'

export async function pingStorefront(tags: string[]): Promise<void> {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) return

  const base = (process.env.STOREFRONT_URL ?? 'https://wasigranel.com').replace(/\/+$/, '')

  try {
    const res = await fetch(`${base}/api/revalidate`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-wasi-secret': secret,
      },
      body: JSON.stringify({ tags }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) {
      console.warn(`[revalidate] storefront answered ${res.status} for tags: ${tags.join(', ')}`)
    }
  } catch (err) {
    // Deliberately swallowed: see (1) above.
    console.warn(`[revalidate] storefront unreachable (${tags.join(', ')}):`, (err as Error)?.message ?? err)
  }
}

/** Products, Categories and Media all feed the same cached catalog, so they share one tag. */
export const revalidateCatalog: CollectionAfterChangeHook = async ({ doc }) => {
  await pingStorefront([CATALOG_TAG])
  return doc
}

export const revalidateCatalogAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  await pingStorefront([CATALOG_TAG])
  return doc
}

/**
 * Site copy held in Globals (ticket 19). Note there is deliberately no `afterDelete` counterpart:
 * Payload globals cannot be deleted, so the hook does not exist to wire up.
 */
export const revalidateGlobals: GlobalAfterChangeHook = async ({ doc }) => {
  await pingStorefront([GLOBALS_TAG])
  return doc
}

/**
 * Uploaded media can appear in the catalog (product photos) AND in a Global (a hero or store photo),
 * so a change to either invalidates both caches. Cheap: it is one POST with two tags.
 */
export const revalidateCatalogAndGlobals: CollectionAfterChangeHook = async ({ doc }) => {
  await pingStorefront([CATALOG_TAG, GLOBALS_TAG])
  return doc
}

export const revalidateCatalogAndGlobalsAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  await pingStorefront([CATALOG_TAG, GLOBALS_TAG])
  return doc
}
