import type { Metadata } from "next"
import Link from "next/link"
import { draftMode } from "next/headers"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { CopyReference } from "@/components/checkout/copy-reference"
import { branchWhatsapp, resolveContacto, resolveFooterProps } from "@/lib/site-copy"

export const metadata: Metadata = {
  title: "Pedido recibido — Wasi Granel",
  description: "Recibimos tu pedido. Te escribimos por WhatsApp para confirmar el peso, el envío y el pago.",
}

/**
 * Pedido recibido — the order confirmation, ported from the owner's Stitch "Pedido recibido" screens
 * (desktop + mobile).
 *
 * The reference and the customer's name come from the query string the checkout writes AFTER a real
 * `POST /api/orders` returns 200 — so a reference on this page always means a stored order. Reaching
 * this page without a reference (a bookmark, a back-navigation, a typed URL) shows an honest
 * "no encontramos tu pedido" panel rather than a success mark: the project rule is never to ship a
 * lying success state.
 *
 * The store's contact details are the REAL ones, resolved from the `contacto` global through
 * lib/site-copy.ts — never the mockup's invented facts (no bank details, no Quito branch, no invented
 * "menos de 2 minutos" promise, and no conflicting copyright year).
 */
const STEPS = [
  {
    title: "Confirmación del pesaje",
    body: "Te escribimos por WhatsApp para confirmar el peso, el envío y el pago.",
  },
  {
    title: "Método de pago preferido",
    body: "Eliges cómo pagar: transferencia, DeUna, o pago al recibir en Riobamba.",
  },
  {
    title: "Entrega y despacho consciente",
    body: "Despachamos tu pedido. En Riobamba la entrega es gratis; a otras ciudades va por Servientrega.",
  },
]

type SP = Record<string, string | string[] | undefined>
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? (v[0] ?? "") : (v ?? ""))

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<SP>
}) {
  const sp = await searchParams
  const reference = str(sp.ref).trim()
  const name = str(sp.nombre).trim()

  const { isEnabled: draft } = await draftMode()
  const [contacto, footer] = await Promise.all([
    resolveContacto({ draft }),
    resolveFooterProps({ draft }),
  ])
  const matriz = contacto.branches[0]

  const whatsappHref = branchWhatsapp(
    matriz.phone,
    reference
      ? `Hola Wasi Granel, quisiera consultar sobre mi pedido ${reference}.`
      : "Hola Wasi Granel, quisiera consultar sobre mi pedido.",
  )

  return (
    <>
      <Navigation />

      <main className="w-full pt-20 flex-grow">
        <div className="w-full max-w-2xl mx-auto py-12 sm:py-16 px-4 sm:px-6">
          {reference ? (
            <div className="flex flex-col items-center text-center space-y-6">
              {/* ============ SUCCESS MARK — the brand's amber, not a generic green check ============ */}
              <div className="relative flex items-center justify-center" data-testid="confirmation-success-mark">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-sm">
                    <svg
                      className="w-8 h-8 text-on-surface"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      viewBox="0 0 32 32"
                      aria-hidden="true"
                    >
                      <path d="M7 16.5L13 22.5L25 9.5" />
                      <circle cx="16" cy="16" r="14" strokeDasharray="3 3" strokeWidth={1.5} />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Eyebrow */}
              <div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-surface-container text-on-surface-variant">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Pedido confirmado
                </span>
              </div>

              {/* Title + reassurance */}
              <div className="space-y-3 max-w-lg">
                <h1
                  data-testid="confirmation-heading"
                  className="text-3xl sm:text-4xl font-bold tracking-tight text-on-surface font-headline"
                >
                  {name ? `¡Gracias, ${name}!` : "¡Gracias!"}
                </h1>
                <p className="text-base text-on-surface-variant leading-relaxed">
                  Hemos recibido tu solicitud correctamente. No es necesario realizar ningún pago por
                  ahora: verificaremos las existencias y pesaremos cada producto antes de coordinar
                  contigo.
                </p>
              </div>

              {/* ============ ORDER REFERENCE ============ */}
              <div className="w-full bg-surface-container-low rounded-3xl p-5 sm:p-6 text-left shadow-sm border border-outline-variant/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs uppercase font-bold tracking-wider text-on-surface-variant">
                      Tu número de pedido
                    </p>
                    <span
                      data-testid="order-reference"
                      className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface font-mono block"
                    >
                      {reference}
                    </span>
                  </div>
                  <CopyReference reference={reference} />
                </div>
              </div>

              {/* ============ THREE NUMBERED NEXT STEPS ============ */}
              <div className="w-full text-left space-y-6 pt-6">
                <h2 className="text-xl font-bold text-on-surface font-headline">Qué pasa ahora</h2>
                <ol className="space-y-4">
                  {STEPS.map((s, i) => (
                    <li
                      key={s.title}
                      data-testid="confirmation-step"
                      className="flex items-start gap-4 p-4 rounded-3xl bg-surface-container-lowest shadow-sm border border-outline-variant/30"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-on-surface flex items-center justify-center font-bold text-sm">
                        {i + 1}
                      </div>
                      <div className="space-y-0.5 pt-0.5">
                        <p className="text-sm sm:text-base font-semibold text-on-surface">{s.title}</p>
                        <p className="text-sm text-on-surface-variant leading-relaxed">{s.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* ============ DIRECT CONTACT — the store's REAL details ============ */}
              <div className="w-full bg-surface-container-low rounded-3xl p-6 sm:p-7 text-left space-y-5 shadow-sm border border-outline-variant/30">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-on-surface font-headline">¿Prefieres escribirnos tú?</h3>
                  <p className="text-sm text-on-surface-variant">
                    Si estás con poco tiempo o necesitas añadir algo de última hora, no tienes que esperar
                    a que te contactemos.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <a
                    data-testid="confirmation-whatsapp"
                    className="flex-1 inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-primary hover:brightness-95 text-primary-foreground font-bold text-sm transition-all shadow-sm"
                    href={whatsappHref}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                    <span>WhatsApp {matriz.phoneDisplay}</span>
                  </a>
                  <a
                    data-testid="confirmation-email"
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface text-sm font-semibold transition-colors"
                    href={`mailto:${contacto.email}?subject=${encodeURIComponent(`Pedido ${reference}`)}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                    <span>{contacto.email}</span>
                  </a>
                </div>
                <div className="flex items-start gap-2.5 pt-2 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px] text-primary shrink-0">schedule</span>
                  <span>
                    {contacto.hours.map((h) => (
                      <span key={h} className="block">
                        {h}
                      </span>
                    ))}
                  </span>
                </div>
              </div>

              {/* ============ BACK TO STORE ============ */}
              <div className="w-full pt-4 flex flex-col items-center space-y-6">
                <Link
                  href="/tienda"
                  data-testid="confirmation-back"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>Volver a la tienda</span>
                </Link>
                <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant/80 uppercase tracking-widest pt-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">eco</span>
                  <span>Zero Waste • Empaque consciente y compra al peso exacto</span>
                </div>
              </div>
            </div>
          ) : (
            /* No reference → no order to confirm. Honest, not a fake success. */
            <div
              data-testid="confirmation-no-order"
              className="max-w-lg mx-auto text-center space-y-5 py-10"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant">receipt_long</span>
              </div>
              <h1 className="text-2xl font-bold font-headline text-on-surface">No encontramos tu pedido</h1>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Esta página muestra la confirmación de un pedido recién enviado. Si llegaste aquí por
                error, vuelve a la tienda; si ya hiciste un pedido y necesitas ayuda, escríbenos.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link
                  href="/tienda"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">storefront</span>
                  Volver a la tienda
                </Link>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-surface-container-low text-on-surface font-semibold text-sm border border-outline-variant/30"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  Escribir por WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer copy={footer} />
    </>
  )
}
