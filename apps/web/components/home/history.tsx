import Image from "next/image"
import { Reveal } from "@/components/home/reveal"

export function History() {
  return (
    <section className="py-20 bg-background overflow-hidden relative" id="nuestra-historia">
      <div className="px-4 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <Reveal className="order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 text-deep-amber font-bold mb-4">
            <div className="h-0.5 w-8 bg-deep-amber" aria-hidden />
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
              <div className="font-headline text-3xl md:text-4xl font-bold text-deep-amber mb-1">100%</div>
              <div className="text-sm font-semibold text-foreground">Sin empaques innecesarios</div>
            </div>
            <div className="p-6 bg-white rounded-2xl border-2 border-[#ffebd6] shadow-sm hover:border-primary hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="font-headline text-3xl md:text-4xl font-bold text-deep-amber mb-1">50+</div>
              <div className="text-sm font-semibold text-foreground">Orígenes seleccionados</div>
            </div>
          </div>
        </Reveal>

        <Reveal className="order-1 lg:order-2 relative">
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
            {/* Floating "visítanos" badge */}
            <div className="animate-float absolute -bottom-6 -left-6 bg-primary text-foreground border-2 border-white shadow-xl p-5 rounded-2xl hidden md:flex items-center gap-3.5 hover:scale-105 transition-transform duration-200">
              <div className="w-12 h-12 rounded-xl bg-foreground text-primary flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[26px]">store</span>
              </div>
              <div>
                <div className="font-bold text-foreground text-sm font-headline">Visítanos en Riobamba</div>
                <div className="text-xs text-foreground/80 font-medium">Experiencia a granel local</div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
