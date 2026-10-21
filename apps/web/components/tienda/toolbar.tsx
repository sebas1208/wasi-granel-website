"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { FilterSidebar } from "./filter-sidebar"
import type { Category } from "@/lib/payload"

const SORTS = [
  { v: "", l: "Más Populares" },
  { v: "precio-asc", l: "Precio: Menor a Mayor" },
  { v: "precio-desc", l: "Precio: Mayor a Menor" },
  { v: "-createdAt", l: "Novedades Cosecha" },
]

/** Stitch toolbar pill: search + "Mostrando X de Y" | mobile Filtros + sort + view toggle. */
export function Toolbar({
  categories,
  counts,
  q,
  count,
  total,
}: {
  categories: Category[]
  counts: Record<string, number>
  q: string | null
  count: number
  total: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [view, setView] = useState<"grid" | "list">("grid")
  const [search, setSearch] = useState(q ?? "")
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sort = params.get("sort") ?? ""
  const activeCount =
    (params.get("categoria") ? 1 : 0) +
    (params.get("modalidad") ? 1 : 0) +
    (params.get("precioMax") ? 1 : 0) +
    (params.get("q") ? 1 : 0)

  const applyParam = (key: string, val: string | null) => {
    const next = new URLSearchParams(params.toString())
    if (!val) next.delete(key)
    else next.set(key, val)
    next.delete("page")
    router.replace(`${pathname}?${next.toString()}`, { scroll: false })
  }

  // debounced text search (one request per pause, not per keystroke)
  useEffect(() => {
    if ((q ?? "") === search) return
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => applyParam("q", search.trim() || null), 400)
    return () => {
      if (debounce.current) clearTimeout(debounce.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const setViewMode = (mode: "grid" | "list") => {
    setView(mode)
    const grid = document.getElementById("product-grid")
    if (!grid) return
    // list view = horizontal rows via CSS (#product-grid.is-list-view)
    grid.classList.toggle("is-list-view", mode === "list")
  }

  return (
    <>
      {/* ============ TOP BAR (Stitch pill container) ============
          Layout: stacked (search row / filter row) below lg, single pill row from lg.
          Tablet gets the stacked form too — in one row the search was crushed to 173px at 768
          while a 264px void opened near 1023, so the row never sat right at tablet widths. */}
      <div
        data-testid="tienda-toolbar"
        className="bg-surface-container-lowest/90 backdrop-blur-sm border border-[#ead7c3] rounded-2xl lg:rounded-full px-5 py-3 shadow-md hover:shadow-lg shadow-deep-amber/5 flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-4 mb-5 transition-all duration-300"
      >
        {/* Search + count */}
        <div className="flex items-center gap-3 w-full max-w-md md:max-w-none lg:w-auto lg:flex-1 lg:max-w-md">
          <div className="relative w-full group">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary text-[20px] transition-transform duration-200 group-focus-within:text-deep-amber group-focus-within:scale-110">
              search
            </span>
            <input
              aria-label="Buscar productos en el catálogo"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por quinua, almendras, cacao..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-outline-variant/60 rounded-full text-sm text-on-surface placeholder:text-muted-foreground outline-none focus:bg-surface-container-lowest focus:border-deep-amber focus:ring-2 focus:ring-deep-amber/30 transition-all duration-300 shadow-xs focus:shadow-md"
            />
          </div>
          <span className="hidden sm:inline-block text-xs font-semibold text-secondary whitespace-nowrap">
            Mostrando <strong className="text-on-surface font-bold transition-all duration-200">{count}</strong> de{" "}
            {total}
          </span>
        </div>

        {/* Mobile + tablet Filtros, sort, view toggle (view toggle is desktop-only) */}
        <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container text-xs font-bold text-on-surface hover:bg-surface-container-high active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>Filtros</span>
            {activeCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs font-semibold text-secondary whitespace-nowrap hidden sm:inline">
              Ordenar por:
            </label>
            <div className="relative">
              <select
                id="sort-select"
                aria-label="Ordenar productos"
                value={sort}
                onChange={(e) => applyParam("sort", e.target.value || null)}
                className="appearance-none bg-background border border-outline-variant/50 text-on-surface text-xs font-semibold pl-3.5 pr-8 py-2 rounded-full outline-none cursor-pointer hover:bg-surface-container-low hover:border-deep-amber/50 focus:ring-2 focus:ring-deep-amber/30 transition-all"
              >
                {SORTS.map((s) => (
                  <option key={s.v} value={s.v}>
                    {s.l}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[18px]">
                expand_more
              </span>
            </div>
          </div>

          {/* View toggle — desktop only: the list layout doesn't fit a mobile card (and Stitch's
              Catálogo Móvil has no list view). */}
          <div className="hidden lg:flex items-center bg-background border border-outline-variant/50 p-1 rounded-full gap-1">
            <button
              type="button"
              aria-label="Ver en cuadrícula"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-full transition-all flex items-center justify-center active:scale-95 ${
                view === "grid"
                  ? "bg-surface-container-lowest text-deep-amber shadow-xs"
                  : "text-secondary hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
            <button
              type="button"
              aria-label="Ver en lista"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-full transition-all flex items-center justify-center active:scale-95 ${
                view === "list"
                  ? "bg-surface-container-lowest text-deep-amber shadow-xs"
                  : "text-secondary hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">view_list</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-background shadow-xl overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-headline font-bold text-on-surface">Filtros</span>
                <button
                  type="button"
                  aria-label="Cerrar filtros"
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
              <FilterSidebar
                variant="drawer"
                categories={categories}
                counts={counts}
                resultCount={count}
                onApplied={() => setDrawerOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}