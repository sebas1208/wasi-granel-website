"use client"

import { ready } from "@payloadcms/live-preview"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef } from "react"
import { LIVE_PREVIEW_SERVER_URL } from "@/lib/live-preview"

/**
 * Server-side Live Preview for the App Router (ticket 19).
 *
 * The pane renders the site in an iframe in draft mode. This listens for the Admin Panel's messages and
 * calls `router.refresh()`, which re-renders the route ON THE SERVER — so every component re-reads its own
 * global through the normal server code path, and the draft-mode cookie decides whether those reads return
 * drafts. Nothing is merged in the browser, which is why previewing several globals on one page is safe
 * here (the client-side hook this ticket first used cross-contaminated them).
 *
 * WHY THIS IS NOT JUST `RefreshRouteOnSave` FROM THE PACKAGE. Payload's component refreshes only on
 * `payload-document-event`, which the admin is supposed to emit when a save completes. Verified locally,
 * that event does not arrive: autosave demonstrably saves drafts (`_inicio_v` rows carrying autosave=true,
 * queryable in the database) and every other link checked out in isolation — the draft read, the draft
 * render, and an RSC refresh carrying the draft cookie all return draft content — yet the pane stayed stale
 * until a full page load. So rather than depend on one event firing, this also listens for
 * `payload-live-preview`, the message the admin emits on EVERY form-state change (i.e. as you type), and
 * treats either as a reason to re-render.
 *
 * That makes the pane follow the editor even when the save-driven event is silent, and the debounce keeps a
 * burst of keystrokes from costing a server render each.
 *
 * Renders nothing.
 */
const DEBOUNCE_MS = 300

export function RefreshRouteOnSave() {
  const router = useRouter()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleRefresh = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      timer.current = null
      router.refresh()
    }, DEBOUNCE_MS)
  }, [router])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // The same rule the package's own helper applies: only the Admin Panel may drive this.
      if (event.origin !== LIVE_PREVIEW_SERVER_URL) return
      if (!event.data || typeof event.data !== "object") return

      const type = (event.data as { type?: string }).type
      // Two different events, one action:
      //   payload-document-event  — a save finished (Payload's own trigger)
      //   payload-live-preview    — form state changed (fires while typing)
      if (type !== "payload-document-event" && type !== "payload-live-preview") return

      scheduleRefresh()
    }

    window.addEventListener("message", onMessage)

    // Announce that we are listening, then refresh once so a freshly opened pane is current.
    ready({ serverURL: LIVE_PREVIEW_SERVER_URL })
    scheduleRefresh()

    return () => {
      window.removeEventListener("message", onMessage)
      if (timer.current) clearTimeout(timer.current)
    }
  }, [scheduleRefresh])

  return null
}
