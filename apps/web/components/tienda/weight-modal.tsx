"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Markdown from "react-markdown"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { optionPrice, priceDisplay, productImageUrl, ratePerGram, type Product, type PurchaseOption } from "@/lib/payload"

const LB_G = 453.592
const EMPTY: PurchaseOption[] = []
type Unit = "gr" | "kg" | "lb"

/** gr steps 50g; kg/lb step 0.5 (halves) per spec. */
const stepFor = (u: Unit) => (u === "gr" ? 50 : 0.5)
const minFor = (u: Unit) => (u === "gr" ? 50 : 0.5)
const toGrams = (v: number, u: Unit) => (u === "gr" ? v : u === "kg" ? v * 1000 : v * LB_G)
const fmtW = (g: number) => (g >= 1000 ? `${g / 1000}kg` : `${g}g`)

/**
 * Stitch Quick View modal: image showcase left, content right (title, canonical price,
 * markdown description clamped behind "Leer más", gram pills + money options + custom
 * weight input, add-to-cart). Renders OUTSIDE the card (portal) so the card's onClick
 * can't re-open it on close.
 */
export function WeightModal({
  product,
  open,
  onOpenChange,
  trigger,
}: {
  product: Product
  open: boolean
  onOpenChange: (v: boolean) => void
  trigger: React.ReactNode
}) {
  const opts = product.purchaseOptions ?? EMPTY
  const weightTiers = useMemo(
    () =>
      opts
        .filter((o) => o.kind === "weight" && o.weightGrams)
        .sort((a, b) => (a.weightGrams ?? 0) - (b.weightGrams ?? 0)),
    [opts],
  )
  const moneyOpts = useMemo(() => opts.filter((o) => o.kind === "money" && o.amount != null), [opts])
  const unitOpts = useMemo(() => opts.filter((o) => o.kind === "unit"), [opts])
  const isWeight = weightTiers.length > 0
  const rate = ratePerGram(product)
  const img = productImageUrl(product)
  const base = priceDisplay(product)

  const [tier, setTier] = useState<PurchaseOption | null>(weightTiers[0] ?? null)
  const [picked, setPicked] = useState<PurchaseOption | null>(null)
  const [unit, setUnit] = useState<Unit>("gr")
  const [custom, setCustom] = useState<string>("")
  const [unitChoice, setUnitChoice] = useState<PurchaseOption | null>(unitOpts[0] ?? null)
  const [qty, setQty] = useState(1)
  const [descOpen, setDescOpen] = useState(false)

  // custom input overrides the picked tier when entered
  const grams = useMemo(() => {
    const n = parseFloat(custom)
    if (!isNaN(n) && n > 0) return toGrams(n, unit)
    return tier?.weightGrams ?? null
  }, [custom, unit, tier])

  const price = useMemo(() => {
    if (isWeight) {
      if (grams != null && rate != null) return `$${(rate * grams).toFixed(2)}`
      if (tier) {
        const tp = optionPrice(product, tier)
        if (tp != null) return `$${tp.toFixed(2)}`
      }
      return base.amount
    }
    if (picked) {
      const p = optionPrice(product, picked)
      if (p != null) return `$${(picked.kind === "unit" ? p * qty : p).toFixed(2)}`
    }
    if (unitChoice) return `$${((unitChoice.price ?? 0) * qty).toFixed(2)}`
    return base.amount
  }, [isWeight, grams, rate, tier, picked, product, unitChoice, qty, base.amount])

  const suffix = isWeight
    ? grams != null
      ? fmtW(grams)
      : base.suffix.replace(/^\s*\//, "")
    : picked?.kind === "unit"
      ? picked.label ?? ""
      : unitChoice?.label ?? ""

  const desc = product.description ?? ""
  const descLong = desc.length > 170

  const pill = (active: boolean) =>
    `py-2 rounded-xl text-xs transition-all active:scale-95 text-center ${
      active
        ? "bg-primary border border-[#e5ac00] text-foreground font-bold shadow-xs"
        : "font-semibold bg-surface-container-low text-secondary border border-[#ead7c3] hover:bg-surface-container hover:text-on-surface"
    }`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        data-testid="product-modal"
        className="sm:max-w-3xl w-[calc(100vw-1.5rem)] max-h-[92vh] overflow-y-auto rounded-3xl border border-outline-variant p-0 gap-0"
      >
        <div className="flex flex-col md:flex-row">
          {/* Left: image showcase + badges */}
          <div className="md:w-1/2 relative bg-surface-container-low flex flex-col items-center justify-center p-6 sm:p-8 min-h-[240px] md:min-h-[420px] overflow-hidden">
            <span className="absolute top-4 left-4 z-10 bg-surface-container-lowest/95 backdrop-blur text-[11px] font-bold text-deep-amber px-3 py-1 rounded-full shadow-xs uppercase tracking-wider">
              {product.category?.name ?? ""}
            </span>
            {img ? (
              <Image
                src={img}
                alt={product.name}
                width={420}
                height={420}
                className="w-full max-w-[320px] aspect-square object-cover rounded-2xl transition-transform duration-500"
              />
            ) : (
              <div className="w-full max-w-[320px] aspect-square rounded-2xl bg-surface-container flex items-center justify-center text-sm text-muted-foreground">
                Sin foto
              </div>
            )}
            <span className="absolute bottom-4 left-4 text-[11px] font-semibold text-secondary bg-surface-container-lowest/90 px-2.5 py-1 rounded-full backdrop-blur">
              {product.inStock === false ? "Agotado" : "En stock"}
            </span>
          </div>

          {/* Right: content */}
          <div className="md:w-1/2 flex flex-col p-5 sm:p-6">
            <DialogTitle className="font-headline text-xl sm:text-2xl text-on-surface font-bold leading-tight mb-2 pr-9">
              {product.name}
            </DialogTitle>

            {/* Canonical price */}
            <div className="flex items-baseline flex-wrap gap-2 mb-3">
              <span className="font-headline text-2xl font-bold text-foreground">{price}</span>
              {suffix && <span className="text-xs font-semibold text-muted-foreground">/ {suffix}</span>}
              {isWeight && rate != null && (
                <span className="text-[11px] font-bold text-deep-amber bg-deep-amber/10 px-2 py-0.5 rounded-md">
                  ${(rate * 100).toFixed(2)} / 100g
                </span>
              )}
            </div>

            {/* Description (markdown, clamped) */}
            {desc && (
              <div className="mb-4">
                <div
                  className={`text-xs sm:text-sm text-secondary leading-relaxed [&_p]:mb-1.5 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-0.5 ${
                    descLong && !descOpen ? "line-clamp-3" : ""
                  }`}
                >
                  <Markdown>{desc}</Markdown>
                </div>
                {descLong && (
                  <button
                    type="button"
                    onClick={() => setDescOpen((v) => !v)}
                    className="mt-1 text-xs font-bold text-deep-amber hover:underline"
                  >
                    {descOpen ? "Ver menos" : "Leer más"}
                  </button>
                )}
              </div>
            )}

            {/* Selectors */}
            {isWeight ? (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary">Selecciona el peso:</span>
                  <span className="text-[11px] font-semibold text-deep-amber">Pesa exacta</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 mb-3" id="modal-gram-selector">
                  {weightTiers.map((t, ti) => (
                    <button
                      key={t.id ?? `t${ti}`}
                      type="button"
                      onClick={() => {
                        setTier(t)
                        setPicked(null)
                        setCustom("")
                      }}
                      className={pill(!custom && !picked && tier?.id === t.id)}
                    >
                      {t.label ?? fmtW(t.weightGrams!)}
                    </button>
                  ))}
                </div>

                {/* Money options (e.g. $1 de almendras) */}
                {moneyOpts.length > 0 && (
                  <div className="grid grid-cols-4 gap-1.5 mb-3">
                    {moneyOpts.map((m, i) => (
                      <button
                        key={m.id ?? i}
                        type="button"
                        onClick={() => {
                          setPicked(picked === m ? null : m)
                          setTier(null)
                          setCustom("")
                        }}
                        className={pill(picked === m)}
                      >
                        ${m.amount}
                      </button>
                    ))}
                  </div>
                )}

                {/* Custom weight: gr steps 50 / kg-lb halves */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#ead7c3]/60">
                  <label htmlFor="custom-weight" className="text-[11px] font-bold text-secondary shrink-0">
                    Gramaje exacto:
                  </label>
                  <div className="flex items-center gap-1.5 flex-1 max-w-[210px]">
                    <input
                      id="custom-weight"
                      type="number"
                      value={custom}
                      min={minFor(unit)}
                      step={stepFor(unit)}
                      onChange={(e) => setCustom(e.target.value)}
                      placeholder={unit === "gr" ? "220" : "0.5"}
                      className="w-full py-1.5 pl-2.5 pr-6 text-xs font-bold text-on-surface bg-surface border border-[#d3c5ab] rounded-xl outline-none focus:border-deep-amber focus:ring-1 focus:ring-deep-amber/30 transition-all"
                    />
                    <select
                      aria-label="Unidad"
                      value={unit}
                      onChange={(e) => {
                        setUnit(e.target.value as Unit)
                        setCustom("")
                      }}
                      className="py-1.5 text-xs font-bold text-on-surface bg-surface border border-[#d3c5ab] rounded-xl focus:border-deep-amber"
                    >
                      <option value="gr">g</option>
                      <option value="kg">kg</option>
                      <option value="lb">lb</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : unitOpts.length > 0 ? (
              <div className="mb-4">
                <div className="text-xs font-bold uppercase tracking-wider text-secondary mb-2">Unidad</div>
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  {unitOpts.map((o, i) => (
                    <button
                      key={o.id ?? i}
                      type="button"
                      onClick={() => setUnitChoice(o)}
                      className={pill(unitChoice?.id === o.id)}
                    >
                      {o.label ?? "unidad"}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-secondary">Cantidad:</span>
                  <input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 py-1.5 px-2 text-xs font-bold text-on-surface bg-surface border border-[#d3c5ab] rounded-xl"
                  />
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="mt-auto w-full py-3 rounded-2xl bg-foreground hover:bg-[#3a2e21] text-white font-bold text-sm active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
              Añadir al carrito
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}