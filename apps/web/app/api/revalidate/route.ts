import { revalidateTag } from "next/cache"
import { NextResponse } from "next/server"
import { timingSafeEqual } from "node:crypto"
import { CATALOG_TAG } from "@/lib/payload"

/**
 * On-demand cache invalidation for the storefront.
 *
 * The catalog is cached indefinitely and busted by TAG — the CMS's `afterChange`/`afterDelete` hooks
 * POST here, and this revalidates. One edit invalidates the cached catalog, so the next visitor gets
 * fresh content without us paying for a CMS round-trip on every page view.
 *
 * Guardrails:
 *  - 503 while `REVALIDATE_SECRET` is unset, rather than silently pretending to work.
 *  - 401 on a missing/wrong secret, compared in constant time.
 *  - Tags are matched against a strict pattern and capped; anything else is ignored rather than handed
 *    to Next. A caller can only ever invalidate our own catalog tag, never an arbitrary path.
 *
 * Manual use (when a webhook was missed):
 *   curl -X POST https://wasigranel.com/api/revalidate -H "x-wasi-secret: $REVALIDATE_SECRET"
 */
const TAG_PATTERN = /^[a-z0-9][a-z0-9:_-]{0,63}$/i
const MAX_TAGS = 20

function secretMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  // timingSafeEqual throws on a length mismatch, so check the length first (that only leaks length).
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(req: Request) {
  const expected = process.env.REVALIDATE_SECRET
  if (!expected) {
    return NextResponse.json(
      { error: "revalidation is not configured (REVALIDATE_SECRET is unset)" },
      { status: 503 },
    )
  }

  const provided = req.headers.get("x-wasi-secret") ?? new URL(req.url).searchParams.get("secret")
  if (!secretMatches(provided, expected)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  // Default to the whole catalog: the coarse, always-safe answer.
  let tags: string[] = [CATALOG_TAG]
  try {
    const body = (await req.json()) as { tags?: unknown }
    if (Array.isArray(body?.tags)) {
      const clean = body.tags.filter(
        (t): t is string => typeof t === "string" && TAG_PATTERN.test(t),
      )
      if (clean.length) tags = clean.slice(0, MAX_TAGS)
    }
  } catch {
    // No body or invalid JSON — fall through to the catalog-wide tag.
  }

  for (const t of tags) revalidateTag(t, "max")

  return NextResponse.json({ revalidated: true, tags, at: new Date().toISOString() })
}
