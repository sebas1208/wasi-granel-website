import { draftMode } from "next/headers"
import { NextResponse } from "next/server"
import { timingSafeEqual } from "node:crypto"

/**
 * Enter (or leave) draft mode for the Live Preview pane.
 *
 * The CMS points its preview iframe here. The request turns on Next's draft mode — a cookie for THIS
 * browser session — and redirects to the real page. That is the whole trick behind "preview the draft
 * on the production URL": the editor's browser carries the cookie and therefore renders the unpublished
 * version, while a visitor with no cookie gets the published copy at the identical URL. No second
 * deployment, no separate branch.
 *
 * `PREVIEW_SECRET` is deliberately NOT `REVALIDATE_SECRET`: this one grants sight of unpublished
 * content, the other only busts a public cache. Different powers, different secrets.
 *
 * Guardrails:
 *  - 503 while unconfigured, rather than pretending to work.
 *  - 401 on a missing/wrong secret, compared in constant time.
 *  - the redirect target is checked against an allowlist, so this can never be used as an open
 *    redirect (a link to the CMS's own preview URL bouncing a visitor off-site).
 */
const ALLOWED_PATHS = new Set(["/", "/tienda", "/contacto"])

function secretMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  // timingSafeEqual throws on a length mismatch, so compare lengths first (that leaks only length).
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function GET(req: Request) {
  const url = new URL(req.url)

  const expected = process.env.PREVIEW_SECRET
  if (!expected) {
    return NextResponse.json(
      { error: "preview is not configured (PREVIEW_SECRET is unset)" },
      { status: 503 },
    )
  }

  if (!secretMatches(url.searchParams.get("secret"), expected)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const draft = await draftMode()

  // `?disable=1` leaves draft mode — the escape hatch if an editor ever gets stuck seeing a draft.
  if (url.searchParams.get("disable") === "1") {
    draft.disable()
    return NextResponse.redirect(new URL("/", url.origin))
  }

  const path = url.searchParams.get("path") ?? "/"
  if (!ALLOWED_PATHS.has(path)) {
    return NextResponse.json({ error: "unsupported preview path" }, { status: 400 })
  }

  draft.enable()
  return NextResponse.redirect(new URL(path, url.origin))
}
