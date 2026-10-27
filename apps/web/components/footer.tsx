import Link from "next/link"
import { LegalModal } from "@/components/legal/legal-modal"
import type { FooterProps } from "@/lib/site-copy"
import { whatsappLink } from "@/lib/store-info"

/**
 * The footer takes its copy as a prop rather than reading it itself, because the same component has to
 * work in two places: pages pass `resolveFooterProps()` so the CMS drives it, and loading skeletons pass
 * `footerDefaults()` so a skeleton never waits on a fetch.
 *
 * `copy.email` and `copy.branches` come from the `contacto` global (see `FooterProps`) — the store's
 * phone numbers and address exist once, in one editable place.
 */
export function Footer({ copy }: { copy: FooterProps }) {
  const year = new Date().getFullYear()
  const [matriz, sucursal] = copy.branches

  return (
    <footer className="bg-primary text-primary-foreground pt-14 pb-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <span aria-hidden className="wasi-logo text-primary-foreground h-9 block" />
            <p className="text-sm text-primary-foreground leading-relaxed mt-3">{copy.brandBlurb}</p>
          </div>

          {/* Navegación */}
          <div>
            <h4 className="font-headline uppercase tracking-wider font-bold text-xs text-primary-foreground mb-4">
              Navegación
            </h4>
            <ul className="flex flex-col gap-2.5">
              {copy.navigation.map((item) => (
                <li key={`${item.path}-${item.label}`}>
                  <Link
                    href={item.path}
                    className="text-sm font-semibold text-primary-foreground hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal — the label is editable and the destination is a document id, so the CMS can rename a
              link without knowing where it points. `LegalModal` renders a real `<a href="/legal/…">` and
              intercepts the click to open the document in a window; when JavaScript is unavailable the
              anchor still lands on a readable page. See ticket 27. */}
          <div>
            <h4 className="font-headline uppercase tracking-wider font-bold text-xs text-primary-foreground mb-4">
              Legal
            </h4>
            <ul className="flex flex-col gap-2.5">
              {copy.legal.map((item) => (
                <li key={item.document}>
                  <LegalModal
                    doc={item.document}
                    className="text-sm font-semibold text-primary-foreground hover:underline"
                  >
                    {item.label}
                  </LegalModal>
                </li>
              ))}
            </ul>
          </div>

          {/* Ubicación */}
          <div>
            <h4 className="font-headline uppercase tracking-wider font-bold text-xs text-primary-foreground mb-4">
              Ubicación
            </h4>
            <p className="text-sm text-primary-foreground leading-relaxed mb-2">
              {copy.location.city}
              <br />
              {copy.location.branchesLine}
            </p>
            <p className="text-sm text-primary-foreground leading-relaxed">
              <a data-testid="footer-email" href={`mailto:${copy.email}`} className="hover:underline">
                {copy.email}
              </a>
              <br />
              <a
                data-testid="footer-phone"
                href={whatsappLink(matriz.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {matriz.phoneDisplay}
              </a>
              {sucursal ? (
                <>
                  {" · "}
                  <a
                    href={whatsappLink(sucursal.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {sucursal.phoneDisplay}
                  </a>
                </>
              ) : null}
            </p>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-6 text-center text-xs text-primary-foreground">
          <p>
            &copy; {year} {copy.legalLine}
          </p>
        </div>
      </div>
    </footer>
  )
}
