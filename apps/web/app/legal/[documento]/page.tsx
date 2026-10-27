import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Footer } from "@/components/footer"
import { LegalDocument } from "@/components/legal/legal-document"
import { Navigation } from "@/components/navigation"
import { LEGAL_DOCUMENTS, isLegalDocumentSlug, legalHref } from "@/lib/legal/documents"
import { resolveFooterProps } from "@/lib/site-copy"

/**
 * The legal documents as real pages.
 *
 * This exists for one reason: the footer's links have to be honest. The modal is JavaScript, and a
 * customer who is agreeing to the terms — possibly on a bad mobile connection, which is the whole
 * audience for a shop in Riobamba that sells over WhatsApp — must still be able to read what they are
 * agreeing to. A dead `href="#"` or a JavaScript-only window fails both them and any payment provider
 * that later wants to verify a published terms URL (ticket 23).
 *
 * Static on purpose: no `draftMode()`, no search params, no CMS dependency that could fail the build —
 * `resolveFooterProps()` degrades to its defaults if the CMS is unreachable. The content is the same
 * `LegalDocument` component the modal renders, so the two can never drift.
 */
export function generateStaticParams() {
  return Object.keys(LEGAL_DOCUMENTS).map((documento) => ({ documento }))
}

/**
 * The set of documents is closed, so an unknown one must be a real 404 rather than an on-demand render
 * that calls `notFound()`. Without this, `/legal/anything` resolves the route, runs the page and serves
 * the not-found BODY with a 200 status — which a crawler or a payment provider checking that our terms
 * URL is valid would read as a working page.
 */
export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ documento: string }>
}): Promise<Metadata> {
  const { documento } = await params
  if (!isLegalDocumentSlug(documento)) return {}

  const doc = LEGAL_DOCUMENTS[documento]
  return {
    title: `${doc.title} — Wasi Granel`,
    description: doc.summary,
    alternates: { canonical: legalHref(doc.slug) },
  }
}

export default async function LegalPage({ params }: { params: Promise<{ documento: string }> }) {
  const { documento } = await params
  if (!isLegalDocumentSlug(documento)) notFound()

  const doc = LEGAL_DOCUMENTS[documento]
  const footer = await resolveFooterProps()

  return (
    <>
      <Navigation />

      <main className="w-full pt-20 flex-grow">
        <section className="w-full bg-background px-6 lg:px-12 py-12 lg:py-16">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-deep-amber mb-3">Legal</p>
            <h1 className="font-headline text-3xl lg:text-4xl font-bold text-[#544738] mb-2">
              {doc.title}
            </h1>
            <p className="text-sm text-secondary mb-8">Última actualización: {doc.updated}</p>

            <div className="bg-card border border-[#ead7c3] rounded-3xl p-6 lg:p-8">
              <LegalDocument slug={doc.slug} />
            </div>
          </div>
        </section>
      </main>

      <Footer copy={footer} />
    </>
  )
}
