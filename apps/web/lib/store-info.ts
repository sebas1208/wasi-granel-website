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

export type Sucursal = {
  id: string
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
  /** The store's REAL Google Maps listing — the shared link the owner supplied. */
  placeUrl: string
  /**
   * The listing's CID — the decimal form of the second `0x…` in the link's `!1s0x…:0x…` id.
   *
   * This is what makes the embed resolve to the actual BUSINESS. Neither of the obvious
   * alternatives does:
   *  - a plain coordinate pin (`q=lat,lng`) draws a pin and NO store info at all ("now it is not
   *    showing in both" — the owner);
   *  - a name/address text query lets Google pick whatever it prefers (the Matriz query landed on a
   *    supermarket a block away: "close but not focused").
   * With the CID the embed returns the real listing, card and all. Verified by reading the embed's
   * own payload: name "Wasi Granel Matriz, Guayaquil y Benalcazar 1815 y, 060111 Riobamba",
   * coords [-1.6758726,-78.6477544], phone "099 087 6620", site wasigranel.com.
   */
  placeCid: string
  services: string[]
}

/**
 * Keyless Google Maps embed, resolved by CID so the map shows the real listing (name, address,
 * phone, website) rather than a bare pin. See the `placeCid` note on `Sucursal`.
 */
export function storeEmbedUrl(s: Pick<Sucursal, "placeCid">): string {
  return `https://www.google.com/maps?cid=${s.placeCid}&output=embed`
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
  email: "info@wasigranel.com",
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
      placeUrl: "https://maps.app.goo.gl/YN79ofZo9A6BeANu6",
      placeCid: "3890135433661531628",
      services: SERVICES,
    },
    {
      id: "sucursal",
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
      placeUrl: "https://maps.app.goo.gl/dhzgsJtQoUTa9kPA6",
      placeCid: "7633805034067010969",
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
