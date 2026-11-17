"use client"

import { useState } from "react"

/**
 * "Copiar" affordance beside the order reference (Stitch confirmation screens, desktop + mobile).
 * The reference is the one thing the customer may need to repeat in the WhatsApp chat, so the button
 * copies exactly what is displayed. Falls back to a no-op state where the clipboard API is unavailable.
 */
export function CopyReference({ reference }: { reference: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(reference)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      /* clipboard unavailable — the reference is on screen anyway */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      data-testid="copy-reference"
      aria-label="Copiar número de pedido"
      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-medium text-sm transition-colors self-start sm:self-center"
    >
      <span className="material-symbols-outlined text-[18px]">{copied ? "check" : "content_copy"}</span>
      <span>{copied ? "¡Copiado!" : "Copiar"}</span>
    </button>
  )
}
