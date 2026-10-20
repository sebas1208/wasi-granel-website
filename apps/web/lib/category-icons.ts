/**
 * Category slug -> Material Symbols name. Shared by the homepage category grid and the
 * Tienda filter sidebar so both show the same icons (Stitch's own chips carry no icons;
 * this is a house addition). Fallback: `inventory_2`.
 */
export const CATEGORY_ICONS: Record<string, string> = {
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

/** Icon for the "all categories" row. */
export const ALL_CATEGORIES_ICON = "grid_view"

export function categoryIcon(slug?: string | null): string {
  if (!slug) return "inventory_2"
  return CATEGORY_ICONS[slug] ?? "inventory_2"
}