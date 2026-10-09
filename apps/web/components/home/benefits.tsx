const ITEMS = [
  { icon: "scale", label: "Compra al peso exacto" },
  { icon: "recycling", label: "Empaque 100% compostable o reutilizable" },
  { icon: "terrain", label: "Trazabilidad andina directa" },
]

export function Benefits() {
  return (
    <section className="border-y border-[#ead7c3] bg-white py-4 shadow-xs relative z-20">
      <div className="max-w-7xl mx-auto px-4 md:px-12 flex flex-wrap items-center justify-around gap-6 text-foreground text-sm font-semibold">
        {ITEMS.map(({ icon, label }) => (
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
