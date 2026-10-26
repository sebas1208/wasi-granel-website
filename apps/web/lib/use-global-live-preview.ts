"use client"

import { isLivePreviewEvent, mergeData, ready } from "@payloadcms/live-preview"
import { useEffect, useRef, useState } from "react"
import { LIVE_PREVIEW_SERVER_URL } from "@/lib/live-preview"

/**
 * Live preview for ONE Global, scoped by slug.
 *
 * Why this exists instead of `useLivePreview` from @payloadcms/live-preview-react — the hook is written
 * for a page that edits a single document, and this site puts TWO in the pane at once (the homepage's
 * `inicio` global and the `footer` global, which renders on every page).
 *
 * Reading Payload's client (`handleMessage`) shows both reasons that breaks:
 *
 *   1. It accepts ANY live-preview event — `if (isLivePreviewEvent(event, serverURL))` — with no check
 *      that the message's `globalSlug` is the document this hook was given. So when the editor changes
 *      `inicio`, the footer's hook merges the INICIO document. The footer then renders `brandBlurb` as
 *      blank (no throw) and crashes on `copy.navigation.map` — which is exactly the failure the owner hit.
 *   2. `handleMessage` keeps its merged result in a MODULE-LEVEL cache (`_payloadLivePreview.previousData`),
 *      shared by every hook on the page, so the last merge wins for all of them. That also made
 *      `resetCache()`-style init order matter, which is not something a page should have to reason about.
 *
 * So this hook keeps its own state, its own merge history, and — the part that matters — ignores documents
 * that are not its own. It reuses the package's `isLivePreviewEvent` for the origin check rather than
 * re-implementing the protocol.
 *
 * The merge itself is NOT local: `mergeData` POSTs the form state to the CMS and returns that global's
 * serialized document. Which is why a caller must still supply anything the document does not own — see
 * FooterLivePreview, whose `email`/`branches` come from the `contacto` global.
 */
export function useGlobalLivePreview<T extends Record<string, unknown>>({
  initialData,
  globalSlug,
}: {
  initialData: T
  globalSlug: string
}): T {
  const [data, setData] = useState<T>(initialData)
  /** The compounding base for the next merge, scoped to this hook. */
  const latest = useRef<T>(initialData)

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      if (!isLivePreviewEvent(event, LIVE_PREVIEW_SERVER_URL)) return

      const payload = event.data as { globalSlug?: string; data?: unknown }

      // The guard Payload's hook lacks. Without it this hook would adopt another global's document.
      if (payload.globalSlug !== globalSlug) return

      try {
        const merged = await mergeData<T>({
          globalSlug,
          incomingData: (payload.data ?? {}) as Partial<T>,
          initialData: latest.current,
          serverURL: LIVE_PREVIEW_SERVER_URL,
        })

        /**
         * `mergeData` returns whatever the CMS's POST answered. On a rejected update that is an error
         * BODY, not a document — Payload's shape is `{ errors: [...] }` — and adopting it would render
         * validation messages into the page as if they were content. Keep the last good copy instead.
         */
        if (merged && typeof merged === "object" && "errors" in merged) return

        latest.current = merged
        setData(merged)
      } catch {
        // A failed merge must never take the page down mid-edit; keep the last good copy on screen.
      }
    }

    window.addEventListener("message", onMessage)
    // Tell the editor's pane we are listening, so it starts sending state.
    ready({ serverURL: LIVE_PREVIEW_SERVER_URL })

    return () => window.removeEventListener("message", onMessage)
  }, [globalSlug])

  return data
}
