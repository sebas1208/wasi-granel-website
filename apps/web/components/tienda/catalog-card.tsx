"use client"

import { useState } from "react"
import Image from "next/image"
import Markdown from "react-markdown"
import { WeightModal } from "./weight-modal"
import { useFavorite } from "@/lib/favorites"
import { optionPrice, productImageUrl, priceDisplay, type Product, type PurchaseOption } from "@/lib/payload"

/** Stitch Catalog Card: image w/ overlay chip + favorite, name, portion chips (+ customize), Porción/price/Agregar. */
export function CatalogCard({ product }: { product: Product }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [fav, toggleFav] = useFavorite(product.id)
  const [tier, setTier] = useState<PurchaseOption | null>(null)
  const img = productImageUrl(product)
  const base = priceDisplay(product)

  const toggleFavClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFav()
  }

  const tiers = (product.purchaseOptions ?? [])
    .filter((o) => o.kind === "weight" && o.weightGrams)
    .sort((a, b) => (a.weightGrams ?? 0) - (b.weightGrams ?? 0))
  const unitOpts = (product.purchaseOptions ?? []).filter((o) => o.kind === "unit")
  const isUnitOnly = tiers.length === 0 && unitOpts.length > 0

  const fmtG = (g: number) => (g >= 1000 ? `${g / 1000}kg` : `${g}g`)
  const tierPrice = tier ? optionPrice(product, tier) : null
  const shownPrice = tierPrice != null ? `$${tierPrice.toFixed(2)}` : base.amount
  const portionLabel = tier ? fmtG(tier.weightGrams!) : isUnitOnly ? "Unidad" : "Porción"
  const portionSuffix = tier ? `/${fmtG(tier.weightGrams!)}` : base.suffix

  // chip contrast: active = brand yellow, inactive = bordered (distinguishable from white card)
  const portionBtn = (active: boolean) =>
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
        {/* Image + overlay category chip + favorite */}
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

        {/* Name + description + portion chips (with customize in the same row) */}
        <div className="p-5">
          <h3 className="font-headline font-bold text-base text-on-surface group-hover:text-deep-amber transition-colors leading-snug mb-1">
            {product.name}
          </h3>
          {product.description && (
            <div className="text-xs text-secondary mb-3 line-clamp-2 [&_p]:m-0 [&_ul]:list-disc [&_ul]:pl-3">
              <Markdown>{product.description}</Markdown>
            </div>
          )}

          <div role="group" aria-label="Opciones de peso" className="flex flex-wrap items-center gap-1.5 mb-4">
            {tiers.map((t, ti) => (
              <button
                key={t.id ?? `t${ti}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setTier(tier?.id === t.id ? null : t)
                }}
                className={portionBtn(tier?.weightGrams === t.weightGrams)}
              >
                {fmtG(t.weightGrams!)}
              </button>
            ))}
            {isUnitOnly && (
              <span className="text-[11px] font-medium text-secondary">Unidad: {unitOpts[0]?.label ?? "pieza"}</span>
            )}
            {/* Customize icon — same row as the weight options */}
            <button
              type="button"
              aria-label={`Personalizar peso de ${product.name}`}
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

      {/* Footer: Porción/price + Agregar (icon-only on mobile) */}
      <div className="px-5 pb-5 pt-4 border-t border-[#f3dfcb]/60 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-muted-foreground block leading-none font-medium">{portionLabel}</span>
          <span className="item-price font-headline text-lg font-bold text-foreground transition-all duration-200">
            {shownPrice}
            <span className="text-[11px] font-semibold text-muted-foreground font-body">{portionSuffix}</span>
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