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
 * WHO MAY DRIVE THIS: the window that EMBEDS us, and nothing else. The first version required the message's
 * origin to equal `NEXT_PUBLIC_PAYLOAD_URL`, which fails silently and misleadingly — open the Admin Panel on
 * any other hostname that reaches the same server (a LAN address, a tunnel, a different port) and every
 * message is dropped while the page itself still looks correct. Comparing `event.source` against
 * `window.parent` is the stronger rule: only the embedding window qualifies, whatever host it is on, and a
 * page that merely frames us can do no more than ask for a re-render of OUR server-rendered HTML, since no
 * content is ever taken from the message.
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
 * TEMPORARY DIAGNOSTIC (remove once the pane is confirmed working): every Payload-shaped message is logged
 * with its origin and whether it came from the parent, and each scheduled refresh is logged. Next forwards
 * browser console output to the dev-server log, so those lines are readable from the server side without an
 * admin session.
 *
 * Renders nothing.
 */
const DEBOUNCE_MS = 300
/** How long after a completed save to refresh again, in case the first render raced the write. */
const FOLLOW_UP_MS = 700

export function RefreshRouteOnSave() {
  const router = useRouter()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const followUp = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleRefresh = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      timer.current = null
      // eslint-disable-next-line no-console
      console.warn("[preview] refreshing the route")
      router.refresh()
    }, DEBOUNCE_MS)
  }, [router])

  /**
   * A render fired at the exact moment a save lands can read the PUBLISHED document: Payload resolves a
   * draft through a `latest` flag that the write briefly moves, and a read in that window silently falls
   * back to the published row (measured: 2 of 210 concurrent draft reads). The read layer retries once,
   * but belt and braces — one extra refresh shortly after a save means a raced render self-corrects
   * instead of leaving the editor looking at their text being thrown away.
   */
  const scheduleFollowUp = useCallback(() => {
    if (followUp.current) clearTimeout(followUp.current)
    followUp.current = setTimeout(() => {
      followUp.current = null
      // eslint-disable-next-line no-console
      console.warn("[preview] follow-up refresh after save")
      router.refresh()
    }, FOLLOW_UP_MS)
  }, [router])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return

      const type = (event.data as { type?: string }).type
      if (!type || !String(type).startsWith("payload-")) return

      // eslint-disable-next-line no-console
      console.warn(
        `[preview] message type=${type} origin=${event.origin} fromParent=${event.source === window.parent} parentIsTop=${window.parent === window.top} frameDepth=${window === window.top ? 0 : 1}`,
      )

      if (event.source !== window.parent) return
      // Two different events, one action:
      //   payload-document-event  — a save finished (Payload's own trigger)
      //   payload-live-preview    — form state changed (fires while typing)
      if (type !== "payload-document-event" && type !== "payload-live-preview") return

      scheduleRefresh()
      // A completed save is the moment a raced render is possible, so refresh again just after.
      if (type === "payload-document-event") scheduleFollowUp()
    }

    window.addEventListener("message", onMessage)
    // eslint-disable-next-line no-console
    console.warn(`[preview] listener attached (serverURL=${LIVE_PREVIEW_SERVER_URL})`)

    // Announce that we are listening, then refresh once so a freshly opened pane is current.
    ready({ serverURL: LIVE_PREVIEW_SERVER_URL })
    scheduleRefresh()

    return () => {
      window.removeEventListener("message", onMessage)
      if (timer.current) clearTimeout(timer.current)
      if (followUp.current) clearTimeout(followUp.current)
    }
  }, [scheduleRefresh, scheduleFollowUp])

  return null
}
