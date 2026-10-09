export function Newsletter() {
  return (
    <section className="bg-foreground text-white relative overflow-hidden py-14">
      <div className="px-4 md:px-12 max-w-7xl mx-auto text-center">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-white mb-2">
          Sintoniza con nuestro ritmo
        </h2>
        <p className="text-white/80 text-base mb-6">
          Recibe novedades, recetas y ofertas de temporada directamente en tu correo.
        </p>
        <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            placeholder="tu@correo.com"
            aria-label="Correo electrónico"
            className="flex-1 rounded-xl px-4 py-3 bg-white text-foreground placeholder:text-muted-foreground outline-none border-2 border-transparent focus:border-primary"
          />
          <button
            type="submit"
            className="bg-primary text-foreground font-bold px-6 py-3 rounded-xl hover:bg-[#fabd00] active:scale-95 transition-all"
          >
            Suscribirme
          </button>
        </form>
      </div>
    </section>
  )
}
