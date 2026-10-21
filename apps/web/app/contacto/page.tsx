import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ContactForm } from "@/components/contacto/contact-form"
import { HOURS, STORE, whatsappLink } from "@/lib/store-info"

export const metadata: Metadata = {
  title: "Contacto — Wasi Granel",
  description:
    "Visítanos en Riobamba, escríbenos por WhatsApp o envíanos un mensaje. Envíos a todo el Ecuador con Servientrega.",
}

/**
 * Contacto, from the "Contacto y Sucursales" (desktop) and "Contacto Móvil" mockups.
 *
 * Everything the page says about the store comes from lib/store-info.ts. The mockup invented the
 * phone numbers, the street addresses, the opening hours, a Quito branch that does not exist and the
 * store features — none of that is here. See ticket 15.
 */
const FAQ = [
  {
    q: "¿Hacen envíos a todo el Ecuador?",
    a: `Sí. Despachamos ${STORE.shipping.scope} con ${STORE.shipping.courier}. Coordinamos el envío por WhatsApp una vez confirmado tu pedido.`,
  },
  {
    q: "¿Puedo comprar por peso exacto?",
    a: "Sí, ese es el punto de Wasi Granel: eliges la cantidad que necesitas y la pesamos al momento, sin empaques de un solo uso.",
  },
  {
    q: "¿Puedo llevar mi propio envase?",
    a: "Claro. Trae tu frasco o bolsa reutilizable y llenamos ahí mismo.",
  },
  {
    q: "¿Muelen el café en tienda?",
    a: "Sí, tenemos molino. Trae tu café y lo mueles a tu gusto, o te lo molemos al momento de la compra.",
  },
]

export default function ContactoPage() {
  return (
    <>
      <Navigation />

      <main className="bg-background">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-40 pb-10">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-deep-amber mb-3">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Riobamba, Ecuador
          </span>
          <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface leading-tight mb-3">
            Conectemos desde la raíz
          </h1>
          <p className="text-sm sm:text-base text-secondary max-w-2xl leading-relaxed">
            Dos casas en Riobamba y envíos {STORE.shipping.scope} con {STORE.shipping.courier}. Escríbenos por
            WhatsApp, visítanos o déjanos un mensaje.
          </p>
        </section>

        {/* Value props */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div data-testid="contact-values" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STORE.values.map((v) => (
              <div key={v.title} className="bg-surface-container-lowest border border-[#ead7c3] rounded-2xl p-5">
                <span className="material-symbols-outlined text-[24px] text-deep-amber mb-2 block">{v.icon}</span>
                <h4 className="font-headline font-bold text-on-surface mb-1">{v.title}</h4>
                <p className="text-xs text-secondary leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sucursales */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-1">Nuestras Casas Wasi</h2>
          <p className="text-sm text-secondary mb-6">Las dos están en Riobamba. Pásate cuando quieras.</p>

          <div data-testid="sucursales" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {STORE.sucursales.map((s) => (
              <article
                key={s.id}
                data-testid="sucursal-card"
                data-sucursal={s.id}
                className="bg-surface-container-lowest border border-[#ead7c3] rounded-3xl overflow-hidden flex flex-col"
              >
                <div className="aspect-[16/9] bg-surface-container-low">
                  <iframe
                    title={`Mapa de ${s.name}`}
                    src={s.embedUrl}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full border-0"
                  />
                </div>

                <div className="p-6 flex flex-col gap-4 flex-1">
                  <div>
                    <h3 className="font-headline text-xl font-bold text-on-surface">{s.name}</h3>
                    <p className="text-xs text-secondary mt-1 leading-relaxed">{s.description}</p>
                  </div>

                  <dl className="flex flex-col gap-3 text-xs">
                    <div className="flex gap-2.5">
                      <span className="material-symbols-outlined text-[18px] text-deep-amber shrink-0">pin_drop</span>
                      <div>
                        <dt className="font-bold text-secondary">Dirección</dt>
                        <dd data-testid="sucursal-address" className="text-on-surface">
                          {s.address}
                        </dd>
                      </div>
                    </div>
                    <div className="flex gap-2.5">
                      <span className="material-symbols-outlined text-[18px] text-deep-amber shrink-0">alarm</span>
                      <div>
                        <dt className="font-bold text-secondary">Horario de atención</dt>
                        {HOURS.map((h) => (
                          <dd key={h} data-testid="sucursal-hours" className="text-on-surface">
                            {h}
                          </dd>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2.5">
                      <span className="material-symbols-outlined text-[18px] text-deep-amber shrink-0">
                        phone_iphone
                      </span>
                      <div>
                        <dt className="font-bold text-secondary">Teléfono / WhatsApp</dt>
                        <dd className="text-on-surface">
                          <a
                            data-testid="sucursal-phone"
                            href={whatsappLink(s.whatsapp, `Hola ${s.name}, quisiera consultar sobre...`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-deep-amber transition-colors"
                          >
                            {s.phoneDisplay}
                          </a>
                        </dd>
                      </div>
                    </div>
                  </dl>

                  <ul className="flex flex-wrap gap-2">
                    {s.features.map((f) => (
                      <li
                        key={f}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-[11px] font-semibold text-on-surface"
                      >
                        <span className="material-symbols-outlined text-[14px] text-deep-amber">check_circle</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={s.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#d3c5ab] text-xs font-bold text-on-surface hover:bg-surface-container transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[18px]">directions</span>
                    Cómo llegar
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Help */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-6">Estamos para ayudarte</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest border border-[#ead7c3] rounded-2xl p-6">
              <span className="material-symbols-outlined text-[24px] text-deep-amber mb-2 block">chat</span>
              <h3 className="font-headline font-bold text-on-surface mb-1">Atención inmediata por WhatsApp</h3>
              <p className="text-xs text-secondary mb-3 leading-relaxed">
                La vía más rápida para pedidos y consultas.
              </p>
              <a
                data-testid="help-whatsapp"
                href={whatsappLink(STORE.sucursales[0].whatsapp, "Hola Wasi Granel, quiero hacer un pedido o consulta")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-bold text-xs text-deep-amber hover:underline"
              >
                Escribir ahora
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </a>
            </div>

            <div className="bg-surface-container-lowest border border-[#ead7c3] rounded-2xl p-6">
              <span className="material-symbols-outlined text-[24px] text-deep-amber mb-2 block">mail</span>
              <h3 className="font-headline font-bold text-on-surface mb-1">Correo electrónico</h3>
              <p className="text-xs text-secondary mb-3 leading-relaxed">
                Para consultas que necesitan más detalle.
              </p>
              <a
                data-testid="help-email"
                href={`mailto:${STORE.email}`}
                className="font-bold text-xs text-deep-amber hover:underline"
              >
                {STORE.email}
              </a>
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
          <div className="bg-surface-container-lowest border border-[#ead7c3] rounded-3xl p-6 sm:p-8 max-w-3xl">
            <h2 className="font-headline text-2xl font-bold text-on-surface mb-1">Envíanos un mensaje</h2>
            <p className="text-sm text-secondary mb-6">
              Completa el formulario y te responderemos en un lapso máximo de 24 horas laborables.
            </p>
            <ContactForm />
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-6">Preguntas frecuentes</h2>
          <div data-testid="contact-faq" className="flex flex-col gap-3 max-w-3xl">
            {FAQ.map((f) => (
              <details key={f.q} className="group bg-surface-container-lowest border border-[#ead7c3] rounded-2xl p-5">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-3 font-bold text-sm text-on-surface">
                  {f.q}
                  <span className="material-symbols-outlined text-[20px] text-deep-amber transition-transform group-open:rotate-180">
                    expand_more
                  </span>
                </summary>
                <p className="mt-3 text-xs text-secondary leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
