"use client"

import { useLivePreview } from "@payloadcms/live-preview-react"
import { Footer } from "@/components/footer"
import { LIVE_PREVIEW_SERVER_URL } from "@/lib/live-preview"
import type { FooterProps } from "@/lib/site-copy"

/**
 * The footer as the Live Preview pane renders it (ticket 19). Mounted only while the pane is open, for
 * the same reason as HomeLivePreview: the public path stays a server component.
 */
export function FooterLivePreview({ serverCopy }: { serverCopy: FooterProps }) {
  const { data } = useLivePreview<FooterProps>({
    initialData: serverCopy,
    serverURL: LIVE_PREVIEW_SERVER_URL,
  })

  return <Footer copy={data} />
}
