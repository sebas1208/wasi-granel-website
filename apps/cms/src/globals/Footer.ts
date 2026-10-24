import type { GlobalConfig } from 'payload'

import { revalidateGlobals } from '../hooks/revalidateStorefront'

/**
 * Footer — the site-wide footer copy (ticket 19).
 *
 * Deliberately NOT here:
 *  - **The store addresses and phone numbers.** Those live in the `contacto` global so there is one
 *    place to correct them; the footer reads them from there. Duplicating them would recreate exactly
 *    the problem `lib/store-info.ts` was created to solve (invented/stale contact data in two places).
 *  - **The legal documents.** The links carry a `document` selector, not a URL — the modal that renders
 *    the text is ticket 27's reusable component.
 *  - The column headings ("Navegación" / "Legal" / "Ubicación"), which are structural labels rather
 *    than content.
 */
export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Pie de página',
  admin: {
    group: 'Contenido del sitio',
    description: 'El pie de página, que aparece en todas las páginas del sitio.',
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  hooks: {
    afterChange: [revalidateGlobals],
  },
  fields: [
    {
      name: 'brandBlurb',
      type: 'textarea',
      required: true,
      label: 'Descripción de la marca',
      admin: { description: 'El texto bajo el logo, en la primera columna.' },
    },
    {
      name: 'navigation',
      type: 'array',
      required: true,
      minRows: 1,
      label: 'Enlaces de navegación',
      labels: { singular: 'Enlace', plural: 'Enlaces' },
      admin: {
        description:
          'Los enlaces de la columna "Navegación". El destino se elige de una lista para que no se pueda romper; solo cambia el texto visible.',
      },
      fields: [
        { name: 'label', type: 'text', required: true, label: 'Texto del enlace' },
        {
          name: 'path',
          type: 'select',
          required: true,
          label: 'Destino',
          options: [
            { label: 'Inicio', value: '/' },
            { label: 'Tienda', value: '/tienda' },
            { label: 'Contacto', value: '/contacto' },
          ],
        },
      ],
    },
    {
      name: 'legal',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 3,
      label: 'Enlaces legales',
      labels: { singular: 'Documento legal', plural: 'Documentos legales' },
      admin: {
        description:
          'Los documentos de la columna "Legal". Se abren en una ventana dentro del sitio; el texto lo define el ticket 27.',
      },
      fields: [
        { name: 'label', type: 'text', required: true, label: 'Texto del enlace' },
        {
          name: 'document',
          type: 'select',
          required: true,
          label: 'Documento',
          options: [
            { label: 'Términos y Condiciones', value: 'terms' },
            { label: 'Política de Privacidad', value: 'privacy' },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'location',
      label: 'Ubicación',
      admin: {
        description:
          'Solo la ciudad y el resumen de sedes. Las direcciones y teléfonos completos se editan en "Contacto y sucursales".',
      },
      fields: [
        { name: 'city', type: 'text', required: true, label: 'Ciudad' },
        {
          name: 'branchesLine',
          type: 'text',
          required: true,
          label: 'Resumen de sedes',
          admin: { description: 'Ej. "Matriz · Sucursal".' },
        },
      ],
    },
    {
      name: 'legalLine',
      type: 'text',
      required: true,
      label: 'Línea de copyright',
      admin: {
        description: 'El texto pequeño al final del pie. El año se añade automáticamente, no lo escribas.',
      },
    },
  ],
}
