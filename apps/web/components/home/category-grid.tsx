import {
  ArrowRight,
  Nut,
  Sprout,
  Apple,
  Coffee,
  Wheat,
  Leaf,
  Bean,
  Cookie,
  Droplets,
  Mountain,
  Flame,
  Package,
  type LucideIcon,
} from "lucide-react"
import type { Category } from "@/lib/payload"

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "frutos-secos": Nut,
  "semillas-granos": Sprout,
  "frutas-deshidratadas": Apple,
  "cacao-chocolates": Coffee,
  "harinas-cereales": Wheat,
  "especias-hierbas": Leaf,
  "legumbres-menestras": Bean,
  endulzantes: Cookie,
  "aceites-aceitunas": Droplets,
  "infusiones-tes": Mountain,
  "ajies-ajos": Flame,
  otros: Package,
}

export type CategoryWithCount = Category & { count: number }

export function CategoryGrid({ categories }: { categories: CategoryWithCount[] }) {
  return (
    <section className="py-20 bg-[#fff1e5]/60 border-b border-[#ead7c3] relative overflow-hidden" id="categorias">
      <div className="px-4 md:px-12 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-primary font-bold mb-2">
              <Wheat className="h-5 w-5 text-primary" aria-hidden />
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
            className="inline-flex items-center gap-2 text-primary hover:text-foreground font-bold text-sm transition-colors group self-start md:self-auto"
          >
            Ver catálogo completo
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] ?? Package
            return (
              <a
                key={cat.id}
                href={`/tienda?categoria=${cat.slug}`}
                className="bg-white rounded-2xl border border-[#ead7c3] p-5 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-primary hover:-translate-y-1 transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#ffebd6] text-primary flex items-center justify-center border border-[#d3c5ab]/60 group-hover:bg-primary group-hover:text-foreground transition-colors duration-200">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <span className="bg-background text-foreground border border-[#d3c5ab]/70 font-bold text-[11px] px-2.5 py-1 rounded-full group-hover:border-primary transition-colors">
                      {cat.count} variedades
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug mb-1.5">
                    {cat.name}
                  </h3>
                  <p className="text-[#6c5b4f] text-xs leading-relaxed mb-4">{cat.description}</p>
                </div>
                <div className="pt-3 border-t border-[#f3dfcb] flex items-center justify-between text-xs font-bold text-primary group-hover:text-foreground transition-colors">
                  <span>Explorar categoría</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden />
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
