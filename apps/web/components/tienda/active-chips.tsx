"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { Category } from "@/lib/payload"

const MODALIDAD_LABEL: Record<string, string> = { weight: "Peso", unit: "Unidad" }

/**
 * Active filter chips row (Stitch "Filtros activos:" + dismissable pills + "Borrar filtros").
 * Shows category, search (q), modality and price chips; each removes just its param.
 */
export function ActiveChips({
  activeCats,
  modalidad,
  precioMax,
  q,
}: {
  activeCats: Category[]
  modalidad: string | null
  precioMax: number | null
  q: string | null
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const chips: { key: string; label: string; param: string }[] = [
    ...activeCats.map((c) => ({ key: `cat-${c.id}`, label: c.name, param: "categoria" })),
    ...(q ? [{ key: "q", label: `"${q}"`, param: "q" }] : []),
    ...(modalidad ? [{ key: "mod", label: MODALIDAD_LABEL[modalidad] ?? modalidad, param: "modalidad" }] : []),
    ...(precioMax
      ? [{ key: "price", label: `Hasta $${Number(precioMax).toFixed(2)}`, param: "precioMax" }]
      : []),
  ]

  if (chips.length === 0) return null

  const setParams = (mutate: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(params.toString())
    mutate(next)
    next.delete("page")
    router.replace(`${pathname}?${next.toString()}`, { scroll: false })
  }

  return (
    <div data-testid="active-chips" className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-xs font-bold text-secondary mr-1">Filtros activos:</span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="filter-chip inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-container text-on-surface border border-[#ead7c3] hover:border-deep-amber/40 transition-all duration-200"
        >
          {chip.label}
          <button
            type="button"
            aria-label={`Quitar filtro ${chip.label}`}
            onClick={() => setParams((p) => p.delete(chip.param))}
            className="text-secondary hover:text-destructive flex items-center transition-transform hover:scale-125"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={() => setParams(() => {})}
        className="text-xs font-bold text-deep-amber hover:underline ml-2 transition-transform active:scale-95"
      >
        Borrar filtros
      </button>
    </div>
  )
}