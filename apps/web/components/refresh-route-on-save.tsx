"use client"

import { RefreshRouteOnSave as PayloadRefreshRouteOnSave } from "@payloadcms/live-preview-react"
import { useRouter } from "next/navigation"
import { LIVE_PREVIEW_SERVER_URL } from "@/lib/live-preview"

/**
 * Server-side Live Preview (ticket 19) — Payload's recommended integration for the App Router.
 *
 * The Admin Panel posts a message after each save (draft save, autosave, publish). All this does is call
 * `router.refresh()`, which re-renders the route ON THE SERVER — so every component re-reads its own
 * globals through the normal server code path and the draft-mode cookie decides whether that read returns
 * the draft or the published copy.
 *
 * That is the whole reason this replaces the client-side hook this ticket first used. The client-side
 * approach merges the editor's FORM STATE into the browser's copy of the document, and Payload's
 * `useLivePreview` assumes one document per page — so previewing two globals at once cross-contaminated
 * them (the footer once rendered the inicio document and crashed on `copy.navigation`). Rendering on the
 * server makes that impossible rather than guarded against: there is no shared client-side merge and no
 * way for one global's data to arrive as another's.
 *
 * "Live as you type" then comes from AUTOSAVE (see the globals' `versions.drafts.autosave`), which the docs
 * recommend alongside server-side preview for exactly this reason.
 *
 * Renders nothing.
 */
export function RefreshRouteOnSave() {
  const router = useRouter()

  return (
    <PayloadRefreshRouteOnSave
      refresh={() => router.refresh()}
      serverURL={LIVE_PREVIEW_SERVER_URL}
    />
  )
}
