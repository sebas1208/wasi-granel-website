import Image from "next/image"
import { ArrowRight, Heart, ShoppingCart } from "lucide-react"
import { priceDisplay, productImageUrl, type Product } from "@/lib/payload"

export function PopularProducts({ products }: { products: Product[] }) {
  return (
    <section className="py-16 bg-foreground text-white relative overflow-hidden">
      <div className="px-4 md:px-12 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-row items-center justify-between mb-8 gap-4">
          <h2 className="font-headline text-2xl md:text-4xl font-bold text-white leading-tight">
            Productos Populares
          </h2>
          <a
            href="/tienda"
            className="inline-flex items-center gap-1.5 text-primary hover:text-white transition-colors font-semibold text-sm group"
          >
            Ver todos
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" aria-hidden />
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.map((p) => {
            const img = productImageUrl(p)
            const price = priceDisplay(p)
            return (
              <div
                key={p.id}
                className="bg-white border border-[#ead7c3] rounded-2xl p-3.5 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer"
              >
                <div className="aspect-square rounded-xl overflow-hidden relative bg-[#fff1e5] mb-3">
                  {img ? (
                    <Image
                      src={img}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width:768px) 50vw, 16vw"
                    />
                  ) : (
                    <span className="flex items-center justify-center h-full text-xs text-muted-foreground">
                      Sin foto
                    </span>
                  )}
                  <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white border border-[#ead7c3] flex items-center justify-center text-foreground hover:text-red-500 transition-colors z-10">
                    <Heart className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </div>
                <div className="flex flex-col flex-grow">
                  <span className="text-primary font-bold text-xs uppercase tracking-wider">
                    {p.category?.name}
                  </span>
                  <h3 className="text-foreground font-bold text-sm leading-snug mt-0.5 mb-2 line-clamp-2">
                    {p.name}
                  </h3>
                  <div className="mt-auto pt-2.5 border-t border-[#f3dfcb] flex items-center justify-between">
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-base font-bold text-primary">{price.amount}</span>
                      <span className="text-[#6c5b4f] text-xs">{price.suffix}</span>
                    </div>
                    <span className="w-8 h-8 rounded-lg bg-primary text-foreground flex items-center justify-center hover:bg-[#fabd00] active:scale-90 transition-all shadow-sm">
                      <ShoppingCart className="h-4 w-4" aria-hidden />
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
