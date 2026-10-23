"use client"

import { useState } from "react"
import { HOURS, STORE, storeEmbedUrl, whatsappLink } from "@/lib/store-info"

/**
 * "Nuestras Casas Wasi" — the tabbed store panel from the "Contacto y Sucursales" mockup: a tab
 * switcher, a 5-column info card, and a 7-column map, all toggling together. (The mockup's map was
 * an illustration; this uses the store's real Google listing.)
 *
 * The mockup's tabs were "1. Riobamba (Matriz)" / "2. Quito (La Floresta)". Quito does not exist — the
 * owner has TWO stores in Riobamba — so the tabs are Matriz and Sucursal, and the Quito map (and the
 * invented Quito address, hours and phone that went with it) is gone.
 */
export function SucursalesPanel() {
  const [active, setActive] = useState(STORE.sucursales[0].id)
  const s = STORE.sucursales.find((x) => x.id === active) ?? STORE.sucursales[0]

  return (
    <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24" id="sucursales">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-3 mb-12">
        <span className="text-xs font-label uppercase tracking-widest font-bold text-[#875d00]">
          Encuéntranos en Ecuador
        </span>
        <h2 className="font-headline font-bold text-3xl lg:text-4xl text-on-surface tracking-tight">
          Nuestras Casas Wasi
        </h2>
        <p className="font-body text-sm sm:text-base text-on-surface-variant">
          Ven con tus propios recipientes o utiliza nuestros envases de vidrio reciclable. En nuestras tiendas te
          asesoramos en tu despensa a granel.
        </p>

        {/* Selector de sucursal */}
        <div
          className="flex p-1.5 rounded-xl bg-surface-container mt-4 gap-2 border border-outline-variant/30"
          role="tablist"
          data-testid="sucursal-tabs"
        >
          {STORE.sucursales.map((x) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              id={`tab-btn-${x.id}`}
              aria-selected={active === x.id}
              aria-controls={`card-${x.id}`}
              onClick={() => setActive(x.id)}
              className={`px-5 py-2.5 rounded-lg font-headline font-bold text-xs uppercase tracking-wider transition-all ${
                active === x.id
                  ? "bg-surface-container-lowest text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {x.tabLabel}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Info card */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div
            id={`card-${s.id}`}
            role="tabpanel"
            aria-labelledby={`tab-btn-${s.id}`}
            data-testid="sucursal-card"
            data-sucursal={s.id}
            className="p-6 sm:p-8 rounded-3xl bg-[#fff5ea] border border-outline-variant/30 shadow-sm transition-all duration-300"
          >
            <div className="flex items-center justify-between pb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-label uppercase font-bold tracking-wider text-[#875d00]">
                <span className="w-2 h-2 rounded-full bg-[#875d00] animate-pulse" />
                {s.badge}
              </span>
              <span className="text-xs text-on-surface-variant font-medium bg-white px-2.5 py-1 rounded-md border border-outline-variant/20">
                {s.region}
              </span>
            </div>

            <h3 className="font-headline font-bold text-2xl text-on-surface mb-2">{s.name}</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">{s.description}</p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0 text-[#875d00]">
                  <span className="material-symbols-outlined text-[20px]">pin_drop</span>
                </div>
                <div>
                  <p className="text-xs uppercase font-label font-bold text-on-surface">Dirección</p>
                  <p data-testid="sucursal-address" className="text-sm text-on-surface-variant">
                    {s.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0 text-[#875d00]">
                  <span className="material-symbols-outlined text-[20px]">alarm</span>
                </div>
                <div>
                  <p className="text-xs uppercase font-label font-bold text-on-surface">Horario de Atención</p>
                  <p data-testid="sucursal-hours" className="text-sm text-on-surface-variant">
                    {HOURS[0]}
                  </p>
                  <p className="text-xs text-on-surface-variant/80">{HOURS[1]}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0 text-[#875d00]">
                  <span className="material-symbols-outlined text-[20px]">phone_iphone</span>
                </div>
                <div>
                  <p className="text-xs uppercase font-label font-bold text-on-surface">Teléfono / WhatsApp</p>
                  <a
                    data-testid="sucursal-phone"
                    className="text-sm font-semibold text-[#875d00] hover:underline"
                    href={whatsappLink(s.whatsapp, `Hola ${s.name}, quisiera consultar sobre...`)}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {s.phoneDisplay}
                  </a>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="mt-6 pt-6 border-t border-outline-variant/30 flex flex-wrap gap-2">
              {s.services.map((sv) => (
                <span
                  key={sv}
                  className="text-xs px-2.5 py-1 rounded-md bg-white text-on-surface font-medium flex items-center gap-1 border border-outline-variant/20"
                >
                  <span className="material-symbols-outlined text-[15px] text-[#875d00]">check_circle</span>
                  {sv}
                </span>
              ))}
            </div>

            <div className="mt-6">
              <a
                href={s.placeUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="sucursal-directions"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-surface-container-highest hover:bg-[#fcbf00] text-on-surface hover:text-[#241a0d] font-headline font-bold text-xs uppercase tracking-wider transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">directions</span>
                Cómo llegar
              </a>
            </div>
          </div>
        </div>

        {/* Real Google map. The mockup drew a stylized SVG illustration whose streets and
            neighbourhoods were invented; this shows the actual listing. */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative w-full h-[420px] lg:h-[510px] rounded-3xl overflow-hidden shadow-md bg-[#eef3f0] border border-outline-variant/30">
            <iframe
              data-testid="store-map"
              title={`Mapa de ${s.name}`}
              src={storeEmbedUrl(s)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full border-0"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
