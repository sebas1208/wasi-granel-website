import Image from "next/image"

export function Hero() {
  return (
    <section className="relative w-full min-h-[620px] lg:min-h-[720px] flex items-center pt-32 pb-16 overflow-hidden bg-background">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src="/images/hero-chimborazo.jpg"
          alt="Volcán Chimborazo en alta resolución al amanecer"
          fill
          priority
          sizes="100vw"
          className="object-cover animate-hero-bg will-change-transform"
          style={{ objectPosition: "left center" }}
        />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-12 w-full flex justify-end">
        <div className="w-full lg:max-w-xl">
          <div className="bg-white border border-[#ead7c3] p-8 md:p-10 rounded-3xl shadow-2xl shadow-foreground/15 hover:shadow-2xl transition-shadow duration-300">
            <div className="animate-fade-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ffebd6] border border-[#d3c5ab] text-deep-amber font-bold text-xs uppercase tracking-wider mb-4 hover:scale-105 transition-transform duration-200 cursor-default shadow-xs">
              <span className="material-symbols-outlined text-sm text-deep-amber">location_on</span>
              <span>Riobamba, Ecuador</span>
            </div>
            <div className="animate-fade-up [animation-delay:90ms] text-deep-amber font-bold mb-2 block text-xs uppercase tracking-widest">
              Despensa urbana y consciente
            </div>
            <h1 className="animate-fade-up [animation-delay:170ms] font-headline text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              Equilibrio en movimiento
            </h1>
            <p className="animate-fade-up [animation-delay:250ms] text-base md:text-lg text-[#6c5b4f] mb-8 leading-relaxed">
              Selección contemporánea de frutos secos, semillas y granos al peso exacto. Diseñado para
              integrarse a tu rutina diaria con orden, frescura y sin excesos innecesarios.
            </p>
            <div className="animate-fade-up [animation-delay:330ms] flex flex-wrap items-center gap-4">
              <a
                href="/tienda"
                className="btn-shimmer inline-flex items-center justify-center bg-primary text-foreground font-bold px-7 py-3.5 rounded-xl hover:bg-[#fabd00] hover:shadow-lg active:scale-95 transition-all duration-200 shadow-md gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">storefront</span>
                Explorar Tienda
              </a>
              <a
                href="#nuestra-historia"
                className="inline-flex items-center justify-center border-2 border-foreground/20 text-foreground bg-background hover:bg-[#f3dfcb] hover:border-foreground/40 active:scale-95 font-bold px-7 py-3.5 rounded-xl transition-all duration-200 gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">nature_people</span>
                Nuestra Filosofía
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
