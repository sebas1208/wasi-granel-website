const MOBILE = [
  { icon: "scale", label: "Al peso exacto", sub: "Cero desperdicio" },
  { icon: "recycling", label: "100% Compostable", sub: "O reutilizable" },
  { icon: "terrain", label: "Origen Andino", sub: "Trazable directo" },
]

const DESKTOP = [
  { icon: "scale", label: "Compra al peso exacto" },
  { icon: "recycling", label: "Empaque 100% compostable o reutilizable" },
  { icon: "terrain", label: "Trazabilidad andina directa" },
]

export function Benefits() {
  return (
    <section className="border-y border-[#ead7c3] bg-white py-3 lg:py-4 relative z-20">
      {/* mobile: 3 compact cards (Stitch Inicio Móvil) */}
      <div className="lg:hidden max-w-7xl mx-auto px-4 grid grid-cols-3 gap-2" data-testid="benefits-mobile">
        {MOBILE.map(({ icon, label, sub }) => (
          <div
            key={label}
            className="bg-[#fff1e5] p-3 rounded-lg flex flex-col items-center text-center gap-1 shadow-sm"
          >
            <span className="w-8 h-8 rounded-full bg-primary text-foreground flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">{icon}</span>
            </span>
            <span className="text-[11px] font-bold text-foreground leading-tight">{label}</span>
            <span className="text-[9px] text-muted-foreground leading-none">{sub}</span>
          </div>
        ))}
      </div>

      {/* desktop: horizontal bar (Stitch Variante 2) */}
      <div className="hidden lg:flex max-w-7xl mx-auto px-12 flex-wrap items-center justify-around gap-6 text-foreground text-sm font-semibold" data-testid="benefits-desktop">
        {DESKTOP.map(({ icon, label }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#ffebd6] text-deep-amber flex items-center justify-center border border-[#d3c5ab]/60">
              <span className="material-symbols-outlined text-[18px]">{icon}</span>
            </div>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
