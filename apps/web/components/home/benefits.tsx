import type { InicioCopy } from "@/lib/site-copy"

/**
 * The benefits bar. Both variants render the SAME list now (ticket 19): the CMS holds one array of
 * { icon, label, sub } and mobile shows the second line while desktop does not. Previously the copy was
 * duplicated across a MOBILE and a DESKTOP constant, which is how the two drift apart.
 */
export function Benefits({ copy }: { copy: InicioCopy["benefits"] }) {
  return (
    <section className="border-y border-[#ead7c3] bg-white py-3 lg:py-4 relative z-20">
      {/* mobile: 3 compact cards (Stitch Inicio Móvil) */}
      <div className="lg:hidden max-w-7xl mx-auto px-4 grid grid-cols-3 gap-2" data-testid="benefits-mobile">
        {copy.map(({ icon, label, sub }) => (
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

      {/* desktop: horizontal bar (Stitch Variante 2) — label only */}
      <div className="hidden lg:flex max-w-7xl mx-auto px-12 flex-wrap items-center justify-around gap-6 text-foreground text-sm font-semibold" data-testid="benefits-desktop">
        {copy.map(({ icon, label }) => (
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
