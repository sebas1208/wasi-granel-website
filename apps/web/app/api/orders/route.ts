import { NextResponse } from "next/server"
import {
  optionPrice,
  productOptions,
  ratePerGram,
  type Product,
  type PurchaseOption,
} from "@/lib/payload"

/**
 * POST /api/orders — turn a browser cart into a persisted Order.
 *
 * The storefront's checkout page POSTs here; this handler is the ONLY writer of the `orders`
 * collection. It authenticates to Payload with a server-only API key (`PAYLOAD_API_KEY`), because the
 * CMS is a different origin and the browser has no session — and because Orders access is
 * authenticated-only for every operation (customers' names, phones and addresses live there).
 *
 * Contract (fixed; the checkout page is built against it exactly):
 *   body: { customer: {name, phone, address, note?}, zone, items: [{productId, kind, optionLabel?,
 *           grams?, amount?, qty, unitPrice}], consents: {privacy, whatsapp}, website }
 *   200 -> { reference }
 *   400 -> { error }   (human-readable Spanish)
 *
 * NOTE ON PAYMENT: there is deliberately NO payment-method field at checkout. The customer picks how
 * to pay inside the WhatsApp conversation, and the store sets `paymentMethod` in the admin afterwards.
 * Do not add one here — a payment method chosen before that conversation would be a promise nobody
 * has confirmed.
 */

/* ——— Constants ————————————————————————————————————————————————————————————————— */

// The delivery cases, in the order the checkout offers them. Declared as one list with the type DERIVED from
// it, because this set, the cast below and the CMS enum drifting apart is exactly how a customer ends up
// choosing a case the endpoint rejects -- with no order stored and nothing in the logs to explain it.
const ZONES = ["riobamba", "alrededores", "otra"] as const
type Zone = (typeof ZONES)[number]
const isZone = (v: unknown): v is Zone => typeof v === "string" && (ZONES as readonly string[]).includes(v)
const KINDS = new Set(["weight", "unit", "money"])
const MAX_LINES = 50
const MAX_QTY = 999
/** 100 kg — above anything we sell by weight, low enough to reject a junk number. */
const MAX_GRAMS = 100_000
const MAX_AMOUNT = 100_000

/** Server-only Payload origin. Mirrors `lib/payload.ts`: never a NEXT_PUBLIC_ var for a write. */
const payloadBase = (
  process.env.PAYLOAD_URL ??
  process.env.NEXT_PUBLIC_PAYLOAD_URL ??
  "https://payload.wasigranel.com"
).replace(/\/+$/, "")

/* ——— Types ————————————————————————————————————————————————————————————————————— */

type IncomingItem = {
  productId?: unknown
  kind?: unknown
  optionLabel?: unknown
  label?: unknown
  grams?: unknown
  amount?: unknown
  qty?: unknown
  /** Ignored on purpose — see re-price comment below. Present only because the contract names it. */
  unitPrice?: unknown
}

type IncomingBody = {
  customer?: { name?: unknown; phone?: unknown; address?: unknown; note?: unknown }
  zone?: unknown
  items?: unknown
  consents?: { privacy?: unknown; whatsapp?: unknown }
  website?: unknown
}

/** A validated line, still carrying the CLIENT's numbers (which we are about to overwrite). */
type ValidLine = {
  productId: number
  kind: "weight" | "unit" | "money"
  optionLabel?: string
  grams?: number
  amount?: number
  qty: number
}

/** An error message in Spanish, ready to hand back to the customer. */
class Rejection extends Error {}

/** Declared as a function so TypeScript treats its `never` return as control-flow narrowing. */
function fail(error: string): never {
  throw new Rejection(error)
}

const round2 = (n: number) => Math.round(n * 100) / 100

/* ——— Validation ————————————————————————————————————————————————————————————————— */

const isNonEmptyString = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0

/**
 * A plausible Ecuadorian number: a 9-digit landline (`0[2-7]…`), a 10-digit mobile (`09…`), a mobile
 * without the leading zero (`9…`), or any of those already prefixed with `593`. Digits only, so
 * spaces, dashes and a `+` are all accepted — this is a gate against junk, not a formatter. The
 * canonical form is produced by the Orders hook, not here.
 */
function isEcuadorianPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, "")
  return /^(0[2-7]\d{7}|09\d{8}|9\d{8}|593\d{9})$/.test(digits)
}

function validateCustomer(customer: IncomingBody["customer"]) {
  if (!customer || typeof customer !== "object") fail("Faltan los datos del cliente.")
  const name = isNonEmptyString(customer!.name) ? customer!.name.trim() : ""
  if (name.length < 2) fail("El nombre debe tener al menos 2 caracteres.")
  if (name.length > 80) fail("El nombre es demasiado largo.")

  const phone = isNonEmptyString(customer!.phone) ? customer!.phone.trim() : ""
  if (!isEcuadorianPhone(phone)) fail("Ingresa un número de teléfono válido del Ecuador.")

  const address = isNonEmptyString(customer!.address) ? customer!.address.trim() : ""
  if (address.length < 5) fail("La dirección debe tener al menos 5 caracteres.")
  if (address.length > 200) fail("La dirección es demasiado larga.")

  let note: string | undefined
  if (customer!.note != null && customer!.note !== "") {
    if (typeof customer!.note !== "string") fail("La nota del pedido no es válida.")
    note = customer!.note.trim()
    if (note.length > 500) fail("La nota del pedido es demasiado larga.")
  }

  return { name, phone, address, ...(note ? { note } : {}) }
}

function validateLines(rawItems: unknown): ValidLine[] {
  if (!Array.isArray(rawItems) || rawItems.length === 0) fail("El pedido no tiene productos.")
  if (rawItems.length > MAX_LINES) fail(`El pedido no puede tener más de ${MAX_LINES} productos.`)

  return rawItems.map((raw, i) => {
    if (!raw || typeof raw !== "object") fail("Uno de los productos del pedido no es válido.")
    const item = raw as IncomingItem
    const n = i + 1

    const productId = item.productId
    if (typeof productId !== "number" || !Number.isInteger(productId) || productId <= 0) {
      fail(`El producto #${n} no es válido.`)
    }

    const kind = item.kind
    if (typeof kind !== "string" || !KINDS.has(kind)) fail(`El tipo del producto #${n} no es válido.`)

    const qty = item.qty
    if (typeof qty !== "number" || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      fail(`La cantidad del producto #${n} debe ser un número entero entre 1 y ${MAX_QTY}.`)
    }

    let grams: number | undefined
    if (kind === "weight") {
      if (typeof item.grams !== "number" || !Number.isFinite(item.grams) || item.grams <= 0 || item.grams > MAX_GRAMS) {
        fail(`El peso del producto #${n} no es válido.`)
      }
      grams = item.grams
    }

    let amount: number | undefined
    if (kind === "money") {
      if (typeof item.amount !== "number" || !Number.isFinite(item.amount) || item.amount <= 0 || item.amount > MAX_AMOUNT) {
        fail(`El monto del producto #${n} no es válido.`)
      }
      amount = item.amount
    }

    const label = item.optionLabel ?? item.label
    const optionLabel = typeof label === "string" && label.trim() ? label.trim().slice(0, 80) : undefined

    // `item.unitPrice` is intentionally not read: it is the CLIENT's price and is never trusted.
    return { productId: productId as number, kind: kind as ValidLine["kind"], optionLabel, grams, amount, qty: qty as number }
  })
}

/* ——— Re-pricing ————————————————————————————————————————————————————————————————— */

/**
 * Fetch the canonical products for a batch of ids, UNCACHED.
 *
 * No-store on purpose: the catalog read layer caches for the whole site, but an order must be priced
 * against the rate that is live at the moment of checkout, not a copy that could predate a price edit.
 */
async function fetchProducts(ids: number[]): Promise<Map<number, Product>> {
  const params = new URLSearchParams()
  params.set("limit", String(ids.length))
  params.set("depth", "0")
  ids.forEach((id, i) => params.set(`where[id][in][${i}]`, String(id)))

  const res = await fetch(`${payloadBase}/api/products?${params.toString()}`, { cache: "no-store" })
  if (!res.ok) throw new Error(`Payload products read failed: ${res.status}`)
  const data = (await res.json()) as { docs?: Product[] }
  return new Map((data.docs ?? []).map((p) => [p.id, p]))
}

/**
 * The SERVER's price for one line, derived from the canonical product rate and the option's
 * grams/amount via `optionPrice` (the same helper the storefront prices with).
 *
 * Re-pricing is SEPARATE from validation. An implausible payload gets a 400 above; a plausible one
 * gets corrected numbers here — a stale client price must never be the reason a real order is
 * rejected. The client's `unitPrice` is discarded entirely and the server's figure is stored.
 *
 * Returns null when the product cannot be priced at all (unknown product, or a weight line on a
 * product with no weight rate) — that is a real problem, not a stale number, and becomes a 400.
 */
function serverPriceFor(product: Product, line: ValidLine): number | null {
  if (line.kind === "weight") {
    if (!line.grams) return null
    const rate = ratePerGram(product)
    if (rate == null) return null
    return optionPrice(product, { kind: "weight", weightGrams: line.grams } as PurchaseOption)
  }

  if (line.kind === "money") {
    if (!line.amount) return null
    // A "money" line means "this many dollars of this product" — the amount IS the price.
    return optionPrice(product, { kind: "money", amount: line.amount } as PurchaseOption)
  }

  // "unit": the price lives on the product's unit option; match the customer's label when we can.
  const units = productOptions(product).filter((o) => o.kind === "unit")
  const match =
    (line.optionLabel && units.find((o) => (o.label ?? "").trim() === line.optionLabel)) || units[0]
  return match ? optionPrice(product, match) : null
}

/* ——— Handler ————————————————————————————————————————————————————————————————————— */

export async function POST(request: Request) {
  try {
    const apiKey = process.env.PAYLOAD_API_KEY
    if (!apiKey) {
      // Fail loudly rather than silently dropping orders. 500, not 400: this is our misconfiguration.
      console.error("POST /api/orders: PAYLOAD_API_KEY is not set")
      return NextResponse.json({ error: "El sistema de pedidos no está disponible." }, { status: 500 })
    }

    let body: IncomingBody
    try {
      body = (await request.json()) as IncomingBody
    } catch {
      return NextResponse.json({ error: "La solicitud no es válida." }, { status: 400 })
    }
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "La solicitud no es válida." }, { status: 400 })
    }

    try {
      // HONEYPOT. `website` is a hidden field no human ever sees or fills; a filled one means a bot.
      // Refused with a bland message on purpose — a helpful error would tell the bot how to pass.
      if (typeof body.website === "string" && body.website.trim() !== "") {
        return NextResponse.json({ error: "No pudimos procesar el pedido." }, { status: 400 })
      }

      const customer = validateCustomer(body.customer)

      if (!isZone(body.zone)) {
        fail("La zona de envío no es válida.")
      }
      const zone: Zone = body.zone

      // BOTH consents are required. The checkbox is the legal basis for holding someone's data, so an
      // order without one is not an order — it is data we are not allowed to keep. Missing counts as
      // false. The consent TIMESTAMPS are stamped by the Orders hook, never sent by the client.
      const privacy = body.consents?.privacy === true
      const whatsapp = body.consents?.whatsapp === true
      if (!privacy || !whatsapp) {
        fail("Debes aceptar el tratamiento de tus datos y el contacto por WhatsApp para completar el pedido.")
      }

      const lines = validateLines(body.items)

      const products = await fetchProducts([...new Set(lines.map((l) => l.productId))])

      // Re-price every line server-side. This is the whole point: the browser's numbers are ignored.
      const items = lines.map((line, i) => {
        const product = products.get(line.productId)
        if (!product) fail(`El producto #${i + 1} ya no está disponible.`)
        const unitPrice = serverPriceFor(product, line)
        if (unitPrice == null || !Number.isFinite(unitPrice) || unitPrice < 0) {
          fail(`No pudimos calcular el precio del producto #${i + 1}.`)
        }
        return {
          product: line.productId,
          ...(line.optionLabel ? { optionLabel: line.optionLabel } : {}),
          kind: line.kind,
          ...(line.grams != null ? { grams: line.grams } : {}),
          ...(line.amount != null ? { amount: line.amount } : {}),
          qty: line.qty,
          unitPrice: round2(unitPrice),
        }
      })

      // The stored subtotal is the sum of the SERVER's prices, never the cart's displayed total.
      const subtotal = round2(items.reduce((sum, it) => sum + it.unitPrice * it.qty, 0))

      const res = await fetch(`${payloadBase}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Payload API-key auth: `users API-Key <key>`. Counts as a logged-in user for access control.
          Authorization: `users API-Key ${apiKey}`,
        },
        body: JSON.stringify({
          status: "nuevo",
          customer,
          zone,
          items,
          subtotal,
          // No shipping/total/paymentMethod: the store fills those in while arranging payment in the
          // WhatsApp conversation (see the note at the top of this file).
          whatsappConsent: true,
          privacyConsent: true,
        }),
        cache: "no-store",
      })

      if (!res.ok) {
        const detail = await res.text().catch(() => "")
        console.error(`POST /api/orders: Payload create failed ${res.status}: ${detail.slice(0, 500)}`)
        return NextResponse.json({ error: "No pudimos guardar tu pedido. Intenta de nuevo." }, { status: 500 })
      }

      const created = (await res.json()) as { doc?: { reference?: string } }
      const reference = created.doc?.reference
      if (!reference) {
        console.error("POST /api/orders: Payload create returned no reference")
        return NextResponse.json({ error: "No pudimos guardar tu pedido. Intenta de nuevo." }, { status: 500 })
      }

      // The ONLY field on success — the checkout page shows the reference and hands off to WhatsApp.
      return NextResponse.json({ reference }, { status: 200 })
    } catch (err) {
      if (err instanceof Rejection) {
        return NextResponse.json({ error: err.message }, { status: 400 })
      }
      throw err
    }
  } catch (err) {
    console.error("POST /api/orders: unexpected error", err)
    return NextResponse.json({ error: "Ocurrió un error inesperado. Intenta de nuevo." }, { status: 500 })
  }
}
