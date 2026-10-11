"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { priceDisplay, productImageUrl, type Product } from "@/lib/payload"

export function PopularProducts({ products }: { products: Product[] }) {
  const [api, setApi] = useState<CarouselApi>()
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  useEffect(() => {
    if (!api) return
    const update = () => {
      setCanPrev(api.canScrollPrev())
      setCanNext(api.canScrollNext())
    }
    update()
    api.on("select", update)
    api.on("reInit", update)
    return () => {
      api.off("select", update)
      api.off("reInit", update)
    }
  }, [api])

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
              className="hidden sm:inline-flex items-center gap-1.5 text-primary hover:text-white transition-colors font-semibold text-sm group"
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
                onClick={() => api?.scrollPrev()}
                disabled={!canPrev}
                className="w-9 h-9 rounded-full bg-[#695c50] hover:bg-primary hover:text-foreground active:scale-90 border border-[#817660] text-white flex items-center justify-center transition-all duration-200 shadow-sm disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button
                type="button"
                aria-label="Producto siguiente"
                onClick={() => api?.scrollNext()}
                disabled={!canNext}
                className="w-9 h-9 rounded-full bg-[#695c50] hover:bg-primary hover:text-foreground active:scale-90 border border-[#817660] text-white flex items-center justify-center transition-all duration-200 shadow-sm disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        <Carousel setApi={setApi}>
          <CarouselContent className="-ml-4">
            {products.map((p, i) => {
              const img = productImageUrl(p)
              const price = priceDisplay(p)
              return (
                <CarouselItem
                  key={p.id}
                  aria-label={`${p.name} — producto ${i + 1} de ${products.length}`}
                  className="basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/5 pl-4"
                >
                  <div className="bg-white border border-[#ead7c3] rounded-2xl p-3.5 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer h-full">
                    <div className="aspect-square rounded-xl overflow-hidden relative bg-[#fff1e5] mb-3">
                      {img ? (
                        <Image
                          src={img}
                          alt={p.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width:640px) 85vw, (max-width:768px) 50vw, (max-width:1024px) 33vw, 20vw"
                        />
                      ) : (
                        <span className="flex items-center justify-center h-full text-xs text-muted-foreground">
                          Sin foto
                        </span>
                      )}
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[11px] font-bold text-deep-amber px-2.5 py-1 rounded-full shadow-sm">
                        {p.category?.name}
                      </span>
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
                </CarouselItem>
              )
            })}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  )
}