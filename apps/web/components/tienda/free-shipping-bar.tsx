"use client"

import { fmtPrice } from "@/lib/payload"

/**
 * Stitch free-shipping progress bar — "¡Te faltan $8.50 para Envío Gratis!" + a percentage bar +
 * the delivery-zone note.
 *
 * GATED OFF, deliberately. The user asked for the UI to exist but not ship and not be connected:
 * "implement the UI for the missing money to free ship, but hide it and don't connect it, I think
 * we won't ship with it but later we can have it."
 *
 * There is also nothing to compute against yet — the free-shipping threshold is still an unset
 * business number (tracked in ticket 23). To turn the bar on: set FREE_SHIPPING_ENABLED to true and
 * pass the real threshold from the cart drawer.
 */
export const FREE_SHIPPING_ENABLED = false

export function FreeShippingBar({ total, threshold }: { total: number; threshold: number }) {
  if (!FREE_SHIPPING_ENABLED) return null

  const remaining = Math.max(0, threshold - total)
  const pct = threshold > 0 ? Math.min(100, Math.round((total / threshold) * 100)) : 0

  return (
    <div data-testid="free-shipping-bar" className="bg-[#ffebd6] px-5 py-3.5 border-b border-[#ead7c3] flex flex-col gap-2 shrink-0">
      <div className="flex items-center justify-between text-xs font-bold text-[#544738]">
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#785a00] text-[18px]">local_shipping</span>
          <span>
            ¡Te faltan <strong className="text-[#785a00]">{fmtPrice(remaining)}</strong> para{" "}
            <strong>Envío Gratis</strong>!
          </span>
        </span>
        <span className="text-[#785a00] font-headline font-bold text-[13px]">{pct}%</span>
      </div>
      <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-[#d3c5ab]/60 p-0.5">
        <div className="h-full bg-[#fcbf00] rounded-full transition-all duration-500 shadow-xs" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[11px] text-secondary font-medium">Válido para Riobamba, Guano y valles aledaños.</p>
    </div>
  )
}
