import { absoluteImage, getContacto, getFooter, getInicio, getTienda } from "./payload"
import type { GlobalTiendaZone, PayloadImage } from "./payload"
import { HOURS, PILLARS, STORE, whatsappLink } from "./store-info"

/**
 * Resolved site copy — one fully-populated object per Global.
 *
 * The storefront renders from these, never from the raw global. That keeps the fallback in ONE place:
 * a field that is empty in the CMS falls back to today's copy here, so no component has to null-check
 * and a customer can never be shown a blank phone number because of a mistyped edit.
 *
 * Every value below is therefore plain `string` / `string[]`, not `string | null`.
 */

const or = (v: string | null | undefined, fallback: string): string => {
  const trimmed = typeof v === "string" ? v.trim() : ""
  return trimmed || fallback
}

const orList = <T>(v: (T | null)[] | null | undefined, fallback: T[]): T[] => {
  const out = (v ?? []).filter((x): x is T => x != null)
  return out.length ? out : fallback
}

/* ——— phone derivation ————————————————————————————————————————————————————————————
 * The CMS stores ONE number, as the owner types it. The WhatsApp link and the spaced display form are
 * derived, so there is a single value to get right rather than three that can disagree.
 */
const digitsOnly = (p: string) => p.replace(/\D/g, "")

/** Ecuador mobile numbers are dialled as +593 <9 digits, without the leading 0>. */
export const waNumber = (phone: string) => `593${digitsOnly(phone).replace(/^0/, "")}`

/** "099 087 6620" — grouped for readability, passthrough if it isn't a 10-digit national number. */
export const displayPhone = (phone: string) => {
  const d = digitsOnly(phone)
  return d.length === 10 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : phone
}

/** WhatsApp deep link for a branch, from its raw phone value. */
export const branchWhatsapp = (phone: string, text?: string) => whatsappLink(waNumber(phone), text)

/* ——— Contacto ——————————————————————————————————————————————————————————————————— */

export type BranchCopy = {
  id: string
  name: string
  tabLabel: string
  badge: string
  region: string
  description: string
  address: string
  phone: string
  phoneDisplay: string
  whatsapp: string
  placeUrl: string
  placeCid: string
  services: string[]
}

export type ContactoCopy = {
  email: string
  city: string
  courier: string
  courierScope: string
  hero: {
    eyebrow: string
    titleTop: string
    titleAccent: string
    body: string
    visitTitle: string
    visitSub: string
  }
  pillars: { icon: string; title: string; text: string }[]
  hours: string[]
  branches: BranchCopy[]
  faq: { question: string; answer: string }
}

/** Today's values, used wherever the global is empty or unreachable. */
const CONTACTO_DEFAULTS: ContactoCopy = {
  email: STORE.email,
  city: STORE.city,
  courier: STORE.shipping.courier,
  courierScope: STORE.shipping.scope,
  hero: { ...STORE.hero },
  pillars: PILLARS.map((p) => ({ ...p })),
  hours: [...HOURS],
  branches: STORE.sucursales.map((s) => ({
    id: s.id,
    name: s.name,
    tabLabel: s.tabLabel,
    badge: s.badge,
    region: s.region,
    description: s.description,
    address: s.address,
    phone: s.phone,
    phoneDisplay: s.phoneDisplay,
    whatsapp: s.whatsapp,
    placeUrl: s.placeUrl,
    placeCid: s.placeCid,
    services: [...s.services],
  })),
  faq: { question: STORE.faq.q, answer: STORE.faq.a },
}

export async function resolveContacto(opts?: { draft?: boolean }): Promise<ContactoCopy> {
  const g = await getContacto(opts)
  if (!g) return CONTACTO_DEFAULTS

  const d = CONTACTO_DEFAULTS
  const gb = orList(g.branches, [])

  // A branch from the CMS needs id/display/whatsapp derived; matching by index keeps the ids stable and
  // falls back per-branch, so one half-filled branch cannot blank the other.
  const branches: BranchCopy[] = gb.length
    ? gb.map((b, i) => {
        const fallback = d.branches[i] ?? d.branches[0]
        const phone = or(b.phone, fallback.phone)
        return {
          id: fallback.id,
          name: or(b.name, fallback.name),
          tabLabel: or(b.tabLabel, fallback.tabLabel),
          badge: or(b.badge, fallback.badge),
          region: or(b.region, fallback.region),
          description: or(b.description, fallback.description),
          address: or(b.address, fallback.address),
          phone,
          phoneDisplay: displayPhone(phone),
          whatsapp: waNumber(phone),
          placeUrl: or(b.mapsUrl, fallback.placeUrl),
          placeCid: or(b.mapsCid, fallback.placeCid),
          services: orList(
            (b.services ?? []).map((s) => (s?.service?.trim() ? s.service.trim() : null)),
            fallback.services,
          ),
        }
      })
    : d.branches

  const hero = g.hero
  const general = g.general
  const faq = g.faq

  return {
    email: or(general?.email, d.email),
    city: or(general?.city, d.city),
    courier: or(general?.courier, d.courier),
    courierScope: or(general?.courierScope, d.courierScope),
    hero: {
      eyebrow: or(hero?.eyebrow, d.hero.eyebrow),
      titleTop: or(hero?.titleTop, d.hero.titleTop),
      titleAccent: or(hero?.titleAccent, d.hero.titleAccent),
      body: or(hero?.body, d.hero.body),
      visitTitle: or(hero?.visitTitle, d.hero.visitTitle),
      visitSub: or(hero?.visitSub, d.hero.visitSub),
    },
    pillars: orList(
      (g.pillars ?? []).map((p) =>
        p?.title?.trim() && p?.text?.trim()
          ? { icon: or(p.icon, "eco"), title: p.title.trim(), text: p.text.trim() }
          : null,
      ),
      d.pillars,
    ),
    hours: orList(
      (g.hours ?? []).map((h) => (h?.line?.trim() ? h.line.trim() : null)),
      d.hours,
    ),
    branches,
    faq: {
      question: or(faq?.question, d.faq.question),
      answer: or(faq?.answer, d.faq.answer),
    },
  }
}

/* ——— Inicio ————————————————————————————————————————————————————————————————————— */

export type InicioCopy = {
  hero: {
    eyebrow: string
    kicker: string
    title: string
    body: string
    ctaPrimaryLabel: string
    ctaSecondaryLabel: string
  }
  benefits: { icon: string; label: string; sub: string }[]
  history: {
    eyebrow: string
    title: string
    body1: string
    body2: string
    stats: { value: string; label: string }[]
    badgeTitle: string
    badgeSub: string
  }
  categories: { eyebrow: string; title: string; ctaLabel: string }
  popular: { title: string; ctaLabel: string }
  newsletter: { title: string; body: string; ctaLabel: string; placeholder: string }
}

const INICIO_DEFAULTS: InicioCopy = {
  hero: {
    eyebrow: "Riobamba, Ecuador",
    kicker: "Frutos secos · Semillas · Granos · Gourmet",
    title: "Equilibrio para tu despensa",
    body: "Compra la cantidad exacta que necesitas — siempre fresco, con la mejor calidad.",
    ctaPrimaryLabel: "Explorar Tienda",
    ctaSecondaryLabel: "Nuestra Historia",
  },
  benefits: [
    { icon: "scale", label: "Al peso exacto", sub: "Solo lo que necesitas" },
    { icon: "recycling", label: "Lleva tu envase", sub: "Compra a granel" },
    { icon: "terrain", label: "Origen confiable", sub: "Selección cuidada" },
  ],
  history: {
    eyebrow: "Nuestra Esencia",
    title: "Calidad gourmet, desde Riobamba",
    body1:
      "En Wasi Granel reunimos frutos secos, semillas, granos, especias y productos gourmet elegidos por calidad y sabor. Compras al peso exacto, sin desperdicio, con la frescura que tu despensa merece.",
    body2: "La cantidad exacta que necesitas, con la más alta calidad y frescura.",
    stats: [
      { value: "100%", label: "Al peso exacto" },
      { value: "50+", label: "Productos gourmet" },
    ],
    badgeTitle: "Visítanos en Riobamba",
    badgeSub: "Experiencia a granel local",
  },
  categories: {
    eyebrow: "Explora nuestra despensa",
    title: "Categorías de Producto",
    ctaLabel: "Ver catálogo completo",
  },
  popular: { title: "Productos Populares", ctaLabel: "Ver todos" },
  newsletter: {
    title: "Novedades gourmet, directo a tu correo",
    body: "Nuevos ingresos, productos gourmet y promociones exclusivas para compras a granel.",
    ctaLabel: "Suscribirme",
    placeholder: "Tu correo electrónico...",
  },
}

export async function resolveInicio(opts?: { draft?: boolean }): Promise<InicioCopy> {
  const g = await getInicio(opts)
  if (!g) return INICIO_DEFAULTS

  const d = INICIO_DEFAULTS
  const hero = g.hero
  const hist = g.history
  const cats = g.categories
  const pop = g.popular
  const news = g.newsletter

  return {
    hero: {
      eyebrow: or(hero?.eyebrow, d.hero.eyebrow),
      kicker: or(hero?.kicker, d.hero.kicker),
      title: or(hero?.title, d.hero.title),
      body: or(hero?.body, d.hero.body),
      ctaPrimaryLabel: or(hero?.ctaPrimaryLabel, d.hero.ctaPrimaryLabel),
      ctaSecondaryLabel: or(hero?.ctaSecondaryLabel, d.hero.ctaSecondaryLabel),
    },
    benefits: orList(
      (g.benefits ?? []).map((b) =>
        b?.label?.trim()
          ? { icon: or(b.icon, "scale"), label: b.label.trim(), sub: or(b.sub, "") }
          : null,
      ),
      d.benefits,
    ),
    history: {
      eyebrow: or(hist?.eyebrow, d.history.eyebrow),
      title: or(hist?.title, d.history.title),
      body1: or(hist?.body1, d.history.body1),
      body2: or(hist?.body2, d.history.body2),
      stats: orList(
        (hist?.stats ?? []).map((s) =>
          s?.value?.trim() && s?.label?.trim()
            ? { value: s.value.trim(), label: s.label.trim() }
            : null,
        ),
        d.history.stats,
      ),
      badgeTitle: or(hist?.badgeTitle, d.history.badgeTitle),
      badgeSub: or(hist?.badgeSub, d.history.badgeSub),
    },
    categories: {
      eyebrow: or(cats?.eyebrow, d.categories.eyebrow),
      title: or(cats?.title, d.categories.title),
      ctaLabel: or(cats?.ctaLabel, d.categories.ctaLabel),
    },
    popular: {
      title: or(pop?.title, d.popular.title),
      ctaLabel: or(pop?.ctaLabel, d.popular.ctaLabel),
    },
    newsletter: {
      title: or(news?.title, d.newsletter.title),
      body: or(news?.body, d.newsletter.body),
      ctaLabel: or(news?.ctaLabel, d.newsletter.ctaLabel),
      placeholder: or(news?.placeholder, d.newsletter.placeholder),
    },
  }
}

/* ——— Footer —————————————————————————————————————————————————————————————————————— */

export type FooterCopy = {
  brandBlurb: string
  navigation: { label: string; path: string }[]
  legal: { label: string; document: "terms" | "privacy" }[]
  location: { city: string; branchesLine: string }
  legalLine: string
}

const FOOTER_DEFAULTS: FooterCopy = {
  brandBlurb:
    "Frutos secos, semillas, especias y productos naturales a granel — dinamismo, orden y equilibrio cotidiano.",
  navigation: [
    { label: "Inicio", path: "/" },
    { label: "Tienda", path: "/tienda" },
    { label: "Contacto", path: "/contacto" },
  ],
  legal: [
    { label: "Términos y Condiciones", document: "terms" },
    { label: "Política de Privacidad", document: "privacy" },
  ],
  location: { city: "Riobamba, Ecuador", branchesLine: "Matriz · Sucursal" },
  legalLine: "Wasi Granel. Dinamismo, orden y equilibrio cotidiano.",
}

/** Only paths this site actually serves may be linked from the footer. */
const NAV_PATHS = new Set(["/", "/tienda", "/contacto"])
const LEGAL_DOCS = new Set(["terms", "privacy"])

export async function resolveFooter(opts?: { draft?: boolean }): Promise<FooterCopy> {
  const g = await getFooter(opts)
  if (!g) return FOOTER_DEFAULTS

  const d = FOOTER_DEFAULTS
  const loc = g.location

  return {
    brandBlurb: or(g.brandBlurb, d.brandBlurb),
    navigation: orList(
      (g.navigation ?? []).map((n) =>
        n?.label?.trim() && n.path && NAV_PATHS.has(n.path)
          ? { label: n.label.trim(), path: n.path }
          : null,
      ),
      d.navigation,
    ),
    legal: orList(
      (g.legal ?? []).map((l) =>
        l?.label?.trim() && l.document && LEGAL_DOCS.has(l.document)
          ? { label: l.label.trim(), document: l.document as "terms" | "privacy" }
          : null,
      ),
      d.legal,
    ),
    location: {
      city: or(loc?.city, d.location.city),
      branchesLine: or(loc?.branchesLine, d.location.branchesLine),
    },
    legalLine: or(g.legalLine, d.legalLine),
  }
}

/**
 * What the footer actually renders: its own copy PLUS the store's real contact details.
 *
 * The email and phone numbers come from `contacto`, not from the footer global — deliberately. Those
 * are facts about the store, and they must exist in exactly one editable place; a second copy in the
 * footer is how a stale phone number survives a correction.
 */
export type FooterProps = FooterCopy & {
  email: string
  branches: BranchCopy[]
}

/** Footer copy with no CMS read at all — for loading skeletons, which must not wait on data. */
export function footerDefaults(): FooterProps {
  return {
    ...FOOTER_DEFAULTS,
    email: CONTACTO_DEFAULTS.email,
    branches: CONTACTO_DEFAULTS.branches,
  }
}

export async function resolveFooterProps(opts?: { draft?: boolean }): Promise<FooterProps> {
  const [footer, contacto] = await Promise.all([resolveFooter(opts), resolveContacto(opts)])
  return { ...footer, email: contacto.email, branches: contacto.branches }
}

/* ——— Tienda (datos de compra) ————————————————————————————————————————————————————
 * How customers pay and how we deliver (ticket 23). Every one of these values is shown to a customer who
 * is about to send money or expecting a delivery, which is why the same all-fallbacks rule applies here
 * with the least tolerance anywhere on the site: a blank account number, courier or free-shipping
 * threshold is not untidy, it is a lost sale or an angry message.
 *
 * The resolved shape keeps the CMS's `pago` group intact rather than flattening it, so a field here can be
 * read against the admin screen without a translation step — and so `nota` (payment) and a zone's `nota`
 * cannot be confused for one another.
 */

/** The values `Orders.zone` and the checkout speak. A further tier is a schema change, not a new string. */
export type TiendaZoneClave = "riobamba" | "alrededores" | "otra"

export type TiendaZoneCopy = {
  clave: TiendaZoneClave
  etiqueta: string
  courier: string
  /** null = quoted per order (see `nota`), never "we forgot to fill it in". */
  costo: number | null
  /** null = no free-shipping threshold for this zone. */
  gratisDesde: number | null
  nota: string
}

export type TiendaCopy = {
  pago: {
    banco: string
    tipoCuenta: string
    numeroCuenta: string
    titular: string
    ruc: string
    /** Resolved URL: the CMS upload when there is one, else the bundled DeUna QR. */
    qr: string
    nota: string
  }
  zonas: TiendaZoneCopy[]
}

/** Today's values, used wherever the global is empty or unreachable (owner's parents, 2026-11-17). */
export const TIENDA_DEFAULTS: TiendaCopy = {
  pago: {
    banco: "Banco del Pichincha",
    tipoCuenta: "Cuenta de ahorros",
    numeroCuenta: "2209835002",
    titular: "Dolores Mercedes Torres Muñoz",
    ruc: "0601801327001",
    /**
     * The bundled QR in `public/pago/` — the same image the seed ships. It is a same-origin path on
     * purpose: the CMS `qr` is an upload whose home is Payload, but the fallback must survive Payload
     * being unreachable, and a fallback that points at the unreachable thing is not a fallback.
     */
    qr: "/pago/deuna-qr.png",
    nota: "Cuando hayas pagado, envíanos el comprobante por WhatsApp y confirmamos tu pedido.",
  },
  zonas: [
    {
      clave: "riobamba",
      etiqueta: "Dentro de Riobamba",
      courier: "Motofast",
      costo: 1.5,
      gratisDesde: 30,
      nota: "Entregamos dentro de Riobamba con Motofast por $1.50. El envío es gratis desde $30.",
    },
    {
      clave: "alrededores",
      etiqueta: "Alrededores de Riobamba",
      courier: "Motofast",
      costo: 2.5,
      gratisDesde: 30,
      nota: "En los alrededores de Riobamba entregamos con Motofast por $2.50. El envío es gratis desde $30.",
    },
    {
      clave: "otra",
      etiqueta: "Otra ciudad",
      courier: "Servientrega",
      costo: null,
      gratisDesde: 60,
      nota: "El costo del envío se confirma contigo por WhatsApp antes de despachar. Envío gratis desde $60.",
    },
  ],
}

/** A number from the CMS, or the fallback — `0` is a real value, `NaN` is not. */
const orNumber = (v: number | null | undefined, fallback: number | null): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback

const isZoneClave = (v: string | null | undefined): v is TiendaZoneClave =>
  v === "riobamba" || v === "alrededores" || v === "otra"

/** An upload arrives populated at the REST default depth; a bare id means depth 0 — treat that as absent. */
const qrUrl = (qr: number | PayloadImage | null | undefined): string | null => {
  if (!qr || typeof qr === "number") return null
  return absoluteImage(qr)
}

/**
 * Merge the CMS zones onto the defaults BY `clave` — never as a whole array.
 *
 * Replacing the array wholesale is how adding a third zone in the admin would silently delete the two
 * that were there (an array field is edited as a whole in the admin, and a save with one row leaves one
 * row). Merging by clave means each zone is complete on its own: the zone the owner did not touch keeps
 * its real courier and threshold, and a half-filled row falls back field by field.
 *
 * A clave the checkout does not know is skipped rather than passed through: nothing downstream could
 * render it, and `Orders.zone` could not store it. See `TiendaZoneClave`.
 */
function resolveZonas(raw: (GlobalTiendaZone | null)[] | null | undefined): TiendaZoneCopy[] {
  const byClave = new Map<TiendaZoneClave, GlobalTiendaZone>()
  for (const z of raw ?? []) {
    if (!z || !isZoneClave(z.clave) || byClave.has(z.clave)) continue
    byClave.set(z.clave, z)
  }
  if (byClave.size === 0) return TIENDA_DEFAULTS.zonas

  return TIENDA_DEFAULTS.zonas.map((fallback) => {
    const z = byClave.get(fallback.clave)
    if (!z) return fallback
    return {
      clave: fallback.clave,
      etiqueta: or(z.etiqueta, fallback.etiqueta),
      courier: or(z.courier, fallback.courier),
      costo: orNumber(z.costo, fallback.costo),
      gratisDesde: orNumber(z.gratisDesde, fallback.gratisDesde),
      nota: or(z.nota, fallback.nota),
    }
  })
}

export async function resolveTienda(opts?: { draft?: boolean }): Promise<TiendaCopy> {
  const g = await getTienda(opts)
  if (!g) return TIENDA_DEFAULTS

  const d = TIENDA_DEFAULTS
  const p = g.pago

  return {
    pago: {
      banco: or(p?.banco, d.pago.banco),
      tipoCuenta: or(p?.tipoCuenta, d.pago.tipoCuenta),
      numeroCuenta: or(p?.numeroCuenta, d.pago.numeroCuenta),
      titular: or(p?.titular, d.pago.titular),
      ruc: or(p?.ruc, d.pago.ruc),
      qr: qrUrl(p?.qr) ?? d.pago.qr,
      nota: or(p?.nota, d.pago.nota),
    },
    zonas: resolveZonas(g.envios?.zonas),
  }
}

/* ——— defaults, for seeding ————————————————————————————————————————————————————————
 * The unresolvable-free fallback copy for all four globals (no CMS read at all).
 *
 * Exported so the seeding script can start the CMS out matching today's copy EXACTLY. That is what makes
 * the switch from hardcoded strings to CMS-driven copy provably non-visual: any visible difference
 * afterwards is a real bug, not an expected content shift. Keep this the single definition — if the
 * defaults lived in two places, seeding would silently stop matching the fallback.
 */
export function siteCopyDefaults(): {
  contacto: ContactoCopy
  inicio: InicioCopy
  footer: FooterCopy
  tienda: TiendaCopy
} {
  return {
    contacto: CONTACTO_DEFAULTS,
    inicio: INICIO_DEFAULTS,
    footer: FOOTER_DEFAULTS,
    tienda: TIENDA_DEFAULTS,
  }
}
