import Image from "next/image"

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-background">
      {/* Store interior: full-bleed behind on lg+, top block with a bottom scrim on mobile */}
      <div className="relative w-full h-[460px] lg:absolute lg:inset-0 lg:h-full overflow-hidden">
        <Image
          src="/images/hero-store-v1.jpg"
          alt="Interior de la tienda a granel Wasi Granel: frutos secos, semillas y especias en frascos"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-left"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent lg:hidden"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto lg:px-12">
        <div className="lg:min-h-[720px] lg:flex lg:items-center lg:pt-32 lg:pb-16">
          <div className="w-full lg:max-w-xl lg:ml-auto">
            <div className="relative -mt-36 lg:mt-0 mb-6 lg:mb-0 mx-4 md:mx-8 lg:mx-0 bg-white/95 lg:bg-white backdrop-blur-xl border border-[#ead7c3] p-5 md:p-8 lg:p-10 rounded-xl lg:rounded-3xl shadow-2xl shadow-foreground/15" data-testid="hero-card">
              <div className="animate-fade-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ffebd6] border border-[#d3c5ab] text-deep-amber font-bold text-xs uppercase tracking-wider mb-4 hover:scale-105 transition-transform duration-200 cursor-default shadow-xs">
                <span className="material-symbols-outlined text-sm text-deep-amber">location_on</span>
                <span>Riobamba, Ecuador</span>
              </div>
              <div className="animate-fade-up [animation-delay:90ms] text-deep-amber font-bold mb-2 block text-xs uppercase tracking-widest">
                Frutos secos · Semillas · Granos · Gourmet
              </div>
              <h1 className="animate-fade-up [animation-delay:170ms] font-headline text-2xl sm:text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                Equilibrio para tu despensa
              </h1>
              <p className="animate-fade-up [animation-delay:250ms] text-sm md:text-base lg:text-lg text-[#6c5b4f] mb-6 md:mb-8 leading-relaxed">
                Compra la cantidad exacta que necesitas — siempre fresco, con la mejor calidad.
              </p>
              <div className="animate-fade-up [animation-delay:330ms] flex flex-col sm:flex-row flex-wrap gap-2.5 lg:gap-4">
                <a
                  href="/tienda"
                  className="btn-shimmer w-full sm:w-auto shrink-0 whitespace-nowrap inline-flex items-center justify-center bg-primary text-foreground font-bold px-7 py-3.5 rounded-xl hover:bg-[#fabd00] hover:shadow-lg active:scale-95 transition-all duration-200 shadow-md gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">storefront</span>
                  Explorar Tienda
                </a>
                <a
                  href="/contacto"
                  className="w-full sm:w-auto shrink-0 whitespace-nowrap inline-flex items-center justify-center border-2 border-foreground/20 text-foreground bg-background hover:bg-[#f3dfcb] hover:border-foreground/40 active:scale-95 font-bold px-7 py-3.5 rounded-xl transition-all duration-200 gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">storefront</span>
                  Nuestra Historia
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}