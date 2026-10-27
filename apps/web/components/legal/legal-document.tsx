import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { LEGAL_DOCUMENTS } from "@/lib/legal/documents"
import type { LegalDocumentSlug } from "@/lib/payload"

/**
 * Renders one legal document.
 *
 * Deliberately a plain component with no server-only APIs, so the SAME instance renders the real page
 * at /legal/[documento] and the modal the footer and the contact form open. That is what stops the page
 * and the window from ever disagreeing about what the customer agreed to.
 *
 * The styling is hand-rolled rather than Tailwind Typography's `prose`, because the project does not
 * install that plugin — and a legal document is the one place where a heading hierarchy that silently
 * falls back to browser defaults is a real accessibility problem, not a cosmetic one.
 */
export function LegalDocument({ slug }: { slug: LegalDocumentSlug }) {
  const doc = LEGAL_DOCUMENTS[slug]

  return (
    <article
      data-legal-document={slug}
      className="text-secondary text-sm leading-relaxed [&>*:first-child]:mt-0"
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h2 className="font-headline text-base font-bold text-[#544738] mt-7 mb-2.5 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-headline text-sm font-bold text-[#544738] mt-5 mb-2">{children}</h3>
          ),
          p: ({ children }) => <p className="mb-3">{children}</p>,
          ul: ({ children }) => (
            <ul className="mb-3 flex flex-col gap-1.5 pl-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 flex flex-col gap-1.5 pl-5 list-decimal">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="relative pl-4 before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:rounded-full before:bg-deep-amber">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-[#544738]">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ href, children }) => (
            <a className="font-semibold text-deep-amber hover:underline" href={href}>
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="mb-3 overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-[#ead7c3] py-2 pr-3 font-bold text-[#544738]">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border-b border-[#ead7c3]/60 py-2 pr-3 align-top">{children}</td>
          ),
          hr: () => <hr className="my-4 border-[#ead7c3]" />,
        }}
      >
        {doc.body}
      </Markdown>
    </article>
  )
}
