"use client"

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

/**
 * Privacy statement as a modal (user decision: a simple modal with plain wording, not a new page —
 * so the form's consent checkbox references something that actually exists).
 *
 * Plain-language draft, not legal advice — review before relying on it.
 */
export function PrivacyModal({ children, email }: { children: React.ReactNode; email: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        data-testid="privacy-modal"
        className="sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border border-outline-variant"
      >
        <DialogTitle className="font-headline text-xl font-bold text-[#544738]">
          Tratamiento de datos
        </DialogTitle>
        <DialogDescription className="sr-only">
          Cómo usamos los datos que envías en el formulario de contacto.
        </DialogDescription>

        <div className="flex flex-col gap-3 text-xs sm:text-sm text-secondary leading-relaxed">
          <p>
            Cuando completas el formulario de contacto nos envías tu nombre, tu teléfono o WhatsApp, tu
            correo electrónico y el mensaje. Usamos esos datos <strong>únicamente para responderte</strong>.
          </p>
          <p>
            No los compartimos con terceros ni los usamos para publicidad. Los conservamos solo el tiempo
            necesario para atender tu consulta.
          </p>
          <p>
            Puedes pedirnos que los eliminemos en cualquier momento escribiendo a{" "}
            <a className="font-bold text-deep-amber hover:underline" href={`mailto:${email}`}>
              {email}
            </a>
            .
          </p>
          <p className="text-[11px] text-muted-foreground">
            Este texto es un resumen en lenguaje simple de cómo tratamos tus datos de contacto.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
