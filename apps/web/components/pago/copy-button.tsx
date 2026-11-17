"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Copy-to-clipboard for the payment page, where it is not a nicety: the account number and the RUC are
 * typed into a banking app, and a mistyped digit means a refused transfer.
 *
 * The result is always shown. A button that silently does nothing is indistinguishable from a broken one,
 * and the failure it hides is the real one — `navigator.clipboard` is unavailable on a non-secure origin, so
 * the customer is left to select the number by hand with no idea the button failed. `execCommand` is
 * deliberately not used as a fallback: it reports success even when the selection did not happen.
 */
export function CopyButton({
  value,
  label = "Copiar",
  copiedLabel = "Copiado",
  ariaLabel,
  variant = "compact",
}: {
  value: string
  label?: string
  copiedLabel?: string
  ariaLabel: string
  /** `compact` = the small pill beside the order reference; `primary` = the one beside the account number. */
  variant?: "compact" | "primary"
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle")
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const onClick = useCallback(async () => {
    let ok = false
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value)
        ok = true
      }
    } catch {
      ok = false
    }
    setState(ok ? "copied" : "failed")
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setState("idle"), 2200)
  }, [value])

  const shell =
    variant === "primary"
      ? "h-10 px-3.5 rounded-lg bg-primary-container text-on-primary-container hover:brightness-95 shadow-sm"
      : "h-9 px-3 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high"

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-live="polite"
      data-copy-state={state}
      className={`${shell} transition-transform active:scale-95 flex items-center gap-1.5 text-xs font-label font-bold shrink-0`}
    >
      <span className="material-symbols-outlined text-[18px]">
        {state === "copied" ? "check" : state === "failed" ? "error" : "content_copy"}
      </span>
      <span>{state === "copied" ? copiedLabel : state === "failed" ? "No se pudo copiar" : label}</span>
    </button>
  )
}
