import type { Metadata } from "next"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ContactForm } from "@/components/contacto/contact-form"
import { SucursalesPanel } from "@/components/contacto/sucursales-panel"
import { PILLARS, STORE, whatsappLink } from "@/lib/store-info"

export const metadata: Metadata = {
  title: "Contacto — Wasi Granel",
  description:
    "Visítanos en Riobamba, escríbenos por WhatsApp o envíanos un mensaje. Envíos a todo el Ecuador con Servientrega.",
}

/**
 * Contacto — ported from the "Contacto y Sucursales" (desktop) and "Contacto Móvil" mockups: the
 * editorial hero with the Andean watermark and the store photo, the tabbed "Nuestras Casas Wasi"
 * panel, and the "Estamos para ayudarte" 5/7 split with the dark WhatsApp card beside the form.
 *
 * Everything the page says about the store comes from lib/store-info.ts. The mockup invented the
 * phone numbers, the addresses, the hours, a Quito branch and the store services — none of that is
 * here. See ticket 15.
 */
export default function ContactoPage() {
  return (
    <>
      <Navigation />

      <main className="w-full pt-20 flex-grow">
        {/* ============ HERO ============ */}
        <section className="relative w-full bg-[#fcf5ed] px-6 lg:px-12 py-12 lg:py-20 overflow-hidden">
          {/* Andean geometric pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none flex items-center justify-center">
            <svg
              className="text-on-surface"
              fill="currentColor"
              height="900"
              viewBox="0 0 100 100"
              width="900"
              aria-hidden="true"
            >
              <polygon points="50,0 100,50 50,100 0,50" />
              <polygon points="50,15 85,50 50,85 15,50" />
              <polygon points="50,30 70,50 50,70 30,50" />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
            {/* Left: message + pillars */}
            <div className="lg:col-span-7 flex flex-col items-start space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#faebd7] text-on-surface text-xs font-semibold uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-[#fcbf00]" />
                {STORE.hero.eyebrow}
              </div>

              <h1 className="font-headline font-bold text-4xl sm:text-5xl lg:text-6xl text-[#241a0d] tracking-tight leading-[1.1]">
                {STORE.hero.titleTop} <br />
                <span className="text-[#875d00]">{STORE.hero.titleAccent}</span>
              </h1>

              <p className="font-body text-base sm:text-lg text-on-surface-variant leading-relaxed max-w-2xl">
                {STORE.hero.body}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-2" data-testid="contact-values">
                {PILLARS.map((p) => (
                  <div
                    key={p.title}
                    className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-2"
                  >
                    <span className="material-symbols-outlined text-[#875d00] text-2xl">{p.icon}</span>
                    <h4 className="font-headline font-bold text-xs uppercase tracking-wider text-[#241a0d]">
                      {p.title}
                    </h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{p.text}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-3">
                <a
                  data-testid="hero-whatsapp"
                  href={whatsappLink(
                    STORE.sucursales[0].whatsapp,
                    "Hola Wasi Granel, quisiera hacer una consulta sobre sus productos...",
                  )}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#fcbf00] text-[#241a0d] font-headline font-bold text-xs uppercase tracking-wider shadow-sm hover:brightness-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[19px]">chat</span>
                  Escríbenos por WhatsApp
                </a>
                <a
                  href="#sucursales"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-surface-container text-[#241a0d] font-headline font-semibold text-xs uppercase tracking-wider hover:bg-surface-container-high transition-all"
                >
                  <span className="material-symbols-outlined text-[19px]">storefront</span>
                  Ver Nuestras Sedes
                </a>
              </div>
            </div>

            {/* Right: store photo + badges */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-xl bg-surface-container border border-outline-variant/30">
                <Image
                  src="/images/hero-store-v1.jpg"
                  alt="Interior de Wasi Granel con estantes y frascos de vidrio llenos de semillas y frutos secos"
                  width={900}
                  height={520}
                  priority
                  className="w-full h-[460px] lg:h-[520px] object-cover hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#241a0d]/60 via-transparent to-transparent pointer-events-none" />

                {/* Brand mark */}
                <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-md flex items-center gap-2">
                  <span aria-hidden className="wasi-logo text-primary h-6 block" />
                </div>

                {/* Floating stores badge */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#fcbf00] flex items-center justify-center text-[#241a0d]">
                      <span className="material-symbols-outlined text-xl">location_on</span>
                    </div>
                    <div>
                      <p className="font-headline font-bold text-xs uppercase tracking-wider text-on-surface">
                        {STORE.hero.visitTitle}
                      </p>
                      <p className="font-body text-xs text-on-surface-variant font-medium">{STORE.hero.visitSub}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-bold uppercase rounded-md bg-[#f5dece] text-[#726155]">
                    2 Casas
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ NUESTRAS CASAS WASI (tabbed) ============ */}
        <SucursalesPanel />

        {/* ============ CONTACTO DIRECTO ============ */}
        <section
          id="contacto-directo"
          className="w-full bg-[#faebd7]/40 py-16 lg:py-24 border-t border-outline-variant/30"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              {/* Left: channels */}
              <div className="lg:col-span-5 flex flex-col space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-label uppercase tracking-widest font-bold text-[#875d00]">
                    Canal Directo
                  </span>
                  <h2 className="font-headline font-bold text-3xl sm:text-4xl text-on-surface tracking-tight">
                    Estamos para ayudarte
                  </h2>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Ya sea para consultar existencias de productos específicos, gestionar compras al mayoreo o
                    coordinar pedidos a cualquier rincón del Ecuador.
                  </p>
                </div>

                {/* Dark WhatsApp card */}
                <div className="p-6 sm:p-7 rounded-3xl bg-[#241a0d] text-[#fff8f4] shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-widest font-label font-bold text-[#fcbf00]">
                      Respuesta Rápida
                    </span>
                    <span className="material-symbols-outlined text-[#fcbf00] text-2xl">chat</span>
                  </div>
                  <h3 className="font-headline font-bold text-xl text-white">Atención Inmediata por WhatsApp</h3>
                  <p className="text-xs text-[#d8c3b3] leading-relaxed">
                    Conéctate directamente con nuestro equipo de atención en tienda. Respondemos en minutos durante
                    horario comercial.
                  </p>
                  <a
                    data-testid="help-whatsapp"
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-[#fcbf00] text-[#241a0d] font-headline font-bold text-xs uppercase tracking-wider hover:brightness-95 shadow-sm transition-all"
                    href={whatsappLink(
                      STORE.sucursales[0].whatsapp,
                      "Hola Wasi Granel, quiero hacer un pedido o consulta sobre sus productos...",
                    )}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span className="material-symbols-outlined text-base">call</span>
                    {STORE.sucursales[0].phoneDisplay} — Chatear ahora
                  </a>
                </div>

                {/* Email */}
                <div className="p-6 rounded-3xl bg-surface-container-lowest shadow-sm space-y-4 border border-outline-variant/30">
                  <h4 className="font-headline font-bold text-xs text-on-surface uppercase tracking-wider">
                    Correo Electrónico
                  </h4>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-xs text-on-surface-variant">Atención general:</span>
                    <a
                      data-testid="help-email"
                      className="font-semibold text-xs text-on-surface hover:text-[#875d00] transition-colors"
                      href={`mailto:${STORE.email}`}
                    >
                      {STORE.email}
                    </a>
                  </div>
                </div>

                {/* FAQ card */}
                <div className="p-6 rounded-3xl bg-surface-container-lowest shadow-sm border border-outline-variant/30">
                  <div className="flex items-center gap-2 mb-2 text-[#875d00] font-headline font-bold text-xs uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[18px]">help</span>
                    Pregunta Frecuente
                  </div>
                  <p className="font-headline font-bold text-xs text-on-surface">{STORE.faq.q}</p>
                  <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">{STORE.faq.a}</p>
                </div>
              </div>

              {/* Right: the form */}
              <div className="lg:col-span-7">
                <div className="p-8 lg:p-10 rounded-3xl bg-surface-container-lowest shadow-lg border border-outline-variant/30">
                  <div className="mb-8">
                    <span className="text-xs font-label uppercase tracking-widest font-bold text-[#875d00]">
                      Escríbenos
                    </span>
                    <h3 className="font-headline font-bold text-2xl text-on-surface mt-1">Envíanos un mensaje</h3>
                    <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                      Completa el formulario y te responderemos en un lapso máximo de 24 horas laborables.
                    </p>
                  </div>
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
