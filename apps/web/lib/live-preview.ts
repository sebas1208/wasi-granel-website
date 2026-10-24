/**
 * The Payload URL the browser uses for live preview (ticket 19).
 *
 * A separate `NEXT_PUBLIC_` value from the server-side `PAYLOAD_URL` in lib/payload.ts, because the
 * preview client component runs in the BROWSER — the server's value is never available there, and
 * browser code can only read `NEXT_PUBLIC_*`. Since the CMS lives on a public domain, both usually
 * point at the same place; the fallback keeps preview working when the variable is unset.
 */
export const LIVE_PREVIEW_SERVER_URL = (
  process.env.NEXT_PUBLIC_PAYLOAD_URL ?? "https://payload.wasigranel.com"
).replace(/\/+$/, "")
