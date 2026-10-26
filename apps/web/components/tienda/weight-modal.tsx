"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Markdown from "react-markdown"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useFavorite } from "@/lib/favorites"
import { addToCart } from "@/lib/cart"
import {
  MIN_GRAMS,
  canonicalRateLabel,
  fmtPrice,
  formatGrams,
  formatInUnit,
  gramsForMoney,
  hasWeightPricing,
  minMoney,
  moneyOptions,
  optionLabel,
  optionPrice,
  productImageUrl,
  productImageUrls,
  ratePerGram,
  unitGrams,
  weightOptions,
  type Product,
  type PurchaseOption,
} from "@/lib/payload"

/** Exact-amount units: weight in g / lb / kg, or a money amount ("$10 de almendras"). */
type AmountUnit = "gr" | "lb" | "kg" | "$"
const UNIT_GLYPH: Record<AmountUnit, string> = { gr: "g", lb: "lb", kg: "kg", "$": "$" }

/**
 * Stitch "Modal Detalle de Producto (Quick View)": image showcase left; on the right the category
 * strip + close, title, price with the unit it refers to plus the canonical-rate badge, short + long
 * description, "Beneficios Clave", the weight pills, an EXACT amount row (weight or money) and the
 * quantity stepper + CTA, with the trust strip underneath.
 *
 * Deliberately absent (user decisions): origen, rating, and the "Empaque Eco" block (packaging
 * belongs to the cart, ticket 14). Customisation is driven by the canonical price/unit, so every
 * weight-priced product can be bought at ANY amount — not only those that happen to carry tiers.
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
  /** Optional: in the catalog the dialog is driven by the URL (see QuickViewProvider), not a trigger. */
  trigger?: React.ReactNode
}) {
  const [fav, toggleFav] = useFavorite(product.id)
  const weightPriced = hasWeightPricing(product)
  const weights = useMemo(() => weightOptions(product), [product])
  const moneys = useMemo(() => moneyOptions(product), [product])
  const rate = ratePerGram(product)
  const canonical = canonicalRateLabel(product)
  const floorMoney = minMoney(product)
  const gallery = productImageUrls(product)
  const img = gallery[0] ?? productImageUrl(product)

  const [photo, setPhoto] = useState(0)
  const [picked, setPicked] = useState<PurchaseOption | null>(weights[0] ?? moneys[0] ?? null)
  const [customGrams, setCustomGrams] = useState<number | null>(null)
  const [customLabel, setCustomLabel] = useState<string>("")
  const [amount, setAmount] = useState("")
  const [amountUnit, setAmountUnit] = useState<AmountUnit>("gr")
  const [error, setError] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [descOpen, setDescOpen] = useState(false)

  // Selected grams (a custom amount wins over a pill) — null for unit-priced products.
  const grams = customGrams ?? (picked?.kind === "weight" ? (picked.weightGrams ?? null) : null)
  const isMoney = picked?.kind === "money" && customGrams == null

  const unitPrice = (() => {
    if (customGrams != null && rate != null) return rate * customGrams
    if (picked) return optionPrice(product, picked)
    return product.price ?? null
  })()
  const total = unitPrice != null ? unitPrice * qty : null

  /** "/ 500 g", " / 2 lb", " (≈ 1.67 lb)" — what the shown price refers to, in the unit the
   *  customer chose (never a bare gram conversion of what they typed). */
  const suffix = (() => {
    if (customGrams != null) return ` / ${customLabel}`
    if (isMoney && picked?.amount != null) {
      const g = gramsForMoney(product, picked.amount)
      return g ? ` (≈ ${formatInUnit(g, product.priceUnit)})` : ""
    }
    if (picked?.kind === "weight") return ` / ${optionLabel(picked)}`
    if (!weightPriced) return ` / ${optionLabel(picked ?? { kind: "unit" })}`
    return ""
  })()

  /** Label for the CURRENT selection line ("1 lb", "600 g", "0.17 lb"). */
  const selectionLabel = (() => {
    if (customGrams != null) return customLabel
    if (picked?.kind === "money" && picked.amount != null) {
      const g = gramsForMoney(product, picked.amount)
      return g ? formatInUnit(g, product.priceUnit) : fmtPrice(picked.amount)
    }
    if (picked?.kind === "weight") return optionLabel(picked)
    return qty > 1 ? `${qty} unidades` : "unidad"
  })()
  const selectionQty = weightPriced && qty > 1 ? ` × ${qty}` : ""

  /** Live price for the amount being typed, shown right under the input ("600 g = $7.92"). */
  const liveAmount = useMemo(() => {
    const v = parseFloat(amount.replace(",", "."))
    if (!Number.isFinite(v) || v <= 0) return null
    if (amountUnit === "$") {
      const g = gramsForMoney(product, v)
      return g ? `${fmtPrice(v)} = ${formatInUnit(g, product.priceUnit)}` : null
    }
    const g = v * (unitGrams(amountUnit) ?? 1)
    if (g < MIN_GRAMS || rate == null) return null
    return `${v} ${UNIT_GLYPH[amountUnit]} = ${fmtPrice(rate * g)}`
  }, [amount, amountUnit, product, rate])

  const benefits = (product.benefits ?? []).map((b) => b?.text?.trim()).filter(Boolean) as string[]
  const short = product.shortDescription?.trim() ?? ""
  const desc = product.description ?? ""
  const descLong = desc.length > 220
  // The drafted line usually OPENS the long description — showing both reads as duplicated text.
  const norm = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase()
  const shortDuplicatesDesc =
    short.length > 0 && norm(desc).startsWith(norm(short).slice(0, 40))

  /** Closing the Quick View resets it, so reopening starts from the default option again. */
  function handleOpenChange(next: boolean) {
    if (!next) {
      setPicked(weights[0] ?? moneys[0] ?? null)
      setCustomGrams(null)
      setCustomLabel("")
      setAmount("")
      setAmountUnit("gr")
      setError(null)
      setQty(1)
      setDescOpen(false)
      setPhoto(0)
    }
    onOpenChange(next)
  }

  function applyAmount() {
    const value = parseFloat(amount.replace(",", "."))
    if (!Number.isFinite(value) || value <= 0) {
      setError("Ingresa una cantidad válida.")
      return
    }
    if (amountUnit === "$") {
      const g = gramsForMoney(product, value)
      if (g != null && g < MIN_GRAMS) {
        setError(`Mínimo ${floorMoney != null ? fmtPrice(floorMoney) : `${MIN_GRAMS} g`} por pedido.`)
        return
      }
      setPicked({ kind: "money", amount: value })
      setCustomGrams(null)
      setCustomLabel("")
      setError(null)
      return
    }
    const g = value * (unitGrams(amountUnit) ?? 1)
    if (g < MIN_GRAMS) {
      setError(`Mínimo ${MIN_GRAMS} g por pedido.`)
      return
    }
    setCustomGrams(g)
    // Echo the customer's own input ("2 lb"), not its gram conversion.
    setCustomLabel(`${value} ${UNIT_GLYPH[amountUnit]}`)
    setPicked(null)
    setError(null)
  }

  const pill = (active: boolean) =>
    `py-2 rounded-xl text-xs border transition-all active:scale-95 text-center ${
      active
        ? "font-bold bg-primary border-[#e5ac00] text-on-primary shadow-xs"
        : "font-semibold bg-surface-container-low text-secondary border-[#ead7c3] hover:bg-surface-container hover:text-on-surface"
    }`

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent
        data-testid="product-modal"
        showCloseButton={false}
        className="sm:max-w-3xl w-[calc(100vw-1.5rem)] max-h-[95vh] overflow-y-auto rounded-3xl border border-outline-variant p-0 gap-0"
      >
        <div className="flex flex-col md:flex-row">
          {/* Left: image showcase */}
          <div className="md:w-1/2 relative bg-surface-container-low flex flex-col items-center justify-center p-5 sm:p-6 min-h-[240px] md:min-h-[520px]">
            <span className="absolute top-4 left-4 z-10 bg-surface-container-lowest/95 backdrop-blur text-[11px] font-bold text-deep-amber px-3 py-1 rounded-full shadow-xs uppercase tracking-wider">
              {product.category?.name ?? ""}
            </span>
            <button
              type="button"
              aria-label={`Añadir ${product.name} a favoritos`}
              aria-pressed={fav}
              onClick={toggleFav}
              className={`fav-toggle absolute bottom-4 left-4 z-10 w-9 h-9 rounded-full bg-surface-container-lowest/90 backdrop-blur flex items-center justify-center shadow-xs active:scale-90 transition-all ${
                fav ? "text-destructive" : "text-secondary hover:text-destructive"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{fav ? "favorite" : "favorite_border"}</span>
            </button>
            <div className="relative w-full max-w-[340px]">
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-sm bg-white p-2 flex items-center justify-center">
                {gallery.length ? (
                  <Image
                    src={gallery[photo] ?? gallery[0]}
                    alt={product.name}
                    width={680}
                    height={680}
                    data-testid="modal-image"
                    className="w-full h-full object-cover object-bottom rounded-xl"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">Sin foto</span>
                )}
              </div>

              {/* All product photos as a carousel (arrows + dots) when there is more than one. */}
              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Foto anterior"
                    onClick={() => setPhoto((i) => (i - 1 + gallery.length) % gallery.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur shadow-xs flex items-center justify-center text-on-surface hover:bg-surface-container active:scale-90 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    aria-label="Foto siguiente"
                    onClick={() => setPhoto((i) => (i + 1) % gallery.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur shadow-xs flex items-center justify-center text-on-surface hover:bg-surface-container active:scale-90 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                  <div
                    data-testid="modal-gallery-dots"
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-surface-container-lowest/85 backdrop-blur px-2 py-1 rounded-full"
                  >
                    {gallery.map((url, i) => (
                      <button
                        key={url}
                        type="button"
                        aria-label={`Foto ${i + 1}`}
                        aria-current={i === photo}
                        onClick={() => setPhoto(i)}
                        className={`h-1.5 rounded-full transition-all ${i === photo ? "w-4 bg-deep-amber" : "w-1.5 bg-outline-variant"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right: details, amount selector, add to cart */}
          <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between bg-surface-container-lowest">
            <div>
              <div className="flex items-center justify-between gap-4 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {product.category?.name ?? ""}
                </span>
                <DialogClose asChild>
                  <button
                    type="button"
                    aria-label="Cerrar"
                    className="shrink-0 w-9 h-9 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center active:scale-90 transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </DialogClose>
              </div>

              <DialogTitle className="font-headline text-2xl sm:text-3xl text-on-surface font-bold leading-tight mb-2">
                {product.name}
              </DialogTitle>

              {/* Radix warns (and screen readers suffer) when a dialog has no description: the dialog is
                  announced with a name but no context. Visually hidden, matching the privacy modal, because
                  the design has no room for a paragraph — but it still has to exist for assistive tech. */}
              <DialogDescription className="sr-only">
                {`Detalle de ${product.name}: fotos, precio y opciones de cantidad para añadirlo al carrito.`}
              </DialogDescription>

              {/* CANONICAL price — the fixed rate everything derives from, never changes */}
              <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                <span
                  data-testid="modal-canonical-price"
                  className="font-headline text-2xl sm:text-3xl font-bold text-foreground"
                >
                  {canonical ? canonical.split(" / ")[0] : "—"}
                </span>
                {canonical && (
                  <span className="text-xs font-semibold text-muted-foreground">/ {canonical.split(" / ")[1]}</span>
                )}
              </div>

              {/* CURRENT price for the chosen option (what the customer is actually buying) */}
              <div className="flex items-baseline gap-1.5 mb-3 flex-wrap">
                <span data-testid="modal-selection-label" className="text-xs font-semibold text-secondary">
                  {selectionLabel}
                  {selectionQty}
                </span>
                <span className="text-xs text-secondary">·</span>
                <span data-testid="modal-price" className="font-headline text-lg font-bold text-deep-amber">
                  {total != null ? fmtPrice(total) : "—"}
                </span>
              </div>

              {short && !shortDuplicatesDesc && (
                <p className="text-xs sm:text-sm text-secondary leading-relaxed mb-3">{short}</p>
              )}

              {desc && (
                <div className="mb-4">
                  <div
                    className={`text-xs sm:text-sm text-secondary leading-relaxed [&_p]:mb-1.5 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-0.5 ${
                      descLong && !descOpen ? "line-clamp-3" : ""
                    } ${descOpen ? "max-h-[240px] overflow-y-auto pr-1" : ""}`}
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

              {benefits.length > 0 && (
                <div className="bg-surface-container-low/80 border border-[#ead7c3] rounded-2xl p-3 mb-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface mb-2">
                    <span className="material-symbols-outlined text-[16px] text-deep-amber">verified</span>
                    Beneficios Clave
                  </div>
                  <ul className="flex flex-col gap-1.5 text-[11px] text-secondary font-medium">
                    {benefits.map((b, i) => (
                      <li key={b} className="flex items-center gap-2">
                        <span className="text-xs shrink-0">{["⚡", "❤️", "🛡️"][i] ?? "•"}</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {weightPriced ? (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary">Selecciona el peso:</span>
                    <span className="text-[11px] font-semibold text-deep-amber">Pesa exacta</span>
                  </div>
                  <div id="modal-gram-selector" data-testid="modal-gram-selector" className="grid grid-cols-4 gap-1.5">
                    {[...weights, ...moneys].map((o) => {
                      const active = customGrams == null && picked === o
                      return (
                        <button
                          key={o.id ?? `${o.kind}-${o.weightGrams ?? o.amount}`}
                          type="button"
                          onClick={() => {
                            setPicked(o)
                            setCustomGrams(null)
                            setError(null)
                          }}
                          className={pill(active)}
                        >
                          {optionLabel(o)}
                        </button>
                      )
                    })}
                  </div>

                  {/* Exact amount: weight (g/lb/kg) OR money ("$10 de almendras") */}
                  <div className="mt-3 pt-3 border-t border-[#ead7c3]/60">
                    <label htmlFor="custom-amount" className="block text-[11px] font-bold text-secondary mb-1.5">
                      Gramaje exacto:
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 min-w-0">
                        <input
                          id="custom-amount"
                          type="number"
                          inputMode="decimal"
                          min={amountUnit === "$" ? (floorMoney ?? 1) : amountUnit === "gr" ? MIN_GRAMS : 0.1}
                          step={amountUnit === "gr" ? 50 : amountUnit === "$" ? 1 : 0.5}
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && applyAmount()}
                          placeholder={amountUnit === "gr" ? "220" : amountUnit === "$" ? "10" : "0.5"}
                          className="w-full h-9 pl-3 pr-10 text-xs font-bold text-on-surface bg-surface border border-[#d3c5ab] rounded-xl outline-none focus:border-deep-amber focus:ring-1 focus:ring-deep-amber/30 transition-all"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-muted-foreground pointer-events-none">
                          {UNIT_GLYPH[amountUnit]}
                        </span>
                      </div>
                      <select
                        aria-label="Unidad del gramaje exacto"
                        value={amountUnit}
                        onChange={(e) => {
                          setAmountUnit(e.target.value as AmountUnit)
                          setAmount("")
                          setError(null)
                        }}
                        className="h-9 px-2 text-xs font-bold text-on-surface bg-surface border border-[#d3c5ab] rounded-xl focus:border-deep-amber outline-none"
                      >
                        <option value="gr">g</option>
                        <option value="lb">lb</option>
                        <option value="kg">kg</option>
                        <option value="$">$</option>
                      </select>
                      <button
                        type="button"
                        onClick={applyAmount}
                        className="h-9 px-3 rounded-xl bg-surface-container hover:bg-primary hover:text-on-primary border border-[#ead7c3] text-xs font-bold active:scale-95 transition-all whitespace-nowrap"
                      >
                        Aplicar
                      </button>
                    </div>
                    {error && (
                      <p role="alert" data-testid="modal-amount-error" className="mt-1.5 text-[11px] font-semibold text-destructive">
                        {error}
                      </p>
                    )}
                    {/* The price the typed amount computes to — shown right here, next to the input */}
                    {liveAmount && !error && (
                      <p data-testid="modal-live-amount" className="mt-1.5 text-right text-[11px] font-bold text-deep-amber">
                        {liveAmount}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-5">
                  <label htmlFor="unit-qty" className="text-xs font-bold uppercase tracking-wider text-secondary block mb-2">
                    ¿Cuántas unidades?
                  </label>
                  <input
                    id="unit-qty"
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-28 py-1.5 px-2.5 text-xs font-bold text-on-surface bg-surface border border-[#d3c5ab] rounded-xl focus:border-deep-amber outline-none"
                  />
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-surface-container-lowest pt-3 pb-1 -mx-6 sm:-mx-8 px-6 sm:px-8 border-t border-[#f3dfcb]/60">
              <div className="flex items-center gap-3 mb-4 mt-1">
                <div className="flex items-center border border-[#d3c5ab] rounded-2xl bg-surface p-1 shadow-2xs">
                  <button
                    type="button"
                    aria-label="Quitar una unidad"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-on-surface hover:bg-surface-container active:scale-90 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <span data-testid="modal-qty" className="w-9 text-center text-xs font-bold text-on-surface select-none">
                    {qty}
                  </span>
                  <button
                    type="button"
                    aria-label="Añadir una unidad"
                    onClick={() => setQty((q) => q + 1)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-on-surface hover:bg-surface-container active:scale-90 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
                <button
                  type="button"
                  data-testid="modal-add-to-cart"
                  onClick={() => {
                    // Adds the current selection (option, or the exact amount, × quantity).
                    addToCart({
                      productId: product.id,
                      slug: product.slug,
                      name: product.name,
                      image: img,
                      kind: customGrams != null ? "weight" : (picked?.kind ?? "unit"),
                      grams: customGrams ?? (picked?.kind === "weight" ? (picked.weightGrams ?? null) : null),
                      amount: picked?.kind === "money" && customGrams == null ? (picked.amount ?? null) : null,
                      label:
                        customGrams != null
                          ? formatGrams(customGrams)
                          : picked
                            ? optionLabel(picked)
                            : (canonical ?? "unidad"),
                      unitPrice: unitPrice ?? 0,
                      qty,
                    })
                    handleOpenChange(false)
                  }}
                  className="flex-1 py-3 px-5 rounded-2xl bg-foreground hover:bg-[#3a2e21] text-white text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md"
                >
                  <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                  Agregar a mi canasta
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#ead7c3]/60 text-center text-[10px] text-secondary font-medium">
                <span className="flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-deep-amber">local_shipping</span>
                  Envíos 24h
                </span>
                <span className="flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-deep-amber">eco</span>
                  Cero Plástico
                </span>
                <span className="flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-deep-amber">handshake</span>
                  Trato Justo
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
