"use client"

import { useEffect, useState } from "react"
import { onCartAdd, type CartLine } from "@/lib/cart"
import { fmtPrice } from "@/lib/payload"

/**
 * Cart feedback toast — ported from the Stitch screens (`#cart-toast`: dark pill, sun-yellow
 * check_circle, "…añadido" + the chosen option). Appears when a line is added, hides itself.
 */
export function CartToast() {
  const [line, setLine] = useState<CartLine | null>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const off = onCartAdd((added) => {
      setLine(added)
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => setLine(null), 3200)
    })
    return () => {
      off()
      if (timer) clearTimeout(timer)
    }
  }, [])

  if (!line) return null

  return (
    <div
      data-testid="cart-toast"
      role="status"
      className="fixed top-20 right-4 sm:right-6 z-[60] bg-[#544738] text-white px-4 sm:px-5 py-3 rounded-2xl shadow-2xl border border-[#fcbf00]/40 flex items-center gap-3 max-w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <span className="material-symbols-outlined text-[#fcbf00] text-[22px] shrink-0">check_circle</span>
      <div className="text-sm font-semibold leading-tight min-w-0">
        <span className="block truncate">{line.name} añadido</span>
        <span className="block text-[11px] font-medium text-white/70 truncate">
          {line.label}
          {line.qty > 1 ? ` × ${line.qty}` : ""} · {fmtPrice(line.unitPrice * line.qty)}
        </span>
      </div>
    </div>
  )
}
