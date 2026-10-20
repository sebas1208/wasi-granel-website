"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { Category } from "@/lib/payload"
import { categoryIcon, ALL_CATEGORIES_ICON } from "@/lib/category-icons"

const PRICE_MAX = 50 // covers actual catalog prices; at max = no price filter

/**
 * Stitch filter sidebar: header + Limpiar todo, Categorías (cat-pills with count
 * badges), Rango de Precio (max slider), Modalidad (Peso/Unidad radios), reset.
 * `variant="drawer"` renders inside the mobile filter drawer instead of the
 * desktop lg:col-span-3 aside.
 */
export function FilterSidebar({
  categories,
  counts,
  variant = "desktop",
  onApplied,
}: {
  categories: Category[]
  counts: Record<string, number>
  variant?: "desktop" | "drawer"
  onApplied?: () => void
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const activeCat = params.get("categoria") ?? ""
  const activeMod = params.get("modalidad") ?? ""
  const precioMax = params.get("precioMax")

  // live slider value while dragging; committed to the URL on a debounce (no request spam)
  const [livePrice, setLivePrice] = useState<number | null>(null)
  const priceCommit = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (priceCommit.current) clearTimeout(priceCommit.current) }, [])
  const priceValue = livePrice ?? (precioMax ? Number(precioMax) : PRICE_MAX)

  const setParam = (key: string, val: string | null) => {
    const next = new URLSearchParams(params.toString())
    if (!val) next.delete(key)
    else next.set(key, val)
    next.delete("page")
    router.replace(`${pathname}?${next.toString()}`, { scroll: false })
    onApplied?.()
  }

  const clearAll = () => {
    router.replace(pathname, { scroll: false })
    onApplied?.()
  }

  const pill = (active: boolean) =>
    `cat-pill w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-200 active:scale-[0.98] ${
      active
        ? "bg-surface-container text-on-surface font-bold"
        : "font-semibold text-on-surface-variant hover:bg-surface-container-low"
    }`
  const badge = (active: boolean) =>
    `text-[11px] px-2 py-0.5 rounded-full ${
      active ? "bg-white/80 font-bold shadow-xs" : "bg-surface-container-low font-semibold"
    }`

  const aside =
    variant === "drawer"
      ? "flex flex-col gap-6"
      : "lg:col-span-3 hidden lg:flex flex-col gap-6 bg-surface-container-lowest/80 border border-[#ead7c3] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"

  return (
    <aside data-testid="filter-sidebar" id="filter-sidebar" className={aside}>
      {/* Sidebar header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#ead7c3]">
        <div className="flex items-center gap-2 text-on-surface font-headline font-bold text-lg">
          <span className="material-symbols-outlined text-deep-amber text-[22px]">tune</span>
          <span>Filtros</span>
        </div>
        <button
          type="button"
          onClick={clearAll}
          className="text-xs font-semibold text-deep-amber hover:underline transition-colors active:scale-95"
        >
          Limpiar todo
        </button>
      </div>

      {/* Categorías */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">Categorías</h3>
        <div role="group" aria-label="Filtro de categorías" className="flex flex-col gap-1.5">
          <button type="button" onClick={() => setParam("categoria", null)} className={pill(!activeCat)}>
            <span className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[16px] leading-none shrink-0">{ALL_CATEGORIES_ICON}</span>
              <span className="truncate">Todas las categorías</span>
            </span>
            <span className={badge(!activeCat)}>
              {Object.values(counts).reduce((a, b) => a + b, 0) || categories.length}
            </span>
          </button>
          {categories.map((c) => {
            const active = activeCat === c.slug
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setParam("categoria", active ? null : c.slug!)}
                className={pill(active)}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[16px] leading-none shrink-0">
                    {categoryIcon(c.slug)}
                  </span>
                  <span className="truncate">{c.name}</span>
                </span>
                <span className={badge(active)}>{counts[c.slug!] ?? 0}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Rango de Precio (max slider) */}
      <div className="pt-4 border-t border-[#ead7c3]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-secondary">Rango de Precio</h3>
          <span className="text-xs font-bold text-deep-amber transition-all duration-200">
            {priceValue >= PRICE_MAX || !precioMax ? "Sin límite" : `Hasta $${priceValue.toFixed(2)}`}
          </span>
        </div>
        <input
          aria-label="Rango de precio máximo"
          type="range"
          min={1}
          max={PRICE_MAX}
          step={0.5}
          value={priceValue}
          onChange={(e) => {
            const v = Number(e.target.value)
            setLivePrice(v)
            if (priceCommit.current) clearTimeout(priceCommit.current)
            priceCommit.current = setTimeout(() => {
              setParam("precioMax", v >= PRICE_MAX ? null : String(v))
              setLivePrice(null)
            }, 400)
          }}
          className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-[#785a00] hover:accent-[#fcbf00] transition-colors"
        />
        <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground mt-2">
          <span>$1.00</span>
          <span>$25.00</span>
          <span>${PRICE_MAX}.00</span>
        </div>
      </div>

      {/* Modalidad (Peso / Unidad — agreed spec; data-backed) */}
      <div className="pt-4 border-t border-[#ead7c3]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">Modalidad</h3>
        <div className="flex flex-col gap-2">
          {[
            { key: "", label: "Todas" },
            { key: "weight", label: "Peso" },
            { key: "unit", label: "Unidad" },
          ].map((m) => (
            <label
              key={m.label}
              className="flex items-center gap-2.5 text-xs font-semibold text-on-surface cursor-pointer group hover:text-deep-amber transition-colors"
            >
              <input
                type="radio"
                name="modalidad"
                checked={activeMod === m.key}
                onChange={() => setParam("modalidad", m.key || null)}
                className="rounded-full border-outline-variant accent-[#785a00] h-4 w-4"
              />
              <span>{m.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button
        type="button"
        onClick={clearAll}
        className="w-full py-2.5 mt-2 rounded-full border border-outline-variant text-xs font-bold text-foreground hover:bg-surface-container-low active:scale-95 transition-all"
      >
        Restablecer Filtros
      </button>
    </aside>
  )
}