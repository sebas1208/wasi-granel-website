import { Skeleton } from "@/components/ui/skeleton"
import { ShopBanner } from "./shop-banner"

/** Mirrors the real CatalogCard: rounded-3xl, aspect-square image, p-5 body, chips, pt-4 footer. */
function CardSkeleton() {
  return (
    <div className="bg-surface-container-lowest border border-[#ead7c3] rounded-3xl overflow-hidden shadow-xs flex flex-col justify-between">
      <div>
        <Skeleton className="aspect-square w-full rounded-none" />
        <div className="p-5">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-3 w-full mb-1.5" />
          <Skeleton className="h-3 w-2/3 mb-3" />
          <div className="flex flex-wrap items-center gap-1.5">
            <Skeleton className="h-6 w-12 rounded-lg" />
            <Skeleton className="h-6 w-12 rounded-lg" />
            <Skeleton className="h-6 w-12 rounded-lg" />
            <Skeleton className="h-7 w-7 rounded-lg ml-auto" />
          </div>
        </div>
      </div>
      <div className="px-5 pb-5 pt-4 border-t border-[#f3dfcb]/60 flex items-center justify-between">
        <div>
          <Skeleton className="h-3 w-14 mb-1" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-10 w-10 sm:w-24 rounded-2xl" />
      </div>
    </div>
  )
}

/** Sidebar filter card — mirrors the real aside (rounded-3xl p-6, categories, slider, radios, reset). */
function SidebarSkeleton() {
  return (
    <aside className="lg:col-span-3 hidden lg:flex flex-col gap-6 bg-surface-container-lowest/80 border border-[#ead7c3] rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[#ead7c3]">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div>
        <Skeleton className="h-3 w-24 mb-3" />
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-xl" />
          ))}
        </div>
      </div>
      <div className="pt-4 border-t border-[#ead7c3]">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-2 w-full rounded-lg" />
        <div className="flex items-center justify-between mt-2">
          <Skeleton className="h-2.5 w-8" />
          <Skeleton className="h-2.5 w-8" />
          <Skeleton className="h-2.5 w-8" />
        </div>
      </div>
      <div className="pt-4 border-t border-[#ead7c3]">
        <Skeleton className="h-3 w-24 mb-3" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-28" />
          ))}
        </div>
      </div>
      <Skeleton className="h-10 w-full rounded-full" />
    </aside>
  )
}

/** Top bar pill — mirrors Toolbar (search + Mostrando X de Y | Filtros + sort + view toggle). */
function ToolbarSkeleton() {
  return (
    <div className="bg-surface-container-lowest/90 border border-[#ead7c3] rounded-2xl md:rounded-full px-5 py-3 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 mb-5">
      <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-md">
        <Skeleton className="h-10 w-full rounded-full" />
        <Skeleton className="h-3 w-28 shrink-0 hidden sm:block" />
      </div>
      <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
        <Skeleton className="h-9 w-24 rounded-full lg:hidden" />
        <Skeleton className="h-9 w-36 rounded-full" />
        <Skeleton className="h-9 w-16 rounded-full" />
      </div>
    </div>
  )
}

/** Skeleton for the Tienda route while the server query resolves (mirrors banner + 12-col layout + grid). */
export function CatalogSkeleton({ cards = 9 }: { cards?: number }) {
  return (
    <div data-testid="catalog-skeleton">
      {/* Real banner (static) — identical in both states, so no skeleton flash or height shift */}
      <ShopBanner />

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        <SidebarSkeleton />

        <div className="lg:col-span-9 min-w-0">
          <ToolbarSkeleton />

          {/* Product catalog grid: 2 cols mobile / 3 desktop (matches the real grid) */}
          <div className="grid gap-6 grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: cards }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
