import type { Category } from "@/lib/payload"
import { Reveal } from "@/components/home/reveal"

const CATEGORY_ICONS: Record<string, string> = {
  "frutos-secos": "nutrition",
  "semillas-granos": "spa",
  "frutas-deshidratadas": "local_florist",
  "cacao-chocolates": "cookie",
  "harinas-cereales": "grain",
  "especias-hierbas": "energy_savings_leaf",
  "legumbres-menestras": "potted_plant",
  endulzantes: "hive",
  "aceites-aceitunas": "oil_barrel",
  "infusiones-tes": "local_cafe",
  "ajies-ajos": "local_fire_department",
  otros: "inventory_2",
}

export type CategoryWithCount = Category & { count: number }

export function CategoryGrid({ categories }: { categories: CategoryWithCount[] }) {
  return (
    <section className="py-20 bg-[#fff1e5]/60 border-b border-[#ead7c3] relative overflow-hidden" id="categorias">
      <div className="px-4 md:px-12 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-deep-amber font-bold mb-2">
              <span className="material-symbols-outlined text-[18px] text-deep-amber">grain</span>
              <span className="uppercase tracking-wider text-xs font-bold">Explora nuestra despensa</span>
            </div>
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground leading-tight">
              Categorías de Producto
            </h2>
            <p className="text-[#6c5b4f] text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
              Curaduría consciente clasificada para facilitar una despensa funcional, fresca y al peso exacto.
            </p>
          </div>
          <a
            href="/tienda"
            className="inline-flex items-center gap-2 text-deep-amber hover:text-foreground font-bold text-sm transition-colors group self-start md:self-auto"
          >
            Ver catálogo completo
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => {
            const icon = CATEGORY_ICONS[cat.slug] ?? "inventory_2"
            return (
              <Reveal key={cat.id} className="h-full">
                <a
                  href={`/tienda?categoria=${cat.slug}`}
                  className="bg-white rounded-2xl border border-[#ead7c3] p-5 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-primary hover:-translate-y-1 transition-all duration-300 group h-full"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="w-11 h-11 rounded-xl bg-[#ffebd6] text-deep-amber flex items-center justify-center border border-[#d3c5ab]/60 group-hover:bg-primary group-hover:text-foreground transition-colors duration-200">
                        <span className="material-symbols-outlined text-[22px]">{icon}</span>
                      </div>
                      <span className="bg-background text-foreground border border-[#d3c5ab]/70 font-bold text-[11px] px-2.5 py-1 rounded-full group-hover:border-primary transition-colors">
                        {cat.count} variedades
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-deep-amber transition-colors leading-snug mb-1.5">
                      {cat.name}
                    </h3>
                    <p className="text-[#6c5b4f] text-xs leading-relaxed mb-4">{cat.description}</p>
                  </div>
                  <div className="pt-3 border-t border-[#f3dfcb] flex items-center justify-between text-xs font-bold text-deep-amber group-hover:text-foreground transition-colors">
                    <span>Explorar categoría</span>
                    <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </a>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
