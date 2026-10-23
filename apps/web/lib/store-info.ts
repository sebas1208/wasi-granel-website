/**
 * The store's REAL contact data + the Contacto page copy — supplied by the owner on 2026-10-21.
 *
 * This file exists because the Stitch mockup invented every customer-facing fact on the Contacto
 * page: both phone numbers, both street addresses, both opening-hour sets, a Quito branch that does
 * not exist, the store services and a "200+ references" claim. Those must never ship. Everything the
 * page renders about the store comes from here, so there is exactly one place to correct.
 *
 * Verified: BOTH stores are in Riobamba. There is NO Quito branch (Stitch invented it — Quito is a
 * delivery destination via Servientrega, not a location). The mockup's tab switcher is kept, but its
 * tabs were Riobamba + Quito; ours are Matriz + Sucursal, both Riobamba.
 */

/** Ecuador mobile numbers are dialled as +593 <9 digits without the leading 0>. */
function waNumber(local: string): string {
  return `593${local.replace(/\D/g, "").replace(/^0/, "")}`
}

function mapsQuery(address: string): string {
  return encodeURIComponent(`${address}, Riobamba, Ecuador`)
}

export type Sucursal = {
  id: string
  /** Short label for the form's "Sucursal de Interés" select. */
  short: string
  /** Label for the mockup's tab switcher. */
  tabLabel: string
  /** Status chip on the info card ("Sede Fundadora"). */
  badge: string
  /** Region chip on the info card. */
  region: string
  name: string
  description: string
  address: string
  /** Local dialling format, as the owner gave it. */
  phone: string
  /** Display form for readability. */
  phoneDisplay: string
  /** wa.me digits. */
  whatsapp: string
  mapsUrl: string
  /** Marker label on the stylized map (the mockup draws an SVG map, not a real one). */
  marker: string
  services: string[]
}

/** Real opening hours — the owner's. Sundays closed. The stub AND the mockup were both wrong. */
export const HOURS = ["Lunes a Sábado: 9:00 – 19:00", "Domingos: cerrado"]

/**
 * The three transparency pillars from the mockup's hero. The mockup's copy is kept verbatim, with one
 * correction: it promises "desde 10 gramos", but the store's minimum sale is 50 g.
 */
export const PILLARS = [
  {
    icon: "eco",
    title: "Cero Plásticos",
    text: "Trae tus frascos o usa nuestras bolsas de algodón y kraft compostables.",
  },
  {
    icon: "scale",
    title: "Pesaje Exacto",
    text: "Lleva exactamente lo que necesitas, desde 50 gramos hasta costales enteros.",
  },
  {
    icon: "hub",
    title: "Comercio Justo",
    text: "Trazabilidad directa con comunidades agroecológicas de la Sierra y Amazonía.",
  },
]

/** Services shown as chips on each store card. Only the ones the owner confirmed. */
const SERVICES = ["Molienda de café en tienda", "Pesaje exacto a granel", "Atención personalizada"]

export const STORE = {
  email: "hola@wasigranel.com",
  city: "Riobamba",
  /** Nationwide delivery — the owner lives in Quito and wants to ship there. */
  shipping: { courier: "Servientrega", scope: "a todo el Ecuador" },
  hero: {
    eyebrow: "Riobamba, Ecuador • Despensa Urbana Consciente",
    titleTop: "Conectemos desde",
    titleAccent: "la raíz",
    body: "Wasi Granel nació para transformar el consumo cotidiano en un acto consciente de equilibrio, trayendo granos seleccionados, frutos secos y cacao puro desde el corazón de los Andes ecuatorianos hasta tu mesa.",
    visitTitle: "Visítanos en persona",
    visitSub: "Dos casas en Riobamba",
  },
  sucursales: [
    {
      id: "matriz",
      short: "Matriz (Riobamba)",
      tabLabel: "1. Matriz (Riobamba)",
      badge: "Sede Fundadora",
      region: "Chimborazo",
      name: "Wasi Granel Matriz",
      description:
        "Nuestra casa matriz, donde todo comenzó. Despensa a granel, frutos secos, semillas y cacao, con pesaje al momento.",
      address: "Guayaquil y Benalcázar 1815, 060111 Riobamba",
      phone: "0990876620",
      phoneDisplay: "099 087 6620",
      whatsapp: waNumber("0990876620"),
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${mapsQuery("Guayaquil y Benalcázar 1815")}`,
      marker: "Wasi Matriz Riobamba",
      services: SERVICES,
    },
    {
      id: "sucursal",
      short: "Sucursal (Riobamba)",
      tabLabel: "2. Sucursal (Riobamba)",
      badge: "Segunda Casa",
      region: "Chimborazo",
      name: "Wasi Granel Sucursal",
      description:
        "Nuestra segunda casa en Riobamba. La misma despensa a granel y el mismo pesaje exacto, más cerca de ti.",
      address: "Juan Montalvo y Av. José Veloz, esquina, Riobamba",
      phone: "0991475809",
      phoneDisplay: "099 147 5809",
      whatsapp: waNumber("0991475809"),
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${mapsQuery("Juan Montalvo y Av. José Veloz")}`,
      marker: "Wasi Sucursal Riobamba",
      services: SERVICES,
    },
  ] as Sucursal[],
  faq: {
    q: "¿Hacen envíos a todo el Ecuador?",
    a: "Sí, despachamos encomiendas a cualquier provincia continental vía Servientrega. Coordinamos el envío por WhatsApp una vez confirmado tu pedido.",
  },
} as const

/** Build a WhatsApp deep link, optionally with a pre-filled message. */
export function whatsappLink(number: string, text?: string): string {
  return text ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : `https://wa.me/${number}`
}

/** The main WhatsApp channel (Matriz) — used by the navbar/footer/help section. */
export const MAIN_WHATSAPP = STORE.sucursales[0].whatsapp
