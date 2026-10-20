"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

export function Pagination({
  page,
  totalPages,
  totalDocs,
  limit,
}: {
  page: number
  totalPages: number
  totalDocs: number
  limit: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const go = (p: number) => {
    const next = new URLSearchParams(params.toString())
    if (p <= 1) next.delete("page")
    else next.set("page", String(p))
    router.replace(`${pathname}?${next.toString()}`, { scroll: true })
  }

  const from = totalDocs === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, totalDocs)

  return (
    <div data-testid="pagination" className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
      <div className="text-sm text-muted-foreground">
        {totalDocs > 0 ? `${from}–${to} de ${totalDocs} productos` : "Sin resultados"}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => go(page - 1)}
          disabled={page <= 1}
          className="h-9 px-3 rounded-lg border border-[#ead7c3] bg-white text-sm font-semibold text-foreground hover:bg-[#fff1e5] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .slice(Math.max(0, Math.min(page - 3, totalPages - 5)), Math.max(5, page + 2))
          .map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => go(p)}
              aria-current={p === page ? "page" : undefined}
              className={`h-9 w-9 rounded-lg text-sm font-bold transition-all active:scale-95 ${
                p === page
                  ? "bg-primary text-foreground shadow-sm"
                  : "border border-[#ead7c3] bg-white text-muted-foreground hover:bg-[#fff1e5]"
              }`}
            >
              {p}
            </button>
          ))}

        <button
          type="button"
          onClick={() => go(page + 1)}
          disabled={page >= totalPages}
          className="h-9 px-3 rounded-lg border border-[#ead7c3] bg-white text-sm font-semibold text-foreground hover:bg-[#fff1e5] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>
    </div>
  )
}