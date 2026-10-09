import { Reveal } from "@/components/home/reveal"

export function Newsletter() {
  return (
    <section className="bg-foreground text-white relative overflow-hidden py-14">
      <div className="px-4 md:px-12 max-w-7xl mx-auto relative z-10">
        <Reveal className="bg-[#695c50] border-2 border-[#817660] rounded-3xl p-8 md:py-10 md:px-12 shadow-xl text-center max-w-3xl mx-auto hover:shadow-2xl transition-all duration-300">
          <div className="animate-soft-pulse w-12 h-12 rounded-full bg-primary text-foreground mx-auto flex items-center justify-center mb-4 shadow-sm">
            <span className="material-symbols-outlined text-[24px]">mark_email_read</span>
          </div>
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-white mb-2">
            Sintoniza con nuestro ritmo
          </h2>
          <p className="text-[#f5dece] text-sm md:text-base mb-6 max-w-lg mx-auto leading-relaxed">
            Actualizaciones curadas sobre nuevos ingresos, proporciones ideales de nutrición diaria y
            beneficios exclusivos para compras a granel.
          </p>
          <form className="flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto">
            <input
              type="email"
              required
              aria-label="Correo electrónico"
              placeholder="Tu correo electrónico..."
              className="w-full px-5 py-3.5 rounded-xl bg-white border-2 border-transparent text-foreground placeholder:text-neutral-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 text-sm shadow-inner transition-all duration-200"
            />
            <button
              type="submit"
              className="btn-shimmer w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-[#fabd00] active:scale-95 text-foreground font-bold text-sm rounded-xl transition-all duration-200 shadow-md whitespace-nowrap"
            >
              Unirme a la comunidad
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  )
}
