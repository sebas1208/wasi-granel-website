/**
 * The WhatsApp order message the store sends after a customer checks out (ticket 23).
 *
 * ## Why this is a plain function and not "just a button"
 *
 * The flow is merchant-initiated: the storefront records the order, and a person then messages the
 * customer with the order summary and the payment details. This module is the part that turns a STORED
 * ORDER into the exact text of that message, so the wording lives in one place and is testable without a
 * browser, an admin session or a phone.
 *
 * ## The one hard limit: `wa.me` carries TEXT ONLY
 *
 * A `wa.me/<number>?text=…` link cannot attach an image — there is no parameter for it, and the WhatsApp
 * Business app's fixed greeting cannot carry one either. That is the whole reason the payment block ends
 * with a **link to `/pago`** instead of attaching the DeUna QR: the QR is served by the storefront at that
 * URL, where it is also the version the owner can replace from the CMS. Do not "fix" this by trying to
 * attach the image — the constraint is the platform's, and the link is the workaround, not a shortcut.
 *
 * ## Every store fact is passed in
 *
 * Nothing about the store is hardcoded here: the bank details come from the `tienda` global, the phone from
 * `contacto`, and the site's own address from `STOREFRONT_URL`. See `toComposeStore()` for the adapters.
 */

/* ——— the shape the message is built from ————————————————————————————————————————— */

export type ComposeOrderItem = {
  /** The product as the customer sees it. Never invented — see `toComposeOrder()`. */
  productName: string
  /** What the customer actually chose: "500 g", "1 unidad", "Porción". May be absent. */
  optionLabel: string | null
  qty: number
  /** The price snapshotted onto the order line when it was quoted — not re-derived here. */
  unitPrice: number
}

export type ComposeOrder = {
  reference: string
  customer: { name: string; phone: string; address: string; note?: string | null }
  zone: 'riobamba' | 'otra'
  items: ComposeOrderItem[]
  subtotal: number
  /** null / undefined = not set yet (Riobamba delivery is free, "otra ciudad" is quoted in the chat). */
  shipping?: number | null
  /** null / undefined = not set yet; the message says so rather than pretending the subtotal is final. */
  total?: number | null
}

export type ComposeStoreZone = {
  clave: 'riobamba' | 'otra'
  etiqueta: string
  courier: string
}

export type ComposeStore = {
  pago: {
    banco: string
    tipoCuenta: string
    numeroCuenta: string
    titular: string
    ruc: string
    /** The closing line the owner writes in the CMS; empty when he has not. */
    nota: string
  }
  zonas: ComposeStoreZone[]
  /**
   * The phone a DeUna transfer is sent to.
   *
   * DeUna person-to-person transfers go to a PHONE NUMBER, and the store has recorded exactly one number
   * anywhere (`contacto`), so that is what this is. If DeUna turns out to be on a different line, the fix is
   * an edit in `contacto` — never a hardcoded string here. See `toComposeStore()`.
   */
  deunaNumber: string
  /** Absolute storefront origin, no trailing slash. Needed because the customer's phone opens this. */
  siteUrl: string
}

/* ——— formatting ————————————————————————————————————————————————————————————————— */

/** Ecuador uses the dollar: `$1.50`. Always two decimals, so a column of prices lines up in the chat. */
export function money(n: number): string {
  return `$${n.toFixed(2)}`
}

/** `2` for whole quantities; trims float noise on the fractional ones the weight model can produce. */
export function qtyLabel(q: number): string {
  return Number.isInteger(q) ? String(q) : String(Number(q.toFixed(3)))
}

/** The order's own label for a zone, used when the CMS has no matching zone to read one from. */
const ZONE_FALLBACK: Record<ComposeOrder['zone'], string> = {
  riobamba: 'Riobamba y alrededores',
  otra: 'Otra ciudad',
}

/**
 * Digits-only international (`593990876620`) → the form a person reads (`099 087 6620`).
 *
 * `Orders.beforeChange` normalises the stored phone to international digits because that is what a `wa.me`
 * link needs — but reading `593987654321` back to the customer in their own order summary looks like a
 * mistake. This is the display side of that one stored value; anything that is not an Ecuadorian mobile in
 * the stored form is passed through untouched rather than guessed at.
 */
export function displayPhone(raw: string): string {
  const d = raw.replace(/\D/g, '')
  if (d.length === 12 && d.startsWith('593')) return `0${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8)}`
  if (d.length === 10) return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`
  return raw
}

/** Absolute `/pago` URL for one order — the link that replaces the QR the platform cannot carry. */
export function paymentPageUrl(siteUrl: string, reference: string): string {
  const base = siteUrl.replace(/\/+$/, '')
  return `${base}/pago?pedido=${encodeURIComponent(reference)}`
}

/* ——— the message ———————————————————————————————————————————————————————————————— */

/**
 * Compose the full order message, in Spanish, in the order a customer reads it:
 * what they bought → what it costs → where it goes → how to pay.
 *
 * Two honesty rules are baked in rather than left to the caller:
 *  - the shipping line appears only when a shipping cost is actually set, so nobody is told "$0.00 envío"
 *    on an order whose shipping is still being quoted;
 *  - when neither the shipping nor the total is set, the total is labelled as excluding shipping instead of
 *    being presented as final. Riobamba's delivery is free, so that is usually the same number — but
 *    "Otra ciudad" is quoted in the chat, and a total that silently omits it would be a lie.
 */
export function composeOrderMessage(order: ComposeOrder, store: ComposeStore): string {
  const shippingSet = typeof order.shipping === 'number' && Number.isFinite(order.shipping)
  const total =
    typeof order.total === 'number' && Number.isFinite(order.total)
      ? order.total
      : order.subtotal + (shippingSet ? (order.shipping as number) : 0)

  const zona = store.zonas.find((z) => z.clave === order.zone)
  const zonaLinea = zona ? `${zona.etiqueta} (${zona.courier})` : ZONE_FALLBACK[order.zone]

  const lines: string[] = []

  lines.push(`¡Hola ${order.customer.name}! Recibimos tu pedido en Wasi Granel.`)
  lines.push('')
  lines.push(`*Pedido:* ${order.reference}`)
  lines.push('')

  // ——— what they bought ———
  lines.push('*Tu pedido*')
  for (const item of order.items) {
    const option = item.optionLabel?.trim()
    const lineTotal = item.qty * item.unitPrice
    const parts = [`${qtyLabel(item.qty)} × ${item.productName}`]
    if (option) parts.push(option)
    parts.push(money(lineTotal))
    lines.push(`• ${parts.join(' — ')}`)
  }
  lines.push(`*Subtotal:* ${money(order.subtotal)}`)
  if (shippingSet) lines.push(`*Envío:* ${money(order.shipping as number)}`)
  lines.push(
    shippingSet ? `*Total:* ${money(total)}` : `*Total:* ${money(total)} (sin envío — se confirma por WhatsApp)`,
  )
  lines.push('')

  // ——— where it goes ———
  lines.push('*Datos de entrega*')
  lines.push(`Nombre: ${order.customer.name}`)
  lines.push(`Teléfono: ${displayPhone(order.customer.phone)}`)
  lines.push(`Dirección: ${order.customer.address}`)
  lines.push(`Zona: ${zonaLinea}`)
  const note = order.customer.note?.trim()
  if (note) lines.push(`Nota: ${note}`)
  lines.push('')

  // ——— how to pay ———
  lines.push('*Cómo pagar*')
  lines.push('')
  lines.push('1) Transferencia bancaria')
  lines.push(`Banco: ${store.pago.banco}`)
  lines.push(`Tipo de cuenta: ${store.pago.tipoCuenta}`)
  lines.push(`Número de cuenta: ${store.pago.numeroCuenta}`)
  lines.push(`Titular: ${store.pago.titular}`)
  lines.push(`RUC: ${store.pago.ruc}`)
  lines.push('')
  lines.push('2) DeUna')
  lines.push(`Escanea el código QR o envía el pago a nuestro número DeUna: ${store.deunaNumber}`)
  lines.push(`QR y datos completos: ${paymentPageUrl(store.siteUrl, order.reference)}`)
  lines.push('')
  lines.push(store.pago.nota.trim())

  // Trim the trailing blank the last push can leave, and never emit a triple newline.
  return lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * The link that opens WhatsApp on the STORE's phone, addressed to the CUSTOMER.
 *
 * `phone` is the value stored on the order, already normalised to international digits (`593990876620`) by
 * `Orders.beforeChange`. Digits are stripped again here so a hand-edited number with spaces or a `+` still
 * produces a working link rather than a 404 page.
 */
export function whatsappOrderLink(phone: string, text: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
}

/* ——— adapters: Payload documents → the shape above ——————————————————————————————— */

type MaybeId = string | number | null | undefined

/** A relationship that was read at `depth: 0` arrives as a bare id — we cannot name what we cannot read. */
type PopulatedProduct = { id?: MaybeId; name?: string | null } | MaybeId

/**
 * The product's name, or an honest placeholder.
 *
 * Callers MUST read the order at `depth: 1` (see the admin component and the proof script). If a line's
 * product is somehow unpopulated this returns `Producto #<id>` — deliberately ugly, so it is obvious in the
 * preview that the order was read too shallowly, rather than shipping a line with no product on it.
 */
export function productName(product: PopulatedProduct): string {
  if (product && typeof product === 'object') {
    const name = product.name?.trim()
    if (name) return name
    if (product.id != null) return `Producto #${product.id}`
  }
  if (typeof product === 'number' || typeof product === 'string') return `Producto #${product}`
  return 'Producto sin nombre'
}

/** The stored order document, structurally — avoids importing generated types into the message module. */
export type PayloadOrderLike = {
  reference?: string | null
  customer?: {
    name?: string | null
    phone?: string | null
    address?: string | null
    note?: string | null
  } | null
  zone?: string | null
  items?: ({ product?: PopulatedProduct; optionLabel?: string | null; qty?: number | null; unitPrice?: number | null } | null)[] | null
  subtotal?: number | null
  shipping?: number | null
  total?: number | null
}

export function toComposeOrder(doc: PayloadOrderLike): ComposeOrder {
  const zone: ComposeOrder['zone'] = doc.zone === 'otra' ? 'otra' : 'riobamba'
  return {
    reference: doc.reference?.trim() || '(sin referencia)',
    customer: {
      name: doc.customer?.name?.trim() || '(sin nombre)',
      phone: doc.customer?.phone?.trim() || '',
      address: doc.customer?.address?.trim() || '(sin dirección)',
      note: doc.customer?.note ?? null,
    },
    zone,
    items: (doc.items ?? []).filter(Boolean).map((i) => ({
      productName: productName(i!.product),
      optionLabel: i!.optionLabel ?? null,
      qty: typeof i!.qty === 'number' ? i!.qty : 1,
      unitPrice: typeof i!.unitPrice === 'number' ? i!.unitPrice : 0,
    })),
    subtotal: typeof doc.subtotal === 'number' ? doc.subtotal : 0,
    shipping: doc.shipping ?? null,
    total: doc.total ?? null,
  }
}

/** The `tienda` global as Payload returns it (all fields optional — the global can be half-filled). */
export type PayloadTiendaLike = {
  pago?: {
    banco?: string | null
    tipoCuenta?: string | null
    numeroCuenta?: string | null
    titular?: string | null
    ruc?: string | null
    nota?: string | null
  } | null
  envios?: { zonas?: ({ clave?: string | null; etiqueta?: string | null; courier?: string | null } | null)[] | null } | null
}

/** The `contacto` global, structurally: only the first branch's phone is read (the store's main line). */
export type PayloadContactoLike = {
  branches?: ({ phone?: string | null } | null)[] | null
}

/** Formats digits-only (`0990876620`) as `099 087 6620` for reading, passing anything else through. */
/**
 * What the composer needs, or the list of reasons it cannot compose yet.
 *
 * A missing bank field is not a cosmetic gap: an account number with a typo gets a transfer refused, and a
 * MISSING one gets the customer nothing to transfer to. So this reports the gap and the caller refuses to
 * render a message, instead of emitting a payment block with holes in it.
 */
export function toComposeStore(
  tienda: PayloadTiendaLike,
  contacto: PayloadContactoLike,
  opts: { siteUrl: string },
): { store: ComposeStore; missing: string[] } {
  const p = tienda.pago ?? {}
  const missing: string[] = []
  const need = (value: string | null | undefined, label: string): string => {
    const v = value?.trim() ?? ''
    if (!v) missing.push(label)
    return v
  }

  const banco = need(p.banco, 'Banco (Datos de compra → Banco)')
  const tipoCuenta = need(p.tipoCuenta, 'Tipo de cuenta')
  const numeroCuenta = need(p.numeroCuenta, 'Número de cuenta')
  const titular = need(p.titular, 'Titular')
  const ruc = need(p.ruc, 'RUC')

  const rawPhone = contacto.branches?.[0]?.phone?.trim() ?? ''
  if (!rawPhone) missing.push('Teléfono de la tienda (Contacto → primera sucursal)')

  const zonas: ComposeStoreZone[] = []
  for (const clave of ['riobamba', 'otra'] as const) {
    const z = (tienda.envios?.zonas ?? []).find((x) => x?.clave === clave)
    if (z?.etiqueta?.trim() && z?.courier?.trim()) {
      zonas.push({ clave, etiqueta: z.etiqueta.trim(), courier: z.courier.trim() })
    }
  }

  return {
    store: {
      pago: { banco, tipoCuenta, numeroCuenta, titular, ruc, nota: p.nota ?? '' },
      zonas,
      deunaNumber: rawPhone ? displayPhone(rawPhone) : '',
      siteUrl: opts.siteUrl.replace(/\/+$/, ''),
    },
    missing,
  }
}
