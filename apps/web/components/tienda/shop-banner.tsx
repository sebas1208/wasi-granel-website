import Image from "next/image"

/**
 * Static shop banner (Stitch). Pure markup — no data, no interactivity — so it can be
 * rendered by the server component AND by the route's loading state. Rendering the real
 * banner in both keeps the title/description in the initial HTML (no skeleton flash) and
 * avoids the vertical shift a differently-sized skeleton caused.
 */
export function ShopBanner() {
  return (
    <section
      data-testid="shop-banner"
      className="w-full relative overflow-hidden bg-surface-container-low border-b border-[#ead7c3] pt-28 pb-12 px-4 sm:px-6 lg:px-8 mb-8"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative">
        {/* Watermark logo bottom-right */}
        <div className="absolute -right-12 -bottom-16 pointer-events-none select-none opacity-10 hidden md:block">
          <Image src="/logo.svg" alt="" width={400} height={189} className="h-72 w-auto object-contain" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-deep-amber/10 text-deep-amber text-xs font-bold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-deep-amber animate-pulse" />
            Tienda Oficial Wasi Granel
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl text-on-surface font-bold leading-tight mb-3">
            Despensa Consciente a Granel
          </h1>
          <p className="text-sm sm:text-base text-secondary font-medium leading-relaxed max-w-xl">
            Alimentos puros, sin intermediarios y al peso exacto. Reduce desperdicios, cuida tu bolsillo y honra el
            origen de cada ingrediente.
          </p>
        </div>
      </div>
    </section>
  )
}