"use client"

import type { CategoryWithCount } from "@/components/home/category-grid"
import { HomeSections } from "@/components/home/home-sections"
import type { Product } from "@/lib/payload"
import type { InicioCopy } from "@/lib/site-copy"
import { useGlobalLivePreview } from "@/lib/use-global-live-preview"

/**
 * The homepage as the Live Preview pane renders it (ticket 19).
 *
 * Mounted ONLY when the editor has the pane open (see the `draft` branch in app/page.tsx): `draft` is a
 * server-read cookie, so a visitor's render takes the plain server-component branch and this component is
 * not in their tree, so its listener never attaches. (Verified: neither this component nor
 * FooterLivePreview appears anywhere in the public page's payload, and both appear in the draft-mode
 * one.) Note the shared vendor chunk still CONTAINS the live-preview protocol for everyone — that is a
 * bundling detail, not a behaviour: what matters is whether the hook is mounted.
 *
 * It listens for the unsaved form state the CMS posts from its side of the iframe, which is what makes
 * edits appear as the owner TYPES rather than only after a save. The catalogue sections (`popular`,
 * `categories`) still come from the server — they are not part of the global being edited.
 */
export function HomeLivePreview({
  serverCopy,
  popular,
  categories,
}: {
  serverCopy: InicioCopy
  popular: Product[]
  categories: CategoryWithCount[]
}) {
  const data = useGlobalLivePreview<InicioCopy>({
    initialData: serverCopy,
    globalSlug: "inicio",
  })

  return <HomeSections copy={data} popular={popular} categories={categories} />
}
