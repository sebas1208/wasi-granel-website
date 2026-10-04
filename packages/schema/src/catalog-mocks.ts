import type { Category } from './category'
import type { Product } from './product'
import type { Sucursal } from './sucursal'

/**
 * Placeholder catalog data so the frontend tickets aren't blocked on the
 * Payload CMS. Mirrors the 8 categories, 9 products and 2 sucursales already
 * visible in the Stitch catalog screens.
 */

const img = (slug: string, alt: string) => ({
  url: `https://picsum.photos/seed/${slug}/800/600`,
  alt,
  width: 800,
  height: 600,
})

export const mockCategories: Category[] = [
  { slug: 'frutos-secos', name: 'Frutos Secos', sortOrder: 1 },
  { slug: 'semillas-granos', name: 'Semillas & Granos', sortOrder: 2 },
  { slug: 'frutas-deshidratadas', name: 'Frutas Deshidratadas', sortOrder: 3 },
  { slug: 'cacao-chocolates', name: 'Cacao & Chocolates', sortOrder: 4 },
  { slug: 'harinas-cereales', name: 'Harinas & Cereales', sortOrder: 5 },
  { slug: 'especias-hierbas', name: 'Especias & Hierbas', sortOrder: 6 },
  { slug: 'legumbres-menestras', name: 'Legumbres & Menestras', sortOrder: 7 },
  { slug: 'despensa-endulzantes', name: 'Despensa & Endulzantes', sortOrder: 8 },
]

export const mockProducts: Product[] = [
  {
    slug: 'almendras-naturales',
    ref: 'FRS-002',
    name: 'Almendras Naturales',
    description: 'Almendras enteras sin sal, ricas en vitamina E.',
    categorySlug: 'frutos-secos',
    images: [img('almendras-naturales', 'Almendras naturales')],
    origin: 'Ecuador',
    inStock: true,
    purchaseOptions: [
      { kind: 'weight', weightGrams: 250, price: 6.5 },
      { kind: 'weight', weightGrams: 500, price: 12.0 },
      { kind: 'unit', price: 5.0, label: 'porción $5' },
    ],
  },
  {
    slug: 'mix-frutos-secos',
    ref: 'FRS-001',
    name: 'Mix de Frutos Secos',
    description: 'Mezcla energética de almendras, nueces, pasas y semillas.',
    categorySlug: 'frutos-secos',
    images: [img('mix-frutos-secos', 'Mix de frutos secos')],
    origin: 'Ecuador',
    inStock: true,
    purchaseOptions: [
      { kind: 'weight', weightGrams: 100, price: 2.1 },
      { kind: 'weight', weightGrams: 250, price: 4.9 },
      { kind: 'weight', weightGrams: 500, price: 9.4 },
    ],
  },
  {
    slug: 'nuez-nogal-criolla',
    ref: 'FRS-003',
    name: 'Nuez de Nogal Criolla',
    description: 'Nueces de nogal criollo, omega-3 y textura crujiente.',
    categorySlug: 'frutos-secos',
    images: [img('nuez-nogal-criolla', 'Nuez de nogal criolla')],
    origin: 'Ecuador',
    inStock: true,
    purchaseOptions: [
      { kind: 'weight', weightGrams: 100, price: 3.0 },
      { kind: 'weight', weightGrams: 250, price: 7.0 },
      { kind: 'weight', weightGrams: 500, price: 13.5 },
    ],
  },
  {
    slug: 'semillas-calabaza',
    ref: 'SEM-001',
    name: 'Semillas de Calabaza',
    description: 'Pepas de calabaza tostadas, fuente de magnesio y zinc.',
    categorySlug: 'semillas-granos',
    images: [img('semillas-calabaza', 'Semillas de calabaza')],
    origin: 'Ecuador',
    inStock: true,
    purchaseOptions: [
      { kind: 'weight', weightGrams: 100, price: 1.8 },
      { kind: 'weight', weightGrams: 250, price: 4.2 },
      { kind: 'weight', weightGrams: 500, price: 8.0 },
    ],
  },
  {
    slug: 'quinua-real-organica',
    ref: 'SEM-002',
    name: 'Quinua Real Orgánica',
    description: 'Quinua real orgánica, proteína completa de altura.',
    categorySlug: 'semillas-granos',
    images: [img('quinua-real-organica', 'Quinua real orgánica')],
    origin: 'Bolivia',
    inStock: true,
    purchaseOptions: [
      { kind: 'weight', weightGrams: 250, price: 2.4 },
      { kind: 'weight', weightGrams: 500, price: 4.5 },
      { kind: 'weight', weightGrams: 1000, price: 8.5 },
    ],
  },
  {
    slug: 'cacao-nibs-andino',
    ref: 'CAC-001',
    name: 'Cacao Nibs Andino',
    description: 'Nibs de cacao andino, 100% puro y crujiente.',
    categorySlug: 'cacao-chocolates',
    images: [img('cacao-nibs-andino', 'Cacao nibs andino')],
    origin: 'Ecuador',
    inStock: true,
    purchaseOptions: [
      { kind: 'weight', weightGrams: 100, price: 2.7 },
      { kind: 'weight', weightGrams: 250, price: 6.2 },
      { kind: 'weight', weightGrams: 500, price: 11.5 },
    ],
  },
  {
    slug: 'trufas-chocolate-70',
    ref: 'CAC-002',
    name: 'Trufas de Chocolate 70%',
    description: 'Trufas artesanales de chocolate 70% cacao.',
    categorySlug: 'cacao-chocolates',
    images: [img('trufas-chocolate-70', 'Trufas de chocolate 70%')],
    origin: 'Ecuador',
    inStock: true,
    taxRate: 0.12,
    purchaseOptions: [{ kind: 'unit', price: 5.5, label: 'caja 100 g' }],
  },
  {
    slug: 'higos-secos-premium',
    ref: 'FRU-001',
    name: 'Higos Secos Premium',
    description: 'Higos secos suaves y dulces, sin azúcar añadida.',
    categorySlug: 'frutas-deshidratadas',
    images: [img('higos-secos-premium', 'Higos secos premium')],
    origin: 'Ecuador',
    inStock: true,
    purchaseOptions: [
      { kind: 'weight', weightGrams: 100, price: 2.4 },
      { kind: 'weight', weightGrams: 250, price: 5.6 },
      { kind: 'weight', weightGrams: 500, price: 10.5 },
    ],
  },
  {
    slug: 'harina-platano-verde',
    ref: 'HAR-001',
    name: 'Harina de Plátano Verde',
    description: 'Harina de plátano verde, libre de gluten.',
    categorySlug: 'harinas-cereales',
    images: [img('harina-platano-verde', 'Harina de plátano verde')],
    origin: 'Ecuador',
    inStock: true,
    purchaseOptions: [{ kind: 'unit', price: 3.2, label: '500 g' }],
  },
]

export const mockSucursales: Sucursal[] = [
  {
    slug: 'riobamba',
    name: 'Wasi Granel – Riobamba',
    city: 'Riobamba',
    address: 'Centro, Riobamba',
    whatsapp: '+593900000001',
  },
  {
    slug: 'quito',
    name: 'Wasi Granel – Quito',
    city: 'Quito',
    address: 'La Floresta, Quito',
    whatsapp: '+593900000002',
  },
]