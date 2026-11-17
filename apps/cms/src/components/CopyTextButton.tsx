'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Copy-to-clipboard with a visible result.
 *
 * A copy button that reports nothing is indistinguishable from a broken one: the click either worked or
 * the browser refused, and the person clicking cannot tell which. So the label changes to "Copiado" on
 * success and to "No se pudo copiar" on failure — including the case where `navigator.clipboard` is
 * unavailable because the admin is not on a secure origin, which is exactly what local HTTP dev looks like.
 *
 * `navigator.clipboard.writeText` is the only path used: a `document.execCommand` fallback would need a
 * hidden textarea and would report success even when the selection failed, which is the lie this component
 * exists to avoid.
 */
export function CopyTextButton({
  text,
  label = 'Copiar',
  copiedLabel = 'Copiado',
  className,
  style,
}: {
  text: string
  label?: string
  copiedLabel?: string
  className?: string
  style?: React.CSSProperties
}) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const onClick = useCallback(async () => {
    let ok = false
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        ok = true
      }
    } catch {
      ok = false
    }
    setState(ok ? 'copied' : 'failed')
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setState('idle'), 2200)
  }, [text])

  return (
    <button
      type="button"
      onClick={onClick}
      aria-live="polite"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer',
        ...style,
      }}
    >
      {state === 'copied' ? '✓' : state === 'failed' ? '✕' : '⧉'}
      {state === 'copied' ? copiedLabel : state === 'failed' ? 'No se pudo copiar' : label}
    </button>
  )
}
