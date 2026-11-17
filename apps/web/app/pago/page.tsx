import type { Metadata } from "next"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { CopyButton } from "@/components/pago/copy-button"
import { resolveFooterProps, resolveTienda } from "@/lib/site-copy"
import { whatsappLink } from "@/lib/store-info"

/**
 * Cómo pagar tu pedido — the payment page the WhatsApp message links to (ticket 23).
 *
 * Two things shape this page:
 *
 *  1. **It is opened from a WhatsApp message, on a phone.** So it is mobile-first: one column, short, and
 *     readable at a glance, with the account number and the RUC tappable to copy — a customer typing 10
 *     digits into a banking app from a chat window is where a refused transfer comes from.
 *
 *  2. **It is the reason the WhatsApp message carries no image.** A `wa.me` link is text only, so the
 *     message links here instead of attaching the DeUna QR; this page is where the real QR is served, from
 *     the `tienda` global's upload when the owner has set one and from the bundled `public/pago/deuna-qr.png`
 *     otherwise. See `resolveTienda()` — the fallback lives in the resolver, never in this component.
 *
 * Everything the page states about the store comes from the resolver chain (`tienda` for the payment and
 * shipping facts, `contacto` for the WhatsApp number). The Stitch mockups for this screen invented the bank
 * name, the account type, the account number, the business name, the RUC **and drew a fake QR as an SVG** —
 * none of that is here, and the QR rendered below is the real, decoded-and-verified image.
 */
export const metadata: Metadata = {
  title: "Cómo pagar tu pedido — Wasi Granel",
  description:
    "Paga tu pedido de Wasi Granel por transferencia bancaria o con DeUna. Confirma por WhatsApp cuando hayas pagado.",
}

type SearchParams = Record<string, string | string[] | undefined>

/** `?pedido=WG-2026-0001` — the reference the customer was given at checkout. Optional: the page stands alone. */
function firstParam(v: string | string[] | undefined): string {
  const s = Array.isArray(v) ? v[0] : v
  return (s ?? "").trim()
}

export default async function PagoPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const pedido = firstParam(sp.pedido)

  const [tienda, footer] = await Promise.all([resolveTienda(), resolveFooterProps()])
  const pago = tienda.pago
  const matriz = footer.branches[0]

  // The customer taps this to send the receipt. The reference travels with the message when we have one, so
  // the store does not have to ask which order it is.
  const comprobanteHref = whatsappLink(
    matriz?.whatsapp ?? "",
    pedido
      ? `Hola Wasi Granel, adjunto el comprobante de mi pedido ${pedido}.`
      : "Hola Wasi Granel, adjunto el comprobante de mi pedido.",
  )

  return (
    <>
      <Navigation />

      <main className="w-full pt-20 flex-grow bg-background">
        <div className="mx-auto w-full max-w-md lg:max-w-5xl px-4 sm:px-6 lg:px-8 py-6 lg:py-12 flex flex-col gap-6 lg:gap-8">
          {/* ============ HEAD ============ */}
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
              <span className="text-xs font-label uppercase tracking-wider font-bold">Pago</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-headline font-bold text-on-surface leading-tight">
              Cómo pagar tu pedido
            </h1>
            <p className="text-sm lg:text-base font-body text-on-surface-variant leading-relaxed">
              Elige la forma que te resulte más cómoda. Confirma por WhatsApp cuando hayas pagado.
            </p>
          </div>

          {/* ============ ORDER REFERENCE (only when the link carried one) ============ */}
          {pedido ? (
            <div
              data-testid="pago-pedido"
              className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-surface-container-low shadow-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-[#875d00] shrink-0">
                  <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-label uppercase tracking-wider font-semibold text-on-surface-variant">
                    Pedido
                  </span>
                  <span
                    data-testid="pago-pedido-ref"
                    className="text-base font-headline font-bold text-on-surface tracking-wide break-all"
                  >
                    {pedido}
                  </span>
                </div>
              </div>
              <CopyButton value={pedido} ariaLabel="Copiar código de pedido" />
            </div>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            {/* ============ DEUNA ============ */}
            <section className="flex flex-col gap-3 p-5 lg:p-7 rounded-3xl bg-surface-container-lowest shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                  </div>
                  <h2 className="text-lg font-headline font-bold text-on-surface">DeUna</h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-label uppercase font-bold bg-surface-container text-on-surface-variant">
                  Instantáneo
                </span>
              </div>

              <div className="flex flex-col items-center gap-3 my-2">
                <div
                  data-testid="pago-qr"
                  className="w-[220px] h-[220px] rounded-2xl bg-white p-3 flex items-center justify-center shadow-inner border border-outline-variant/40"
                >
                  {/*
                   * `unoptimized` on purpose: a QR code is machine-read, and re-encoding it through the image
                   * optimizer is a scanning risk for no benefit. The source is 900×900, so the browser has
                   * plenty of pixels to downscale from. The image is the real QR — never a drawn placeholder.
                   */}
                  <Image
                    src={pago.qr}
                    alt="Código QR de DeUna de Wasi Granel"
                    width={220}
                    height={220}
                    unoptimized
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-xs font-body text-center text-on-surface-variant leading-relaxed">
                  Abre tu app DeUna, escanea el código y confirma el monto.
                </p>
              </div>
            </section>

            {/* ============ TRANSFERENCIA BANCARIA ============ */}
            <section className="flex flex-col gap-4 p-5 lg:p-7 rounded-3xl bg-surface-container-lowest shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-secondary-container text-on-surface flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">account_balance</span>
                  </div>
                  <h2 className="text-lg font-headline font-bold text-on-surface">Transferencia bancaria</h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-label uppercase font-bold bg-surface-container text-on-surface-variant">
                  Nacional
                </span>
              </div>

              <dl className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-surface-container-low">
                  <dt className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider">
                    Banco
                  </dt>
                  <dd data-testid="pago-banco" className="text-sm font-headline font-bold text-on-surface text-right">
                    {pago.banco}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-surface-container-low">
                  <dt className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider">
                    Tipo de cuenta
                  </dt>
                  <dd
                    data-testid="pago-tipo-cuenta"
                    className="text-sm font-headline font-bold text-on-surface text-right"
                  >
                    {pago.tipoCuenta}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-surface-container">
                  <div className="flex flex-col min-w-0">
                    <dt className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider">
                      Número de cuenta
                    </dt>
                    <dd
                      data-testid="pago-numero-cuenta"
                      className="text-base font-headline font-bold text-on-surface tracking-wider font-mono break-all"
                    >
                      {pago.numeroCuenta}
                    </dd>
                  </div>
                  <CopyButton
                    value={pago.numeroCuenta}
                    variant="primary"
                    ariaLabel="Copiar número de cuenta"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-surface-container-low">
                  <dt className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider">
                    Titular
                  </dt>
                  <dd data-testid="pago-titular" className="text-sm font-headline font-bold text-on-surface text-right">
                    {pago.titular}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-surface-container-low">
                  <div className="flex flex-col min-w-0">
                    <dt className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider">
                      RUC
                    </dt>
                    <dd
                      data-testid="pago-ruc"
                      className="text-sm font-body font-mono text-on-surface tracking-wide break-all"
                    >
                      {pago.ruc}
                    </dd>
                  </div>
                  <CopyButton value={pago.ruc} ariaLabel="Copiar RUC" />
                </div>
              </dl>
            </section>
          </div>

          {/* ============ CLOSING NOTE + SEND THE RECEIPT ============ */}
          <section className="flex flex-col gap-4 p-5 lg:p-6 rounded-3xl bg-surface-container shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">chat</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-label uppercase tracking-wider font-bold text-[#875d00]">
                  Confirmación
                </span>
                <p data-testid="pago-nota" className="text-sm font-headline font-semibold text-on-surface leading-snug">
                  {pago.nota}
                </p>
              </div>
            </div>
            <a
              data-testid="pago-enviar-comprobante"
              href={comprobanteHref}
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 w-full rounded-xl bg-primary-container hover:brightness-95 text-on-primary-container font-headline font-bold flex items-center justify-center gap-2.5 transition-colors shadow-sm text-sm"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
              <span>Enviar comprobante por WhatsApp</span>
            </a>
          </section>
        </div>
      </main>

      <Footer copy={footer} />
    </>
  )
}
