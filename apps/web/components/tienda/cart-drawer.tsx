"use client"

import Image from "next/image"
import Link from "next/link"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { removeLine, updateQty, useCartLines } from "@/lib/cart"
import { fmtPrice } from "@/lib/payload"

/**
 * Stitch "Con Carrito Lateral Interactivo" (desktop side drawer) and "Carrito Consciente Móvil"
 * (mobile full page) in one responsive component: a 460px panel sliding in from the right on lg+,
 * full-bleed on a phone.
 *
 * Deliberately absent, per the agreed ticket-14 scope:
 *   - packaging — the per-line label and the "Envases Retornables Wasi" toggle + fee (no CMS data;
 *     the user removed packaging in ticket 12 and confirmed it here)
 *   - the tax line — `taxRate` is null on all 278 products
 *   - the free-shipping bar — built but gated off (see free-shipping-bar.tsx)
 *   - a working checkout — that is ticket 23
 */
export function CartDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const lines = useCartLines()
  const count = lines.reduce((n, l) => n + l.qty, 0)
  const subtotal = Number(lines.reduce((s, l) => s + l.unitPrice * l.qty, 0).toFixed(2))

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        aria-label="Carrito de compras"
        data-testid="cart-drawer"
        className="w-full sm:max-w-[460px] bg-[#fff8f4] text-[#544738] border-l border-[#ead7c3] p-0 gap-0 flex flex-col"
      >
        {/* Header */}
        <div className="p-5 md:p-6 bg-white border-b border-[#ead7c3] flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#fcbf00]/20 text-[#785a00] flex items-center justify-center border border-[#fcbf00]/40 shrink-0">
              <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-lg md:text-xl font-bold text-[#544738] font-headline">
                Tu Carrito Consciente
              </SheetTitle>
              <SheetDescription className="text-xs font-semibold text-secondary flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#10b981] shrink-0" />
                <span data-testid="cart-count-text">
                  {count === 1 ? "1 producto seleccionado" : `${count} productos seleccionados`}
                </span>
              </SheetDescription>
            </div>
          </div>
          <SheetClose asChild>
            <button
              type="button"
              aria-label="Cerrar carrito"
              className="shrink-0 w-9 h-9 rounded-full bg-[#fff8f4] hover:bg-[#ffebd6] text-[#544738] border border-[#d3c5ab] flex items-center justify-center transition-all duration-200 active:scale-90 group"
            >
              <span className="material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:rotate-90">
                close
              </span>
            </button>
          </SheetClose>
        </div>

        {lines.length === 0 ? (
          /* Empty state — not in either mockup; a cart always has one. */
          <div data-testid="cart-empty" className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="material-symbols-outlined text-5xl text-[#d3c5ab]">shopping_bag</span>
            <h3 className="font-headline font-bold text-[#544738]">Tu carrito está vacío</h3>
            <p className="text-xs text-secondary max-w-[240px]">
              Explora la despensa y agrega tus productos a granel.
            </p>
            <SheetClose asChild>
              <Link
                href="/tienda"
                className="mt-1 py-2.5 px-5 rounded-xl bg-[#fcbf00] hover:bg-[#fabd00] text-[#544738] font-bold text-xs active:scale-95 transition-all"
              >
                Ir a la tienda
              </Link>
            </SheetClose>
          </div>
        ) : (
          <>
            {/* Lines — cards on mobile (mobile mockup), divided rows on desktop (desktop mockup) */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 lg:divide-y lg:divide-[#ead7c3]/60">
              {lines.map((l) => (
                <div
                  key={l.id}
                  data-testid="cart-line"
                  data-line-id={l.id}
                  className="flex gap-3.5 group p-3 rounded-xl bg-surface-container-lowest shadow-sm lg:p-0 lg:rounded-none lg:bg-transparent lg:shadow-none lg:pt-3.5 lg:first:pt-0"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-[#ead7c3] shrink-0 relative">
                    {l.image ? (
                      <Image
                        src={l.image}
                        alt={l.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="flex items-center justify-center h-full text-[10px] text-muted-foreground">
                        Sin foto
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-[#544738] leading-tight truncate">{l.name}</h3>
                        <p data-testid="cart-line-option" className="text-xs text-secondary mt-0.5 truncate">
                          {l.label}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Eliminar ${l.name}`}
                        onClick={() => removeLine(l.id)}
                        className="shrink-0 text-secondary/60 hover:text-destructive transition-colors p-1 rounded-md"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="inline-flex items-center bg-white border border-[#d3c5ab] rounded-lg p-0.5 shadow-xs">
                        <button
                          type="button"
                          aria-label={`Quitar una unidad de ${l.name}`}
                          onClick={() => updateQty(l.id, l.qty - 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-[#544738] hover:bg-[#ffebd6] transition-colors active:scale-90"
                        >
                          <span className="material-symbols-outlined text-[14px]">remove</span>
                        </button>
                        <span data-testid="cart-line-qty" className="px-2.5 text-xs font-bold text-[#544738]">
                          {l.qty}
                        </span>
                        <button
                          type="button"
                          aria-label={`Añadir una unidad de ${l.name}`}
                          onClick={() => updateQty(l.id, l.qty + 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-[#544738] hover:bg-[#ffebd6] transition-colors active:scale-90"
                        >
                          <span className="material-symbols-outlined text-[14px]">add</span>
                        </button>
                      </div>
                      <span data-testid="cart-line-total" className="text-sm font-bold text-[#785a00]">
                        {fmtPrice(l.unitPrice * l.qty)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary + actions */}
            <div className="p-5 bg-white border-t border-[#ead7c3] shrink-0 shadow-lg space-y-3">
              <div className="space-y-1.5 text-xs text-secondary">
                <div className="flex justify-between">
                  <span>Subtotal de granos y despensa</span>
                  <span data-testid="cart-subtotal" className="font-bold text-[#544738]">
                    {fmtPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Envío local estimado</span>
                  <span className="font-semibold text-[#544738]">Calculado en checkout</span>
                </div>
                <div className="pt-2 border-t border-[#ead7c3] flex justify-between items-baseline">
                  <span className="text-sm font-bold text-[#544738] font-headline">Total estimado</span>
                  <span data-testid="cart-total" className="text-xl font-extrabold text-[#785a00] font-headline">
                    {fmtPrice(subtotal)}
                  </span>
                </div>
              </div>

              {/* Checkout belongs to ticket 23 — the button keeps the mockup's shape, disabled. */}
              <button
                type="button"
                disabled
                data-testid="cart-checkout"
                title="Próximamente"
                className="w-full py-3.5 px-6 rounded-xl bg-[#fcbf00]/40 text-[#544738]/60 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <span>Continuar a Checkout</span>
                <span className="text-[11px] font-semibold">(Próximamente)</span>
              </button>

              <SheetClose asChild>
                <button
                  type="button"
                  className="w-full text-center text-xs font-semibold text-[#544738] hover:text-[#785a00] transition-colors py-1"
                >
                  Continuar explorando la despensa
                </button>
              </SheetClose>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
