import { Scale, Recycle, Mountain } from "lucide-react"

const ITEMS = [
  { icon: Scale, label: "Compra al peso exacto" },
  { icon: Recycle, label: "Empaque 100% compostable o reutilizable" },
  { icon: Mountain, label: "Trazabilidad andina directa" },
]

export function Benefits() {
  return (
    <section className="border-y border-[#ead7c3] bg-white py-4 shadow-xs relative z-20">
      <div className="max-w-7xl mx-auto px-4 md:px-12 flex flex-wrap items-center justify-around gap-6 text-foreground text-sm font-semibold">
        {ITEMS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#ffebd6] text-primary flex items-center justify-center border border-[#d3c5ab]/60">
              <Icon className="h-4 w-4" aria-hidden />
            </div>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
