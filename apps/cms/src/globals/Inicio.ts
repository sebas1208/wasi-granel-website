import type { GlobalConfig } from 'payload'

import { revalidateGlobals } from '../hooks/revalidateStorefront'

/**
 * Inicio — everything the homepage says (ticket 19).
 *
 * Replaces the hardcoded copy in `components/home/*`. The storefront keeps those strings as a
 * fallback, so clearing a field here can never leave the homepage blank.
 *
 * Deliberately NOT here: section headings that are structural rather than content (the footer's
 * "Navegación" / "Legal" / "Ubicación" column labels), and anything already CMS-driven (the category
 * names and product cards come from the catalog itself). The point of this global is the copy the
 * owner would actually want to reword, not every string in the tree.
 */
export const Inicio: GlobalConfig = {
  slug: 'inicio',
  label: 'Página de inicio',
  admin: {
    group: 'Contenido del sitio',
    description:
      'Los textos de la página de inicio. Se publican al pulsar Publicar; guardar solo crea un borrador.',
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
      type: 'group',
      name: 'hero',
      label: 'Encabezado',
      admin: { description: 'La tarjeta blanca sobre la foto de la tienda.' },
      fields: [
        { name: 'eyebrow', type: 'text', required: true, label: 'Ubicación (chip superior)' },
        {
          name: 'kicker',
          type: 'text',
          required: true,
          label: 'Línea de categorías',
          admin: { description: 'La frase en mayúsculas sobre el titular. Ej. "Frutos secos · Semillas · Granos · Gourmet".' },
        },
        { name: 'title', type: 'text', required: true, label: 'Titular' },
        { name: 'body', type: 'textarea', required: true, label: 'Texto de apoyo' },
        {
          name: 'ctaPrimaryLabel',
          type: 'text',
          required: true,
          label: 'Botón principal (texto)',
          admin: { description: 'El botón amarillo. Siempre lleva a la tienda.' },
        },
        {
          name: 'ctaSecondaryLabel',
          type: 'text',
          required: true,
          label: 'Botón secundario (texto)',
          admin: { description: 'El botón con borde. Siempre lleva a Contacto.' },
        },
      ],
    },
    {
      name: 'benefits',
      type: 'array',
      required: true,
      minRows: 3,
      maxRows: 4,
      label: 'Barra de beneficios',
      labels: { singular: 'Beneficio', plural: 'Beneficios' },
      admin: {
        description:
          'La franja de tres beneficios. En escritorio se muestra solo el título; en móvil también la segunda línea.',
      },
      fields: [
        {
          name: 'icon',
          type: 'select',
          required: true,
          label: 'Icono',
          defaultValue: 'scale',
          options: [
            { label: 'Balanza (peso exacto)', value: 'scale' },
            { label: 'Reciclaje (envase)', value: 'recycling' },
            { label: 'Montaña (origen)', value: 'terrain' },
            { label: 'Hoja (natural)', value: 'eco' },
            { label: 'Tienda', value: 'storefront' },
            { label: 'Envío', value: 'local_shipping' },
          ],
        },
        { name: 'label', type: 'text', required: true, label: 'Título' },
        {
          name: 'sub',
          type: 'text',
          label: 'Segunda línea (solo móvil)',
          admin: { description: 'Ej. "Solo lo que necesitas". Se ve únicamente en pantallas pequeñas.' },
        },
      ],
    },
    {
      type: 'group',
      name: 'history',
      label: 'Nuestra esencia',
      fields: [
        { name: 'eyebrow', type: 'text', required: true, label: 'Línea superior' },
        { name: 'title', type: 'text', required: true, label: 'Titular' },
        { name: 'body1', type: 'textarea', required: true, label: 'Primer párrafo' },
        { name: 'body2', type: 'textarea', required: true, label: 'Segundo párrafo' },
        {
          name: 'stats',
          type: 'array',
          required: true,
          minRows: 2,
          maxRows: 3,
          label: 'Cifras destacadas',
          labels: { singular: 'Cifra', plural: 'Cifras' },
          fields: [
            {
              name: 'value',
              type: 'text',
              required: true,
              label: 'Cifra',
              admin: { description: 'Ej. "100%" o "50+".' },
            },
            { name: 'label', type: 'text', required: true, label: 'Descripción' },
          ],
        },
        { name: 'badgeTitle', type: 'text', required: true, label: 'Tarjeta flotante (título)' },
        { name: 'badgeSub', type: 'text', required: true, label: 'Tarjeta flotante (subtítulo)' },
      ],
    },
    {
      type: 'group',
      name: 'categories',
      label: 'Sección de categorías',
      fields: [
        { name: 'eyebrow', type: 'text', required: true, label: 'Línea superior' },
        { name: 'title', type: 'text', required: true, label: 'Titular' },
        { name: 'ctaLabel', type: 'text', required: true, label: 'Botón (texto)' },
      ],
    },
    {
      type: 'group',
      name: 'popular',
      label: 'Sección de productos populares',
      admin: { description: 'Los productos que se muestran aquí se eligen en el catálogo, con la casilla "Popular".' },
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Titular' },
        { name: 'ctaLabel', type: 'text', required: true, label: 'Botón (texto)' },
      ],
    },
    {
      type: 'group',
      name: 'newsletter',
      label: 'Suscripción por correo',
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Titular' },
        { name: 'body', type: 'textarea', required: true, label: 'Texto de apoyo' },
        { name: 'ctaLabel', type: 'text', required: true, label: 'Botón (texto)' },
        {
          name: 'placeholder',
          type: 'text',
          required: true,
          label: 'Texto de ejemplo del campo',
          admin: { description: 'El texto gris dentro del campo antes de escribir. Ej. "Tu correo electrónico...".' },
        },
      ],
    },
  ],
}
