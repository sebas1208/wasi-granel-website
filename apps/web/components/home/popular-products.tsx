"use client"

import Image from "next/image"
import { useState } from "react"
import { priceDisplay, productImageUrl, type Product } from "@/lib/payload"

const CARD_STEP = 260 // card width (240) + gap (20)

export function PopularProducts({ products }: { products: Product[] }) {
  const [index, setIndex] = useState(0)
  const max = Math.max(0, products.length - 1)
  const prev = () => setIndex((i) => Math.max(0, i - 1))
  const next = () => setIndex((i) => Math.min(max, i + 1))

  return (
    <section className="py-16 bg-foreground text-white relative overflow-hidden">
      <div className="px-4 md:px-12 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-row items-center justify-between mb-8 gap-4">
          <h2 className="font-headline text-2xl md:text-4xl font-bold text-white leading-tight">
            Productos Populares
          </h2>
          <div className="flex items-center gap-4">
            <a
              href="/tienda"
              className="inline-flex items-center gap-1.5 text-primary hover:text-white transition-colors font-semibold text-sm group"
            >
              Ver todos
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1.5 transition-transform">
                arrow_forward
              </span>
            </a>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                aria-label="Producto anterior"
                onClick={prev}
                disabled={index === 0}
                className="w-9 h-9 rounded-full bg-[#695c50] hover:bg-primary hover:text-foreground active:scale-90 border border-[#817660] text-white flex items-center justify-center transition-all duration-200 shadow-sm disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button
                type="button"
                aria-label="Producto siguiente"
                onClick={next}
                disabled={index >= max}
                className="w-9 h-9 rounded-full bg-[#695c50] hover:bg-primary hover:text-foreground active:scale-90 border border-[#817660] text-white flex items-center justify-center transition-all duration-200 shadow-sm disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden py-2 -my-2">
          <div
            className="flex gap-5 transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${index * CARD_STEP}px)` }}
          >
            {products.map((p) => {
              const img = productImageUrl(p)
              const price = priceDisplay(p)
              return (
                <div
                  key={p.id}
                  className="w-[240px] md:w-[20%] flex-shrink-0 bg-white border border-[#ead7c3] rounded-2xl p-3.5 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer"
                >
                  <div className="aspect-square rounded-xl overflow-hidden relative bg-[#fff1e5] mb-3">
                    {img ? (
                      <Image
                        src={img}
                        alt={p.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="240px"
                      />
                    ) : (
                      <span className="flex items-center justify-center h-full text-xs text-muted-foreground">
                        Sin foto
                      </span>
                    )}
                    {/* category chip (top-left) */}
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[11px] font-bold text-deep-amber px-2.5 py-1 rounded-full shadow-sm">
                      {p.category?.name}
                    </span>
                    {/* favourite (top-right) */}
                    <button
                      type="button"
                      aria-label="Añadir a favoritos"
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 text-foreground hover:text-red-500 flex items-center justify-center shadow-sm active:scale-90"
                    >
                      <span className="material-symbols-outlined text-[16px]">favorite</span>
                    </button>
                  </div>
                  <div className="flex flex-col flex-grow">
                    <span className="text-deep-amber font-bold text-xs uppercase tracking-wider">
                      {p.category?.name}
                    </span>
                    <h3 className="text-foreground font-bold text-sm leading-snug mt-0.5 mb-2 line-clamp-2">
                      {p.name}
                    </h3>
                    <div className="mt-auto pt-2.5 border-t border-[#f3dfcb] flex items-center justify-between">
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-base font-bold text-deep-amber">{price.amount}</span>
                        <span className="text-[#6c5b4f] text-xs">{price.suffix}</span>
                      </div>
                      <button
                        type="button"
                        aria-label="Añadir al carrito"
                        className="w-8 h-8 rounded-lg bg-primary text-foreground flex items-center justify-center hover:bg-[#fabd00] active:scale-90 hover:shadow-md transition-all duration-200 shadow-sm group/btn"
                      >
                        <span className="material-symbols-outlined text-[18px] group-hover/btn:rotate-12 transition-transform duration-200">
                          add_shopping_cart
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
