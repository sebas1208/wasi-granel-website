"use client"

import { useState } from "react"
import { LegalModal } from "@/components/legal/legal-modal"

/**
 * The contact form from the "Contacto y Sucursales" mockup — its field ids, labels, spacing and input
 * styling are ported as-is.
 *
 * The receiver is NOT wired yet — that is ticket 25 (the owner has a Resend account; the sending
 * domain needs verifying first). The mockup reveals a hidden "¡Mensaje recibido con éxito!" block on
 * submit, but nothing is behind it, so this form must never claim the message was received: it
 * validates properly, and a valid submit lands in an honest "not connected yet" state that points at
 * the store's real WhatsApp channel.
 */
const SUBJECTS = [
  { v: "general", l: "Información General de Productos" },
  { v: "mayor", l: "Venta al por mayor / Negocios" },
  { v: "proveedor", l: "Soy Productor Agroecológico" },
  { v: "talleres", l: "Talleres y Charlas" },
]

type Errors = Partial<Record<"name" | "phone" | "email" | "message" | "consent", string>>

const field =
  "w-full px-4 py-3 rounded-xl bg-[#fff5ea] text-on-surface placeholder:text-outline/70 text-sm focus:outline-none focus:ring-2 focus:ring-[#fcbf00] border border-outline-variant/30 transition-all"
const labelCls = "block font-label text-xs uppercase tracking-wider font-bold text-on-surface"

export function ContactForm({
  whatsappHref,
}: {
  /** Pre-built WhatsApp deep link for the fallback path (the form has no receiver yet — ticket 25). */
  whatsappHref: string
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    subject: SUBJECTS[0].v,
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

  const err = (k: keyof Errors, id: string) =>
    errors[k] ? (
      <p id={id} role="alert" data-testid={`error-${k}`} className="text-[11px] font-semibold text-error">
        {errors[k]}
      </p>
    ) : null

  return (
    <form id="contact-form" data-testid="contact-form" onSubmit={onSubmit} noValidate className="space-y-5">
      {/* Nombre y Teléfono */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelCls} htmlFor="full-name">
            Nombre Completo <span className="text-error">*</span>
          </label>
          <input
            className={field}
            id="full-name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "err-name" : undefined}
            placeholder="Ej. Camila Morales"
            type="text"
          />
          {err("name", "err-name")}
        </div>

        <div className="space-y-1.5">
          <label className={labelCls} htmlFor="contact-phone">
            Teléfono / WhatsApp <span className="text-error">*</span>
          </label>
          <input
            className={field}
            id="contact-phone"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "err-phone" : undefined}
            placeholder="Ej. +593 9 9999 9999"
            type="tel"
          />
          {err("phone", "err-phone")}
        </div>
      </div>

      {/* Correo */}
      <div className="space-y-1.5">
        <label className={labelCls} htmlFor="contact-email">
          Correo Electrónico <span className="text-error">*</span>
        </label>
        <input
          className={field}
          id="contact-email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "err-email" : undefined}
          placeholder="tu@correo.com"
          type="email"
        />
        {err("email", "err-email")}
      </div>

      {/* Tipo de Consulta. ("Sucursal de Interés" was removed at the owner's request.) */}
      <div className="space-y-1.5">
        <label className={labelCls} htmlFor="subject-select">
          Tipo de Consulta
        </label>
        <select
          className={field}
          id="subject-select"
          value={form.subject}
          onChange={(e) => set("subject", e.target.value)}
        >
          {SUBJECTS.map((s) => (
            <option key={s.v} value={s.v}>
              {s.l}
            </option>
          ))}
        </select>
      </div>

      {/* Mensaje */}
      <div className="space-y-1.5">
        <label className={labelCls} htmlFor="contact-message">
          Tu Mensaje <span className="text-error">*</span>
        </label>
        <textarea
          className={field}
          id="contact-message"
          rows={4}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "err-message" : undefined}
          placeholder="Cuéntanos en qué podemos ayudarte o qué insumos estás buscando..."
        />
        {err("message", "err-message")}
      </div>

      {/* Consentimiento */}
      <div className="flex items-start gap-2.5 pt-1">
        <input
          className="mt-1 w-4 h-4 rounded text-[#fcbf00] focus:ring-[#fcbf00] accent-[#fcbf00] cursor-pointer"
          id="privacy-policy"
          type="checkbox"
          checked={form.consent}
          onChange={(e) => set("consent", e.target.checked)}
          aria-invalid={!!errors.consent}
        />
        <label className="text-xs text-on-surface-variant leading-relaxed" htmlFor="privacy-policy">
          Acepto el tratamiento de mis datos de contacto para recibir una respuesta a mi requerimiento, según el{" "}
          <LegalModal
            doc="privacy"
            className="font-bold text-[#875d00] underline hover:no-underline"
          >
            tratamiento de datos
          </LegalModal>{" "}
          de Wasi Granel.
        </label>
      </div>
      {err("consent", "err-consent")}

      {/* Botón de envío */}
      <button
        className="w-full py-3.5 px-6 rounded-xl bg-[#fcbf00] text-[#241a0d] font-headline font-bold text-xs uppercase tracking-wider hover:brightness-95 shadow-md transition-all flex items-center justify-center gap-2"
        type="submit"
        data-testid="contact-submit"
      >
        <span className="material-symbols-outlined text-[19px]">send</span>
        Enviar Mensaje
      </button>

      {/* The mockup reveals a hidden "¡Mensaje recibido con éxito!" block here. Nothing is behind it,
          so this honest interim state replaces it until ticket 25 wires a real receiver. */}
      {submitted && (
        <div
          data-testid="contact-not-wired"
          role="status"
          className="p-4 rounded-xl bg-secondary-container text-on-secondary-container flex items-start gap-3 border border-outline-variant/30"
        >
          <span className="material-symbols-outlined text-2xl text-[#875d00] shrink-0">info</span>
          <div className="text-xs leading-relaxed">
            <p className="font-bold">Este formulario todavía no está conectado.</p>
            <p className="mt-0.5">Mientras lo terminamos, escríbenos directamente por WhatsApp.</p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-flex items-center gap-1.5 font-bold text-[#875d00] hover:underline"
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
