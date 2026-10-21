/**
 * The store's REAL contact data — supplied by the owner on 2026-10-21.
 *
 * This file exists because the Stitch mockup invented every customer-facing fact on the Contacto
 * page (both phone numbers, both street addresses, both opening-hour sets, the store features, the
 * "200+ references" claim). Those must never ship. Everything the page renders about the store comes
 * from here, so there is exactly one place to correct.
 *
 * Verified: both stores are in Riobamba; there is NO Quito branch (Stitch invented it — Quito is a
 * delivery destination via Servientrega, not a location).
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
  /** Short label used in the form's "Sucursal de Interés" select. */
  short: string
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
  embedUrl: string
  features: string[]
}

/** Opening hours — the owner's real hours. Sundays are closed. */
export const HOURS = ["Lunes a Sábado: 9:00 – 19:00", "Domingos: cerrado"]

/** Shown on both store cards. Generic and true; replace or drop any that aren't accurate. */
const SHARED_FEATURES = [
  "Pesaje exacto a granel",
  "Servicio de molienda en tienda",
  "Atención personalizada",
]

export const STORE = {
  email: "hola@wasigranel.com",
  city: "Riobamba",
  /** Nationwide delivery — the owner lives in Quito and wants to ship there. */
  shipping: { courier: "Servientrega", scope: "a todo el Ecuador" },
  /** Value props band (kept from the mockup — generic and accurate). */
  values: [
    { icon: "recycling", title: "Cero Plásticos", text: "Lleva tu envase y compra solo lo que necesitas." },
    { icon: "scale", title: "Pesaje Exacto", text: "Tú decides la cantidad, al gramo." },
    { icon: "handshake", title: "Comercio Justo", text: "Precios directos para productores locales." },
  ],
  sucursales: [
    {
      id: "matriz",
      short: "Matriz (Riobamba)",
      name: "Wasi Granel Matriz",
      description: "Nuestra casa matriz, donde todo comenzó.",
      address: "Guayaquil y Benalcázar 1815, 060111 Riobamba",
      phone: "0990876620",
      phoneDisplay: "099 087 6620",
      whatsapp: waNumber("0990876620"),
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${mapsQuery("Guayaquil y Benalcázar 1815")}`,
      embedUrl: `https://www.google.com/maps?q=${mapsQuery("Guayaquil y Benalcázar 1815")}&output=embed`,
      features: SHARED_FEATURES,
    },
    {
      id: "sucursal",
      short: "Sucursal (Riobamba)",
      name: "Wasi Granel Sucursal",
      description: "Nuestra segunda casa en Riobamba.",
      address: "Juan Montalvo y Av. José Veloz, esquina, Riobamba",
      phone: "0991475809",
      phoneDisplay: "099 147 5809",
      whatsapp: waNumber("0991475809"),
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${mapsQuery("Juan Montalvo y Av. José Veloz")}`,
      embedUrl: `https://www.google.com/maps?q=${mapsQuery("Juan Montalvo y Av. José Veloz")}&output=embed`,
      features: SHARED_FEATURES,
    },
  ] as Sucursal[],
} as const

/** Build a WhatsApp deep link, optionally with a pre-filled message. */
export function whatsappLink(number: string, text?: string): string {
  return text ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : `https://wa.me/${number}`
}

/** The main WhatsApp channel (Matriz) — used by the navbar/footer/help section. */
export const MAIN_WHATSAPP = STORE.sucursales[0].whatsapp
