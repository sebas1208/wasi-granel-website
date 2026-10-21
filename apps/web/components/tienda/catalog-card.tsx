"use client"

import { useState } from "react"
import Image from "next/image"
import { WeightModal } from "./weight-modal"
import { useFavorite } from "@/lib/favorites"
import {
  canonicalRateLabel,
  fmtPrice,
  hasWeightPricing,
  optionLabel,
  optionPrice,
  productImageUrl,
  productOptions,
  type Product,
  type PurchaseOption,
} from "@/lib/payload"

/**
 * Stitch catalog card: image with the category chip + favourite, name, the short marketing line,
 * the purchase-option chips (with the customise icon in the same row) and a footer showing the price
 * — the CANONICAL rate ($/lb) until an option is picked, then that option's price.
 *
 * The chips come from the product's own options (CMS data), deduped; the long description stays in
 * the Quick View so the card keeps its shape.
 */
function cardCopy(p: Product): string {
  const short = p.shortDescription?.trim()
  if (short) return short
  // Fallback for products without a drafted line: first sentence of the long description, cleaned.
  const clean = (p.description ?? "").replace(/[#*_>`]/g, "").replace(/\s+/g, " ").trim()
  if (!clean) return ""
  const first = clean.split(/(?<=[.:;])\s/)[0] ?? clean
  return first.length > 120 ? `${first.slice(0, 117).trimEnd()}…` : first
}

export function CatalogCard({ product }: { product: Product }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [fav, toggleFav] = useFavorite(product.id)
  const [picked, setPicked] = useState<PurchaseOption | null>(null)
  const img = productImageUrl(product)
  const weightPriced = hasWeightPricing(product)
  const options = productOptions(product).filter((o) => o.kind !== "unit")
  const canonical = canonicalRateLabel(product)
  const copy = cardCopy(product)

  const toggleFavClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFav()
  }

  // Footer: the picked option's price, else the canonical rate ("$5.99 / lb") — the canonical
  // price and its unit are always visible on the store.
  const pickedPrice = picked ? optionPrice(product, picked) : null
  const footerLabel = picked ? optionLabel(picked) : weightPriced ? "Precio" : "Unidad"
  const footerAmount = pickedPrice != null ? fmtPrice(pickedPrice) : (canonical?.split(" / ")[0] ?? "")
  const footerSuffix = picked
    ? ""
    : canonical
      ? ` / ${canonical.split(" / ")[1]}`
      : ""

  const chip = (active: boolean) =>
    `text-[11px] px-2 py-1 rounded-lg border transition-all duration-200 active:scale-95 ${
      active
        ? "font-bold bg-primary border-[#e5ac00] text-on-primary shadow-xs"
        : "font-medium bg-background border-outline-variant/60 text-secondary hover:bg-surface-container-low hover:text-on-surface"
    }`

  return (
    <>
      <article
        data-testid="catalog-card"
        onClick={() => setModalOpen(true)}
        className="product-item group bg-surface-container-lowest border border-[#ead7c3] rounded-3xl overflow-hidden shadow-xs hover:border-deep-amber/40 flex flex-col justify-between transition-colors cursor-pointer"
      >
        <div>
          {/* Image + category chip + favourite */}
          <div className="relative aspect-square overflow-hidden bg-surface-container-low">
            {img ? (
              <Image
                src={img}
                alt={product.name}
                fill
                sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            ) : (
              <span className="flex items-center justify-center h-full text-xs text-muted-foreground">Sin foto</span>
            )}
            <span className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur text-[11px] font-bold text-deep-amber px-2.5 py-1 rounded-full shadow-xs">
              {product.category?.name ?? ""}
            </span>
            <button
              type="button"
              aria-label={`Añadir ${product.name} a favoritos`}
              aria-pressed={fav}
              onClick={toggleFavClick}
              className={`fav-toggle absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-lowest/95 backdrop-blur flex items-center justify-center shadow-xs active:scale-90 transition-all ${
                fav ? "text-destructive" : "text-secondary hover:text-destructive"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{fav ? "favorite" : "favorite_border"}</span>
            </button>
            {product.inStock === false && (
              <span className="absolute inset-0 bg-white/70 flex items-center justify-center text-sm font-bold text-muted-foreground">
                Agotado
              </span>
            )}
          </div>

          {/* Name + short copy + option chips (customise icon in the same row) */}
          <div className="p-5">
            <h3 className="font-headline font-bold text-base text-on-surface group-hover:text-deep-amber transition-colors leading-snug mb-1">
              {product.name}
            </h3>
            {copy && <p className="text-xs text-secondary mb-3 line-clamp-2">{copy}</p>}

            <div role="group" aria-label="Opciones de compra" className="flex flex-wrap items-center gap-1.5 mb-1">
              {options.map((o) => (
                <button
                  key={o.id ?? `${o.kind}-${o.weightGrams ?? o.amount}`}
                  type="button"
                  aria-pressed={picked === o}
                  onClick={(e) => {
                    e.stopPropagation()
                    setPicked(picked === o ? null : o)
                  }}
                  className={chip(picked === o)}
                >
                  {optionLabel(o)}
                </button>
              ))}
              {/* Customise — same row as the options, opens the Quick View */}
              <button
                type="button"
                aria-label={`Personalizar ${product.name}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setModalOpen(true)
                }}
                className="ml-auto w-7 h-7 shrink-0 rounded-lg border border-outline-variant/60 bg-background text-deep-amber hover:bg-surface-container active:scale-90 transition-all flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[15px]">tune</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer: option price or the canonical rate + Agregar (icon-only on mobile) */}
        <div className="px-5 pb-5 pt-4 border-t border-[#f3dfcb]/60 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-muted-foreground block leading-none font-medium">{footerLabel}</span>
            <span
              data-testid="card-price"
              className="item-price font-headline text-lg font-bold text-foreground transition-all duration-200"
            >
              {footerAmount}
              <span className="text-[11px] font-semibold text-muted-foreground font-body">{footerSuffix}</span>
            </span>
          </div>
          <button
            type="button"
            aria-label={`Agregar ${product.name}`}
            disabled={product.inStock === false}
            onClick={(e) => {
              e.stopPropagation()
              setModalOpen(true)
            }}
            className="cart-add-btn bg-foreground hover:bg-[#3a2e21] text-white p-2.5 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold group/btn disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px] group-hover/btn:rotate-12 transition-transform duration-200">
              shopping_bag
            </span>
            <span className="hidden sm:inline">Agregar</span>
          </button>
        </div>
      </article>

      <WeightModal product={product} open={modalOpen} onOpenChange={setModalOpen} trigger={<span className="hidden" />} />
    </>
  )
}
