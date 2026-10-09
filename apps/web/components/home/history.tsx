import Image from "next/image"

export function History() {
  return (
    <section className="py-20 bg-background overflow-hidden relative" id="nuestra-historia">
      <div className="px-4 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 text-primary font-bold mb-4">
            <div className="h-0.5 w-8 bg-primary" aria-hidden />
            <span className="uppercase tracking-wider text-xs font-bold">Filosofía de Marca</span>
          </div>
          <h2 className="font-headline text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            Estructura, origen y vida contemporánea
          </h2>
          <div className="space-y-4 text-base md:text-lg text-[#6c5b4f] leading-relaxed">
            <p>
              Wasi Granel redefine la experiencia del alimento a granel desde una mirada urbana y
              ordenada. Inspirados en el ritmo y la continuidad de la matriz gráfica Puruhá,
              transformamos el acto cotidiano de abastecerse en una experiencia limpia, eficiente y
              en armonía con tu espacio.
            </p>
            <p>Solo lo que necesitas, con la más alta calidad, frescura y trazabilidad de origen.</p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 md:gap-6">
            <div className="p-6 bg-white rounded-2xl border-2 border-[#ffebd6] shadow-sm hover:border-primary hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="font-headline text-3xl md:text-4xl font-bold text-primary mb-1">100%</div>
              <div className="text-sm font-semibold text-foreground">Sin empaques innecesarios</div>
            </div>
            <div className="p-6 bg-white rounded-2xl border-2 border-[#ffebd6] shadow-sm hover:border-primary hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="font-headline text-3xl md:text-4xl font-bold text-primary mb-1">50+</div>
              <div className="text-sm font-semibold text-foreground">Orígenes seleccionados</div>
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2 relative">
          <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-white">
            <div className="w-full aspect-[4/3] lg:aspect-square overflow-hidden rounded-2xl group">
              <Image
                src="/images/store-interior.jpg"
                alt="Interior moderno de tienda a granel Wasi Granel"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width:1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
