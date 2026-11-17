"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { clearCart, updateQty, useCartLines, type CartLine } from "@/lib/cart"
import { fmtPrice } from "@/lib/payload"

/**
 * The checkout form from the owner's Stitch "Finalizar Pedido" screens (desktop 7/12 + mobile), wired to
 * the fixed POST contract of `app/api/orders/route.ts`.
 *
 * The zone option labels are UI copy taken verbatim from the mockup — NOT `tienda.zonas[].etiqueta`,
 * which is the owner's admin-facing wording ("Riobamba y alrededores"). The two `value`s are the only
 * two values `Orders.zone` and the handler accept.
 */
const ZONES = [
  { value: "riobamba", label: "Riobamba (entrega gratis)" },
  { value: "otra", label: "Otra ciudad (envío por Servientrega)" },
] as const

type Zone = (typeof ZONES)[number]["value"]

const CALLOUT: Record<Zone, string> = {
  riobamba:
    "El costo del envío se confirma contigo por WhatsApp antes de despachar. En Riobamba la entrega es gratis.",
  otra: "Para envíos fuera de Riobamba despachamos por Servientrega. El valor exacto según peso y destino te lo informamos vía WhatsApp.",
}

type Errors = Partial<Record<"name" | "phone" | "address" | "privacy" | "whatsapp", string>>

const field =
  "w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/30 transition-all"
const labelCls = "block font-headline text-xs font-bold uppercase tracking-wider text-on-surface"

const REASSURANCE = "El peso final y el valor exacto se confirman al despachar."

/** Compose the honest WhatsApp fallback — the customer's real cart, so nothing is lost on a failed write. */
function fallbackMessage(
  number: string,
  lines: CartLine[],
  subtotal: number,
  customer: { name: string; phone: string; address: string; note: string },
  zone: Zone,
) {
  const zoneLabel = ZONES.find((z) => z.value === zone)?.label ?? zone
  const body = [
    "Hola Wasi Granel, quiero confirmar este pedido:",
    "",
    ...lines.map((l) => `• ${l.qty} × ${l.name} (${l.label}) — ${fmtPrice(l.unitPrice * l.qty)}`),
    "",
    `Subtotal: ${fmtPrice(subtotal)}`,
    customer.name ? `Nombre: ${customer.name}` : null,
    customer.phone ? `Teléfono: ${customer.phone}` : null,
    customer.address ? `Dirección: ${customer.address}` : null,
    `Zona: ${zoneLabel}`,
    customer.note ? `Nota: ${customer.note}` : null,
  ]
    .filter((x): x is string => x != null)
    .join("\n")
  return `https://wa.me/${number}?text=${encodeURIComponent(body)}`
}

export function CheckoutForm({
  whatsappNumber,
  whatsappDisplay,
}: {
  /** The store's real WhatsApp, digits for `wa.me` (from the contacto resolver). */
  whatsappNumber: string
  whatsappDisplay: string
}) {
  const router = useRouter()
  const lines = useCartLines()
  const subtotal = useMemo(
    () => Number(lines.reduce((s, l) => s + l.unitPrice * l.qty, 0).toFixed(2)),
    [lines],
  )
  const count = lines.reduce((n, l) => n + l.qty, 0)

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    zone: ZONES[0].value as Zone,
    note: "",
    privacy: false,
    whatsapp: false,
    website: "", // honeypot — never filled by a human
  })
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  // Mobile-only: the order summary collapses to a compact "Ver mi pedido" card at the top.
  const [summaryOpen, setSummaryOpen] = useState(false)

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  function validate(): Errors {
    const e: Errors = {}
    if (!form.name.trim()) e.name = "Escribe tu nombre."
    if (form.phone.replace(/\D/g, "").length < 7) e.phone = "Escribe un teléfono o WhatsApp válido."
    if (!form.address.trim()) e.address = "Escribe una dirección de entrega."
    if (!form.privacy) e.privacy = "Necesitamos tu consentimiento para gestionar tu pedido."
    if (!form.whatsapp) e.whatsapp = "Necesitamos tu consentimiento para confirmarte por WhatsApp."
    return e
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (submitting) return
    setFailure(null)

    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) return
    if (lines.length === 0) {
      setFailure("Tu carrito está vacío. Agrega productos antes de confirmar el pedido.")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.name.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            ...(form.note.trim() ? { note: form.note.trim() } : {}),
          },
          zone: form.zone,
          items: lines.map((l) => ({
            productId: l.productId,
            kind: l.kind,
            ...(l.label ? { optionLabel: l.label } : {}),
            ...(l.grams != null ? { grams: l.grams } : {}),
            ...(l.amount != null ? { amount: l.amount } : {}),
            qty: l.qty,
            unitPrice: l.unitPrice,
          })),
          consents: { privacy: form.privacy, whatsapp: form.whatsapp },
          website: form.website,
        }),
      })

      const data = (await res.json().catch(() => null)) as
        | { reference?: string; error?: string }
        | null

      if (!res.ok || !data?.reference) {
        // Honest failure — never a fake success. The customer's cart is intact and one tap away.
        setFailure(
          data?.error?.trim() ||
            "No pudimos registrar tu pedido. Inténtalo de nuevo o escríbenos por WhatsApp.",
        )
        setSubmitting(false)
        return
      }

      // Only a real reference clears the cart — a reference always means a stored order.
      clearCart()
      const params = new URLSearchParams({ ref: data.reference })
      if (form.name.trim()) params.set("nombre", form.name.trim())
      router.push(`/confirmacion?${params.toString()}`)
    } catch {
      setFailure("No pudimos conectar con el servidor. Revisa tu conexión o escríbenos por WhatsApp.")
      setSubmitting(false)
    }
  }

  const fallbackHref = fallbackMessage(whatsappNumber, lines, subtotal, form, form.zone)

  const err = (k: keyof Errors, id: string) =>
    errors[k] ? (
      <p id={id} role="alert" data-testid={`error-${k}`} className="text-[11px] font-semibold text-error">
        {errors[k]}
      </p>
    ) : null

  /* ——— the summary card, shared by the desktop aside and the mobile collapsible ——— */
  const summary = (
    <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-7 shadow-sm border border-outline-variant/30">
      <div className="flex items-center justify-between pb-5 border-b border-outline-variant/40">
        <div className="flex items-center gap-2.5">
          <h2 className="font-headline font-bold text-xl text-on-surface">Tu pedido</h2>
          <span
            data-testid="checkout-summary-count"
            className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold"
          >
            {count === 1 ? "1 producto" : `${count} productos`}
          </span>
        </div>
        <span className="text-xs font-bold text-deep-amber flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">eco</span>
          Zero Waste
        </span>
      </div>

      {lines.length === 0 ? (
        <div data-testid="checkout-summary-empty" className="py-6 text-center space-y-3">
          <span className="material-symbols-outlined text-4xl text-outline">shopping_bag</span>
          <p className="text-sm text-on-surface-variant">Tu carrito está vacío.</p>
          <Link
            href="/tienda"
            className="inline-block py-2.5 px-5 rounded-xl bg-primary text-primary-foreground font-bold text-xs"
          >
            Ir a la tienda
          </Link>
        </div>
      ) : (
        <>
          <div className="py-4 flex flex-col gap-4 divide-y divide-outline-variant/40">
            {lines.map((l) => (
              <div
                key={l.id}
                data-testid="checkout-summary-line"
                className="pt-3 first:pt-0 flex flex-col gap-2.5"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-outline-variant/40 shrink-0 relative">
                      {l.image ? (
                        <Image src={l.image} alt={l.name} width={48} height={48} className="w-full h-full object-cover" />
                      ) : (
                        <span className="flex items-center justify-center h-full text-[9px] text-muted-foreground">
                          Sin foto
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-headline font-bold text-sm text-on-surface leading-snug truncate">
                        {l.name}
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-0.5 truncate">{l.label}</p>
                    </div>
                  </div>
                  <span className="font-headline font-bold text-sm text-on-surface shrink-0">
                    {fmtPrice(l.unitPrice * l.qty)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant/80">Unitario: {fmtPrice(l.unitPrice)}</span>
                  <div className="inline-flex items-center bg-surface-container-low rounded-lg p-0.5">
                    <button
                      type="button"
                      aria-label={`Quitar una unidad de ${l.name}`}
                      onClick={() => updateQty(l.id, l.qty - 1)}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-on-surface">{l.qty}</span>
                    <button
                      type="button"
                      aria-label={`Añadir una unidad de ${l.name}`}
                      onClick={() => updateQty(l.id, l.qty + 1)}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-outline-variant/40 flex flex-col gap-2.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant">Subtotal</span>
              <span data-testid="checkout-subtotal" className="font-bold text-on-surface">
                {fmtPrice(subtotal)}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed pt-1">{REASSURANCE}</p>
          </div>
        </>
      )}
    </div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
      {/* ============ SUMMARY — compact collapsible at the top on mobile, sticky right column on
          desktop. ONE DOM copy: a second render would duplicate every testid and confuse strict-mode
          locators. ============ */}
      <div className="lg:col-span-5 lg:order-2 lg:sticky lg:top-28">
        <button
          type="button"
          onClick={() => setSummaryOpen((o) => !o)}
          aria-expanded={summaryOpen}
          aria-controls="checkout-summary-body"
          data-testid="checkout-summary-toggle"
          className="lg:hidden w-full px-4 py-3.5 mb-2 flex items-center justify-between bg-surface-container-low rounded-3xl shadow-sm"
        >
          <span className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-primary/30 flex items-center justify-center text-deep-amber">
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            </span>
            <span className="text-sm font-bold text-on-surface">Ver mi pedido</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-base font-bold text-on-surface">{fmtPrice(subtotal)}</span>
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
              {summaryOpen ? "expand_less" : "expand_more"}
            </span>
          </span>
        </button>
        <div id="checkout-summary-body" className={`${summaryOpen ? "block" : "hidden"} lg:block`}>
          {summary}
        </div>
      </div>

      {/* ============ FORM (7/12) ============ */}
      <section aria-labelledby="form-heading" className="lg:col-span-7 lg:order-1 flex flex-col gap-6 min-w-0">
        <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-sm border border-outline-variant/30">
          <div className="flex items-center justify-between pb-5 border-b border-outline-variant/40">
            <h2
              id="form-heading"
              className="font-headline font-bold text-xl sm:text-2xl text-on-surface flex items-center gap-2.5"
            >
              <span className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-xs font-bold text-on-surface">
                1
              </span>
              Tus datos
            </h2>
            <span className="text-xs uppercase tracking-wider text-on-surface-variant font-medium">
              Campos requeridos
            </span>
          </div>

          <form id="checkout-form" data-testid="checkout-form" onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-5">
            {/* Nombre completo */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls} htmlFor="full-name">
                Nombre completo <span className="text-error">*</span>
              </label>
              <input
                className={field}
                id="full-name"
                name="fullName"
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "err-name" : undefined}
                placeholder="Ej. Camila Morales"
              />
              {err("name", "err-name")}
            </div>

            {/* Teléfono / WhatsApp */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls} htmlFor="phone-whatsapp">
                Teléfono / WhatsApp <span className="text-error">*</span>
              </label>
              <input
                className={field}
                id="phone-whatsapp"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "err-phone" : undefined}
                placeholder="Ej. +593 9 9999 9999"
              />
              {err("phone", "err-phone")}
              <p className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                <span className="material-symbols-outlined text-[16px] text-primary">chat</span>
                Es por donde te confirmamos el pedido.
              </p>
            </div>

            {/* Dirección de entrega */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls} htmlFor="delivery-address">
                Dirección de entrega <span className="text-error">*</span>
              </label>
              <input
                className={field}
                id="delivery-address"
                name="address"
                type="text"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                aria-invalid={!!errors.address}
                aria-describedby={errors.address ? "err-address" : undefined}
                placeholder="Calle, número, sector, ciudad"
              />
              {err("address", "err-address")}
            </div>

            {/* Zona de entrega + amber callout */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls} htmlFor="delivery-zone">
                Zona de entrega <span className="text-error">*</span>
              </label>
              <div className="relative">
                <select
                  className={`${field} appearance-none pr-10 cursor-pointer`}
                  id="delivery-zone"
                  name="deliveryZone"
                  value={form.zone}
                  onChange={(e) => set("zone", e.target.value as Zone)}
                >
                  {ZONES.map((z) => (
                    <option key={z.value} value={z.value}>
                      {z.label}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-3.5 pointer-events-none text-on-surface-variant text-[20px]">
                  keyboard_arrow_down
                </span>
              </div>

              <div
                data-testid="shipping-callout"
                data-zone={form.zone}
                className="mt-2.5 p-4 rounded-xl bg-secondary-container text-on-secondary-container flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                </div>
                <p data-testid="shipping-callout-text" className="text-xs sm:text-sm leading-relaxed">
                  {CALLOUT[form.zone]}
                </p>
              </div>
            </div>

            {/* Nota para el pedido (opcional) */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls} htmlFor="order-note">
                Nota para el pedido{" "}
                <span className="text-on-surface-variant font-normal lowercase">(opcional)</span>
              </label>
              <textarea
                className={`${field} resize-y`}
                id="order-note"
                name="orderNote"
                rows={3}
                value={form.note}
                onChange={(e) => set("note", e.target.value)}
                placeholder="Ej. prefiero almendras sin sal, entregar después de las 15:00"
              />
            </div>

            {/* Consent checkboxes — BOTH UNTICKED by default, wording verbatim from the mockup */}
            <div className="mt-2 pt-5 border-t border-outline-variant/40 flex flex-col gap-3.5">
              <div className="flex items-start gap-3">
                <input
                  className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer shrink-0"
                  id="consent-privacy"
                  name="consentPrivacy"
                  type="checkbox"
                  checked={form.privacy}
                  onChange={(e) => set("privacy", e.target.checked)}
                  aria-invalid={!!errors.privacy}
                />
                <label className="text-xs sm:text-sm text-on-surface-variant leading-snug cursor-pointer" htmlFor="consent-privacy">
                  Acepto el tratamiento de mis datos de contacto para gestionar mi pedido, según la Política
                  de Privacidad de Wasi Granel.
                </label>
              </div>
              {err("privacy", "err-privacy")}

              <div className="flex items-start gap-3">
                <input
                  className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer shrink-0"
                  id="consent-whatsapp"
                  name="consentWhatsApp"
                  type="checkbox"
                  checked={form.whatsapp}
                  onChange={(e) => set("whatsapp", e.target.checked)}
                  aria-invalid={!!errors.whatsapp}
                />
                <label className="text-xs sm:text-sm text-on-surface-variant leading-snug cursor-pointer" htmlFor="consent-whatsapp">
                  Acepto recibir por WhatsApp la confirmación de mi pedido y los datos de pago.
                </label>
              </div>
              {err("whatsapp", "err-whatsapp")}
            </div>

            {/* Honeypot — rendered and reachable for bots, but off-screen and out of the tab order for
                humans. Deliberately NOT display:none, so a bot still fills it. Any submission with it
                filled is dropped by the handler. */}
            <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
              <label htmlFor="website">No completar este campo</label>
              <input
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                data-testid="checkout-honeypot"
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
              />
            </div>

            {/* Honest failure state + WhatsApp fallback with the cart pre-filled */}
            {failure ? (
              <div
                data-testid="checkout-error"
                role="alert"
                className="p-4 rounded-xl bg-error-container text-on-error-container flex items-start gap-3"
              >
                <span className="material-symbols-outlined text-2xl shrink-0">error</span>
                <div className="text-xs leading-relaxed">
                  <p className="font-bold">No pudimos registrar tu pedido.</p>
                  <p className="mt-0.5">{failure}</p>
                  <a
                    href={fallbackHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="checkout-whatsapp-fallback"
                    className="mt-2 inline-flex items-center gap-1.5 font-bold text-deep-amber hover:underline"
                  >
                    <span className="material-symbols-outlined text-[16px]">chat</span>
                    Enviar mi pedido por WhatsApp
                  </a>
                </div>
              </div>
            ) : null}

            {/* CTA */}
            <div className="pt-4 sticky bottom-0 bg-surface-container-lowest lg:static pb-2 lg:pb-0">
              <button
                type="submit"
                data-testid="checkout-submit"
                disabled={submitting}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-headline font-bold text-base shadow-sm hover:brightness-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                    Enviando pedido…
                  </>
                ) : (
                  <>
                    <span>Confirmar pedido</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </>
                )}
              </button>
              <Link
                href="/tienda"
                className="text-center text-sm text-on-surface-variant hover:text-on-surface hover:underline block mt-3.5 transition-colors font-medium"
              >
                Volver a la tienda
              </Link>
              <p className="text-center text-[11px] text-on-surface-variant mt-2">
                ¿Prefieres escribirnos tú?{" "}
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-deep-amber hover:underline"
                >
                  WhatsApp {whatsappDisplay}
                </a>
              </p>
            </div>
          </form>
        </div>

        {/* Trust badges under the form (Stitch desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { icon: "scale", label: "Gramaje verificado" },
            { icon: "recycling", label: "Envases reutilizables" },
            { icon: "support_agent", label: "Trato directo 1 a 1" },
          ].map((b) => (
            <div
              key={b.label}
              className="p-3.5 rounded-xl bg-surface-container-low flex items-center gap-2.5 col-span-1 last:col-span-2 sm:last:col-span-1"
            >
              <span className="material-symbols-outlined text-deep-amber text-[20px]">{b.icon}</span>
              <span className="text-xs font-medium text-on-surface">{b.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
