"use client"

import { useLivePreview } from "@payloadcms/live-preview-react"
import { Footer } from "@/components/footer"
import { LIVE_PREVIEW_SERVER_URL } from "@/lib/live-preview"
import type { FooterProps } from "@/lib/site-copy"

/**
 * The footer as the Live Preview pane renders it (ticket 19). Mounted only while the pane is open, for
 * the same reason as HomeLivePreview: the public path stays a server component.
 *
 * The live data is typed as the FOOTER GLOBAL's fields only — deliberately, because that is what the CMS
 * actually posts. `FooterProps` is wider: it also carries `email` and `branches`, which the footer borrows
 * from the `contacto` global (one editable home for the store's real contact details — see the comment on
 * FooterProps in lib/site-copy.ts).
 *
 * The CMS knows nothing about those borrowed keys, so when the pane sends its form state the data REPLACES
 * the server copy instead of filling it in, and both keys vanish. The footer then threw "can't access
 * property Symbol.iterator, copy.branches is undefined" — a crash inside the pane, which Next's dev overlay
 * surfaced as "This page couldn't load".
 *
 * So the borrowed fields are re-attached from the server-rendered copy, which is where they are correct:
 * they are not part of the document being edited and cannot change while the editor types.
 *
 * (The gate cannot cover this path — the wrapper only mounts in draft mode, and reaching draft mode needs
 * an admin session. It is a by-hand check.)
 */
export function FooterLivePreview({ serverCopy }: { serverCopy: FooterProps }) {
  const { data } = useLivePreview<Omit<FooterProps, "email" | "branches">>({
    initialData: serverCopy,
    serverURL: LIVE_PREVIEW_SERVER_URL,
  })

  return <Footer copy={{ ...data, email: serverCopy.email, branches: serverCopy.branches }} />
}
