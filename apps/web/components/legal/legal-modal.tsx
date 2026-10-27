"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { LegalDocument } from "./legal-document"
import { LEGAL_DOCUMENTS, legalHref } from "@/lib/legal/documents"
import type { LegalDocumentSlug } from "@/lib/payload"

/**
 * Opens a legal document in a window — the behaviour the footer's "Legal" column promises (the Payload
 * `footer` global literally describes it as "se abren en una ventana dentro del sitio").
 *
 * **Why this is an `<a>` and not a DialogTrigger.** The link must work on its own: with JavaScript
 * unavailable or broken, clicking it has to land on a real, readable page. So the anchor carries a real
 * `href` to /legal/[documento], and JavaScript only *intercepts* the click to open the window instead.
 * Nesting the anchor inside a `DialogTrigger asChild` would leave the navigation to win and bounce the
 * visitor off the page.
 *
 * Modifier-clicks are left alone on purpose, so "open in new tab" and the context menu still behave the
 * way a link should.
 *
 * Takes a slug rather than being footer-specific, because checkout (ticket 23) needs the same window for
 * the terms at the point of purchase.
 */
export function LegalModal({
  doc,
  className,
  children,
}: {
  doc: LegalDocumentSlug
  className?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const legalDoc = LEGAL_DOCUMENTS[doc]

  return (
    <>
      <a
        href={legalHref(doc)}
        data-legal-doc={doc}
        aria-haspopup="dialog"
        className={className}
        onClick={(e) => {
          // Let the browser handle anything that is not a plain left-click.
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
          e.preventDefault()
          setOpen(true)
        }}
      >
        {children}
      </a>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          data-testid={`legal-modal-${doc}`}
          className="border-outline-variant max-h-[85vh] overflow-y-auto rounded-3xl sm:max-w-2xl"
        >
          <DialogTitle className="font-headline text-xl font-bold text-[#544738]">
            {legalDoc.title}
          </DialogTitle>
          <DialogDescription className="sr-only">{legalDoc.summary}</DialogDescription>

          <div className="-mt-2">
            <p className="text-[11px] text-muted-foreground mb-4">
              Última actualización: {legalDoc.updated}
            </p>
            <LegalDocument slug={doc} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
