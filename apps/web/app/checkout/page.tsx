import type { Metadata } from "next"
import { draftMode } from "next/headers"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { RefreshRouteOnSave } from "@/components/refresh-route-on-save"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { resolveContacto, resolveFooterProps } from "@/lib/site-copy"

export const metadata: Metadata = {
  title: "Finalizar pedido — Wasi Granel",
  description:
    "Completa tus datos de entrega y confirmamos tu pedido por WhatsApp. No se realiza ningún pago en este sitio.",
}

/**
 * Finalizar pedido — the checkout, ported from the owner's Stitch "Finalizar Pedido" screens (desktop +
 * mobile). The form and the cart summary are a client component because the cart is localStorage state
 * (lib/cart.ts); this page only resolves the store's real contact details and footer copy.
 *
 * Deliberately NOT rendered, because the mockups invented them and the owner confirmed they are wrong:
 *   - any bank details (account number, RUC, "Wasi Granel S.A.S.") — the customer chooses how to pay in
 *     the WhatsApp conversation, so no payment data appears here at all
 *   - a Quito branch in the footer (there is no Quito branch; both stores are in Riobamba)
 *   - the mockup's placeholder prices and its invented "Envases retornables" line — the real cart
 *     supplies every line and total
 *   - the placeholder customer name, the conflicting copyright years, and the "Menos de 2 minutos"
 *     style promises — none of those exist here
 *
 * What IS kept from the mockups: the two zone options verbatim, the field labels, both consent boxes
 * unticked, the "Confirmar pedido" CTA, the reassurance line, the amber shipping callout and the
 * three numbered steps on the confirmation screen.
 */
export default async function CheckoutPage() {
  const { isEnabled: draft } = await draftMode()
  const [contacto, footer] = await Promise.all([
    resolveContacto({ draft }),
    resolveFooterProps({ draft }),
  ])

  // The Matriz line — the store's real WhatsApp, the one the navbar and footer already use.
  const matriz = contacto.branches[0]

  return (
    <>
      <Navigation />
      {draft ? <RefreshRouteOnSave /> : null}

      <main className="w-full pt-20 flex-grow">
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          {/* ============ PAGE HEAD ============ */}
          <header className="mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold tracking-wider uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Compra al peso exacto
            </div>
            <h1 className="font-headline font-bold text-3xl sm:text-4xl lg:text-5xl text-on-surface tracking-tight leading-tight">
              Finalizar pedido
            </h1>
            <div className="mt-3 flex items-start sm:items-center gap-2.5 text-on-surface-variant text-sm sm:text-base max-w-2xl leading-relaxed">
              <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5 sm:mt-0">
                verified_user
              </span>
              <p>
                No se realiza ningún pago en este sitio. Te escribimos por WhatsApp para confirmar el
                peso, el envío y el pago.
              </p>
            </div>
          </header>

          <CheckoutForm
            whatsappNumber={matriz.whatsapp}
            whatsappDisplay={matriz.phoneDisplay}
          />
        </div>
      </main>

      <Footer copy={footer} />
    </>
  )
}
