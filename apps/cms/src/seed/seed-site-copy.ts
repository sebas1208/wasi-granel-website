/**
 * Seed the three site-copy globals (ticket 19, step 3) from the storefront's OWN fallback values.
 *
 * Why this exists: the storefront keeps today's copy as a code fallback, so until the CMS holds values
 * every page renders that copy. Seeding puts the SAME strings into the CMS, which is what makes "the
 * storefront now reads the CMS" a provably non-visual change — after this, any visible difference is a
 * real bug rather than an expected content shift.
 *
 * The values are imported from `apps/web/lib/site-copy.ts` — the same module the fallback uses — instead
 * of being retyped here. Retyping is precisely how the seeded copy and the fallback silently diverge, and
 * then seeding stops proving anything.
 *
 * Run with the Payload runtime, from the repo root or apps/cms:
 *   pnpm --filter @wasi-granel/cms run seed:site-copy
 * (uses `tsx src/seed/seed-site-copy.ts`; `payload run` silently no-ops — avoid it.)
 *
 * It PUBLISHES, so the values are live immediately and the revalidation hook fires.
 *
 * Note `_status: 'published'` is load-bearing and `draft: false` is NOT the same thing. Payload's global
 * update computes:
 *
 *     isSavingDraft = draftArg && hasDraftsEnabled(globalConfig) && data._status !== 'published' && ...
 *
 * so passing `draft: false` only declines to FORCE a draft — it never promotes an unpublished global.
 * Without `_status: 'published'` the write lands as a draft: the storefront still renders it (a public
 * read falls back to the latest version) which makes the mistake look harmless, while `revalidateGlobals`
 * correctly refuses to ping the storefront for unpublished content, so NO EDIT EVER REACHES THE LIVE SITE.
 * That is exactly how this bug hid: the site looked right and the gate was misread as the culprit.
 * Set STOREFRONT_URL if you do not want that ping to go to production — local seeding typically wants
 * STOREFRONT_URL=http://localhost:3000.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { siteCopyDefaults } from '../../../web/lib/site-copy'
import type { Contacto, Footer, Inicio } from '../payload-types'

/**
 * The CMS types `icon` / `path` / `document` as unions of their select option values, while the
 * storefront holds them as plain strings. The values seeded here are the ones the storefront actually
 * ships, which are exactly those option values — but this is still a cast, which is another reason the
 * read-back check at the end compares what LANDED instead of trusting the write.
 */
const asOptions = <T>(v: unknown): T => v as T

/* ——— safety: never touch a remote database without an explicit override ——— */
function describeTarget(): { host: string; isLocal: boolean } {
  const raw = process.env.DATABASE_URL ?? ''
  if (!raw) return { host: '(DATABASE_URL unset)', isLocal: false }
  try {
    const u = new URL(raw)
    const host = u.hostname
    const isLocal = ['localhost', '127.0.0.1', '::1', 'host.containers.internal'].includes(host)
    return { host, isLocal }
  } catch {
    return { host: '(unparseable DATABASE_URL)', isLocal: false }
  }
}

async function main() {
  const target = describeTarget()
  console.log(`  target database host: ${target.host} (${target.isLocal ? 'LOCAL' : 'REMOTE'})`)

  if (!target.isLocal && process.env.ALLOW_REMOTE_SEED !== '1') {
    console.error(
      '\n  REFUSING to seed a non-local database.\n' +
        '  This script publishes content that replaces what editors have written.\n' +
        '  Re-run with ALLOW_REMOTE_SEED=1 only if you are certain that is what you want.\n',
    )
    process.exit(1)
  }

  const payload = await getPayload({ config })
  const d = siteCopyDefaults()

  // ——— contacto ———
  await payload.updateGlobal({
    slug: 'contacto',
    draft: false,
    overrideAccess: true,
    data: {
      _status: 'published',
      general: {
        email: d.contacto.email,
        city: d.contacto.city,
        courier: d.contacto.courier,
        courierScope: d.contacto.courierScope,
      },
      hero: { ...d.contacto.hero },
      pillars: asOptions<Contacto['pillars']>(
        d.contacto.pillars.map((p) => ({ icon: p.icon, title: p.title, text: p.text })),
      ),
      hours: d.contacto.hours.map((line) => ({ line })),
      branches: d.contacto.branches.map((b) => ({
        name: b.name,
        tabLabel: b.tabLabel,
        badge: b.badge,
        region: b.region,
        description: b.description,
        address: b.address,
        // The CMS stores digits only; WhatsApp and the spaced display form are derived in the storefront.
        phone: b.phone,
        mapsUrl: b.placeUrl,
        mapsCid: b.placeCid,
        services: b.services.map((service) => ({ service })),
      })),
      faq: { question: d.contacto.faq.question, answer: d.contacto.faq.answer },
    },
  })
  console.log('  wrote contacto')

  // ——— inicio ———
  await payload.updateGlobal({
    slug: 'inicio',
    draft: false,
    overrideAccess: true,
    data: {
      _status: 'published',
      hero: { ...d.inicio.hero },
      benefits: asOptions<Inicio['benefits']>(
        d.inicio.benefits.map((b) => ({ icon: b.icon, label: b.label, sub: b.sub })),
      ),
      history: {
        eyebrow: d.inicio.history.eyebrow,
        title: d.inicio.history.title,
        body1: d.inicio.history.body1,
        body2: d.inicio.history.body2,
        stats: d.inicio.history.stats.map((s) => ({ value: s.value, label: s.label })),
        badgeTitle: d.inicio.history.badgeTitle,
        badgeSub: d.inicio.history.badgeSub,
      },
      categories: { ...d.inicio.categories },
      popular: { ...d.inicio.popular },
      newsletter: { ...d.inicio.newsletter },
    },
  })
  console.log('  wrote inicio')

  // ——— footer ———
  await payload.updateGlobal({
    slug: 'footer',
    draft: false,
    overrideAccess: true,
    data: {
      _status: 'published',
      brandBlurb: d.footer.brandBlurb,
      navigation: asOptions<Footer['navigation']>(
        d.footer.navigation.map((n) => ({ label: n.label, path: n.path })),
      ),
      legal: asOptions<Footer['legal']>(
        d.footer.legal.map((l) => ({ label: l.label, document: l.document })),
      ),
      location: { ...d.footer.location },
      legalLine: d.footer.legalLine,
    },
  })
  console.log('  wrote footer')

  // ——— read back: a seed that did not land must not report success ———
  const [c, i, f] = await Promise.all([
    payload.findGlobal({ slug: 'contacto', draft: false }),
    payload.findGlobal({ slug: 'inicio', draft: false }),
    payload.findGlobal({ slug: 'footer', draft: false }),
  ])

  const checks: [string, boolean][] = [
    // Publication is checked FIRST: every other check passes on an unpublished global, which is how a
    // draft-only seed looked successful while nothing could ever reach the live site.
    ['contacto is PUBLISHED', c._status === 'published'],
    ['inicio is PUBLISHED', i._status === 'published'],
    ['footer is PUBLISHED', f._status === 'published'],
    ['contacto.email', c.general?.email === d.contacto.email],
    ['contacto hero title', c.hero?.titleTop === d.contacto.hero.titleTop],
    ['contacto branches', (c.branches?.length ?? 0) === d.contacto.branches.length],
    ['contacto phones match', (c.branches ?? []).every((b, n) => b?.phone === d.contacto.branches[n]?.phone)],
    ['contacto hours', (c.hours?.length ?? 0) === d.contacto.hours.length],
    ['contacto pillars', (c.pillars?.length ?? 0) === d.contacto.pillars.length],
    ['inicio hero title', i.hero?.title === d.inicio.hero.title],
    ['inicio benefits', (i.benefits?.length ?? 0) === d.inicio.benefits.length],
    ['inicio history stats', (i.history?.stats?.length ?? 0) === d.inicio.history.stats.length],
    ['inicio newsletter', i.newsletter?.title === d.inicio.newsletter.title],
    ['footer blurb', f.brandBlurb === d.footer.brandBlurb],
    ['footer navigation', (f.navigation?.length ?? 0) === d.footer.navigation.length],
    ['footer legal', (f.legal?.length ?? 0) === d.footer.legal.length],
    ['footer legalLine', f.legalLine === d.footer.legalLine],
  ]

  console.log('\n  read-back verification:')
  let failed = 0
  for (const [label, ok] of checks) {
    if (!ok) failed++
    console.log(`    ${ok ? '✓' : '✗'} ${label}`)
  }
  console.log(failed === 0 ? '\n  ALL CHECKS PASSED' : `\n  ${failed} CHECK(S) FAILED`)
  process.exit(failed === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error('seed failed:', e)
  process.exit(1)
})
