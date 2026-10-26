/**
 * Throwaway: the end-to-end proof for tickets 19 + 26 — does editing a Global in Payload actually reach
 * the running storefront?
 *
 * It must be run against a PRODUCTION build, not the dev server. In dev nothing is cached, so a change
 * would appear whether or not the webhook fired and the test would prove nothing. In a built server the
 * globals are held under the `globals` cache tag with `revalidate: false`, so the ONLY way a new value
 * can appear is if the CMS's afterChange hook reached /api/revalidate and the tag was purged.
 *
 * The "before" reading is the control: it must be false, which is what shows the stale copy really was
 * being served from cache.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'

const MARKER = 'CMS-EDIT-CHECK'
const SITE = process.env.TEST_SITE ?? 'http://localhost:3011'

/**
 * This probe WRITES to a Global (and reverts). It must never run against a remote database by accident,
 * so it carries the same guard as the seed.
 */
function assertLocalDatabase(): void {
  const raw = process.env.DATABASE_URL ?? ''
  let host = ''
  try {
    host = new URL(raw).hostname
  } catch {
    host = ''
  }
  const isLocal = ['localhost', '127.0.0.1', '::1', 'host.containers.internal'].includes(host)
  if (!isLocal && process.env.ALLOW_REMOTE_SEED !== '1') {
    console.error(
      `\n  REFUSING to run against a non-local database (host: ${host || 'unparseable'}).\n` +
        '  This probe edits a live Global. Set ALLOW_REMOTE_SEED=1 only if you are certain.\n',
    )
    process.exit(1)
  }
}

async function siteShowsMarker(): Promise<{ shown: boolean; bytes: number }> {
  const res = await fetch(`${SITE}/contacto`, { cache: 'no-store' })
  const html = await res.text()
  return { shown: html.includes(MARKER), bytes: html.length }
}

/**
 * Poll, because stale-while-revalidate is the documented behaviour: the FIRST request after an
 * invalidation can still serve the old page while the new one regenerates behind it. A single fetch
 * therefore reports a false negative — which is exactly how this probe first "failed".
 */
async function pollForMarker(seconds = 25): Promise<{ shown: boolean; attempts: number; bytes: number }> {
  const deadline = Date.now() + seconds * 1000
  let attempts = 0
  let bytes = 0
  while (Date.now() < deadline) {
    attempts++
    const r = await siteShowsMarker()
    bytes = r.bytes
    if (r.shown) return { shown: true, attempts, bytes }
    await new Promise((res) => setTimeout(res, 1500))
  }
  return { shown: false, attempts, bytes }
}

/**
 * Poll for the marker to DISAPPEAR — same stale-while-revalidate reasoning in reverse. This must wait for
 * ABSENCE; reusing pollForMarker here would return the moment the marker was still present, which is the
 * opposite of what is being asserted.
 */
async function pollForNoMarker(seconds = 25): Promise<{ shown: boolean; attempts: number }> {
  const deadline = Date.now() + seconds * 1000
  let attempts = 0
  while (Date.now() < deadline) {
    attempts++
    const r = await siteShowsMarker()
    if (!r.shown) return { shown: false, attempts }
    await new Promise((res) => setTimeout(res, 1500))
  }
  return { shown: true, attempts }
}

async function main() {
  assertLocalDatabase()
  const payload = await getPayload({ config })
  const before = await payload.findGlobal({ slug: 'contacto', draft: false })
  const original = before.faq?.answer ?? ''
  const question = before.faq?.question ?? ''

  const control = await siteShowsMarker()
  console.log(`  CONTROL — built site before any edit shows the marker: ${control.shown} (expect false)`)
  console.log(`            (page served, ${control.bytes} bytes)`)

  await payload.updateGlobal({
    slug: 'contacto',
    draft: false,
    overrideAccess: true,
    data: { faq: { question, answer: `${original} ${MARKER}` } },
  })
  console.log('  published an edit carrying the marker; waiting for the afterChange hook...')

  const afterEdit = await pollForMarker()

  await payload.updateGlobal({
    slug: 'contacto',
    draft: false,
    overrideAccess: true,
    data: { faq: { question, answer: original } },
  })
  console.log('  reverted the edit; waiting for the hook again...')

  const afterRevert = await pollForNoMarker()

  const back = await payload.findGlobal({ slug: 'contacto', draft: false })
  const restored = back.faq?.answer === original

  console.log()
  console.log(`  after the edit   -> site shows marker: ${afterEdit.shown}  (expect true, after ${afterEdit.attempts} request(s))`)
  console.log(`  after the revert -> site shows marker: ${afterRevert.shown}  (expect false, after ${afterRevert.attempts} request(s))`)
  console.log(`  CMS value restored: ${restored}`)

  const ok = !control.shown && afterEdit.shown && !afterRevert.shown && restored
  console.log()
  console.log(
    ok
      ? '  VERDICT: PASS ✓ an edit in the CMS reached the live site, and reverting removed it'
      : '  VERDICT: FAIL ✗ — inspect which expectation above did not hold',
  )
  process.exit(ok ? 0 : 1)
}

main().catch((e) => {
  console.error('probe failed:', e)
  process.exit(1)
})
