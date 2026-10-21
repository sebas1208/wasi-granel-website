"use client"

import { useState } from "react"
import { PrivacyModal } from "./privacy-modal"
import { STORE, whatsappLink } from "@/lib/store-info"

/**
 * Contact form from the "Contacto y Sucursales" mockup.
 *
 * The receiver is NOT wired yet — that is ticket 25 (the owner has a Resend account; the sending
 * domain needs verifying first). Until then this form must never claim the message was received:
 * it validates properly, and a valid submit lands in an honest "not connected yet" state that points
 * at the store's real WhatsApp channel. No "¡Mensaje recibido con éxito!" over nothing.
 */
const CONSULTAS = [
  "Información general de productos",
  "Venta al por mayor / Negocios",
  "Soy productor agroecológico",
  "Talleres y charlas",
]

type Errors = Partial<Record<"name" | "phone" | "email" | "message" | "consent", string>>

const inputCls =
  "w-full py-2.5 px-3.5 text-sm text-on-surface bg-surface border border-[#d3c5ab] rounded-xl outline-none focus:border-deep-amber focus:ring-1 focus:ring-deep-amber/30 transition-all placeholder:text-muted-foreground"

export function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    sucursal: STORE.sucursales[0].short,
    consulta: CONSULTAS[0],
    message: "",
    consent: false,
  })
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false)

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  function validate(): Errors {
    const e: Errors = {}
    if (!form.name.trim()) e.name = "Escribe tu nombre."
    if (form.phone.replace(/\D/g, "").length < 7) e.phone = "Escribe un teléfono o WhatsApp válido."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Escribe un correo válido."
    if (!form.message.trim()) e.message = "Cuéntanos en qué podemos ayudarte."
    if (!form.consent) e.consent = "Necesitamos tu consentimiento para responderte."
    return e
  }

  function onSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) return
    // Deliberately does NOT claim success — see the note above.
    setSubmitted(true)
  }

  return (
    <form data-testid="contact-form" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="c-name" className="block text-xs font-bold text-secondary mb-1.5">
            Nombre completo *
          </label>
          <input
            id="c-name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "err-name" : undefined}
            placeholder="Ej. Camila Morales"
            className={inputCls}
          />
          {errors.name && (
            <p id="err-name" role="alert" data-testid="error-name" className="mt-1 text-[11px] font-semibold text-destructive">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="c-phone" className="block text-xs font-bold text-secondary mb-1.5">
            Teléfono / WhatsApp *
          </label>
          <input
            id="c-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "err-phone" : undefined}
            placeholder="Ej. 099 999 9999"
            className={inputCls}
          />
          {errors.phone && (
            <p id="err-phone" role="alert" data-testid="error-phone" className="mt-1 text-[11px] font-semibold text-destructive">
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="c-email" className="block text-xs font-bold text-secondary mb-1.5">
          Correo electrónico *
        </label>
        <input
          id="c-email"
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "err-email" : undefined}
          placeholder="tu@correo.com"
          className={inputCls}
        />
        {errors.email && (
          <p id="err-email" role="alert" data-testid="error-email" className="mt-1 text-[11px] font-semibold text-destructive">
            {errors.email}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="c-sucursal" className="block text-xs font-bold text-secondary mb-1.5">
            Sucursal de interés
          </label>
          <select id="c-sucursal" value={form.sucursal} onChange={(e) => set("sucursal", e.target.value)} className={inputCls}>
            {STORE.sucursales.map((s) => (
              <option key={s.id} value={s.short}>
                {s.short}
              </option>
            ))}
            <option value="Ambas sedes">Ambas sedes</option>
            <option value="Envíos nacionales">Envíos nacionales</option>
          </select>
        </div>

        <div>
          <label htmlFor="c-consulta" className="block text-xs font-bold text-secondary mb-1.5">
            Tipo de consulta
          </label>
          <select id="c-consulta" value={form.consulta} onChange={(e) => set("consulta", e.target.value)} className={inputCls}>
            {CONSULTAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="c-message" className="block text-xs font-bold text-secondary mb-1.5">
          Tu mensaje *
        </label>
        <textarea
          id="c-message"
          rows={4}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "err-message" : undefined}
          placeholder="Cuéntanos en qué podemos ayudarte o qué insumos estás buscando..."
          className={`${inputCls} resize-y`}
        />
        {errors.message && (
          <p id="err-message" role="alert" data-testid="error-message" className="mt-1 text-[11px] font-semibold text-destructive">
            {errors.message}
          </p>
        )}
      </div>

      <div>
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            id="c-consent"
            type="checkbox"
            checked={form.consent}
            onChange={(e) => set("consent", e.target.checked)}
            aria-invalid={!!errors.consent}
            className="mt-0.5 w-4 h-4 shrink-0 accent-[#785a00]"
          />
          <span className="text-[11px] text-secondary leading-relaxed">
            Acepto el tratamiento de mis datos de contacto para recibir una respuesta a mi requerimiento, según el{" "}
            <PrivacyModal>
              <button type="button" data-testid="privacy-trigger" className="font-bold text-deep-amber underline hover:no-underline">
                tratamiento de datos
              </button>
            </PrivacyModal>{" "}
            de Wasi Granel.
          </span>
        </label>
        {errors.consent && (
          <p role="alert" data-testid="error-consent" className="mt-1 text-[11px] font-semibold text-destructive">
            {errors.consent}
          </p>
        )}
      </div>

      <button
        type="submit"
        data-testid="contact-submit"
        className="w-full sm:w-auto sm:self-start py-3 px-6 rounded-xl bg-[#fcbf00] hover:bg-[#fabd00] text-[#544738] font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all"
      >
        <span className="material-symbols-outlined text-[18px]">send</span>
        Enviar mensaje
      </button>

      {/* Honest interim state: the receiver is ticket 25. Never claim the message was received. */}
      {submitted && (
        <div
          data-testid="contact-not-wired"
          role="status"
          className="bg-surface-container-low border border-[#ead7c3] rounded-2xl p-4 flex items-start gap-3"
        >
          <span className="material-symbols-outlined text-[20px] text-deep-amber shrink-0">info</span>
          <div className="text-xs text-secondary leading-relaxed">
            <p className="font-bold text-on-surface mb-1">Este formulario todavía no está conectado.</p>
            <p>
              Mientras lo terminamos, escríbenos directamente por WhatsApp y te respondemos al toque.
            </p>
            <a
              href={whatsappLink(STORE.sucursales[0].whatsapp, "Hola Wasi Granel, quisiera hacer una consulta")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 font-bold text-deep-amber hover:underline"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              Escribir por WhatsApp
            </a>
          </div>
        </div>
      )}
    </form>
  )
}
