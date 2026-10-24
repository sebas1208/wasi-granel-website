import type { GlobalConfig } from 'payload'

import { revalidateGlobals } from '../hooks/revalidateStorefront'

/**
 * Contacto y sucursales — the store's REAL contact data, now editable (ticket 19).
 *
 * This replaces `apps/web/lib/store-info.ts` as the source of truth. That file was written because the
 * Stitch mockup invented EVERY customer-facing fact on the Contacto page (both phone numbers, both
 * addresses, both opening-hour sets, a Quito branch that does not exist, the store services and a
 * "200+ references" claim). The storefront still keeps those values as a **fallback**, so a blank
 * field here can never put an empty phone number in front of a customer.
 *
 * Editor notes:
 *  - `phone` is deliberately the ONLY phone field. The WhatsApp link and the spaced display form
 *    ("099 087 6620") are derived in code, so there is one number to get right, not three.
 *  - `mapsCid` is the one genuinely technical field; it is what makes the embedded map show the real
 *    business card rather than a bare pin or a neighbouring shop. See its description.
 */
export const Contacto: GlobalConfig = {
  slug: 'contacto',
  label: 'Contacto y sucursales',
  admin: {
    group: 'Contenido del sitio',
    description:
      'Todo lo que aparece en la página de Contacto y en el pie del sitio sale de aquí. Cambiar algo aquí y guardar lo publica al instante.',
  },
  access: {
    read: () => true,
  },
  /**
   * Drafts (owner, 2026-10-24). Saving keeps the change private; **Publish** makes it live. This is
   * what lets an edit be previewed on the real site before a customer sees it: the editor is in draft
   * mode, so the preview renders the draft, while everyone else still gets the published version at
   * the same URL. No second deployment is involved.
   */
  versions: {
    drafts: true,
  },
  hooks: {
    afterChange: [revalidateGlobals],
  },
  fields: [
    {
      type: 'group',
      name: 'general',
      label: 'Datos generales',
      fields: [
        {
          name: 'email',
          type: 'email',
          required: true,
          label: 'Correo de contacto',
          admin: { description: 'Se muestra en la página de Contacto y en el pie del sitio.' },
        },
        {
          name: 'city',
          type: 'text',
          required: true,
          label: 'Ciudad',
          admin: { description: 'Ej. Riobamba. Ambas sucursales están en la misma ciudad.' },
        },
        {
          name: 'courier',
          type: 'text',
          required: true,
          label: 'Empresa de envíos',
          admin: { description: 'Ej. Servientrega.' },
        },
        {
          name: 'courierScope',
          type: 'text',
          required: true,
          label: 'Cobertura de envíos',
          admin: { description: 'Ej. a todo el Ecuador.' },
        },
      ],
    },
    {
      type: 'group',
      name: 'hero',
      label: 'Encabezado de la página',
      admin: { description: 'El bloque grande de arriba en la página de Contacto.' },
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          required: true,
          label: 'Línea superior',
          admin: { description: 'La frase pequeña sobre el titular.' },
        },
        {
          name: 'titleTop',
          type: 'text',
          required: true,
          label: 'Titular (primera parte)',
        },
        {
          name: 'titleAccent',
          type: 'text',
          required: true,
          label: 'Titular (palabra destacada)',
          admin: { description: 'Se muestra en color de acento, en la misma línea.' },
        },
        {
          name: 'body',
          type: 'textarea',
          required: true,
          label: 'Texto de presentación',
        },
        {
          name: 'visitTitle',
          type: 'text',
          required: true,
          label: 'Etiqueta de la tarjeta flotante',
          admin: { description: 'Ej. "Visítanos en persona".' },
        },
        {
          name: 'visitSub',
          type: 'text',
          required: true,
          label: 'Subtítulo de la tarjeta flotante',
          admin: { description: 'Ej. "Dos locales en Riobamba".' },
        },
      ],
    },
    {
      name: 'hours',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 4,
      label: 'Horario de atención',
      labels: { singular: 'Línea de horario', plural: 'Líneas de horario' },
      admin: {
        description:
          'Una línea por franja. Ej. "Lunes a Sábado: 8:00 – 19:00" y "Domingos: cerrado". Aparece en la tarjeta de cada sucursal.',
      },
      fields: [
        {
          name: 'line',
          type: 'text',
          required: true,
          label: 'Texto',
        },
      ],
    },
    {
      name: 'branches',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 5,
      label: 'Sucursales',
      labels: { singular: 'Sucursal', plural: 'Sucursales' },
      admin: {
        description:
          'Cada sucursal es una pestaña en la página de Contacto. El orden de esta lista es el orden de las pestañas. La primera se usa como contacto principal en el pie y en el menú.',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Nombre',
          admin: { description: 'Ej. "Wasi Granel Matriz". Es el título de la tarjeta y del mapa.' },
        },
        {
          name: 'tabLabel',
          type: 'text',
          required: true,
          label: 'Etiqueta de la pestaña',
          admin: { description: 'Ej. "1. Matriz (Riobamba)". La numeración es parte del texto.' },
        },
        {
          name: 'badge',
          type: 'text',
          label: 'Etiqueta destacada',
          admin: { description: 'Chip pequeño sobre la tarjeta. Ej. "Sede Fundadora".' },
        },
        {
          name: 'region',
          type: 'text',
          label: 'Provincia',
          admin: { description: 'Ej. "Chimborazo".' },
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Descripción breve',
          admin: { description: 'Un par de líneas sobre esta sucursal.' },
        },
        {
          name: 'address',
          type: 'text',
          required: true,
          label: 'Dirección',
          admin: { description: 'Tal como se la darías a alguien para que llegue.' },
        },
        {
          name: 'phone',
          type: 'text',
          required: true,
          label: 'Teléfono / WhatsApp',
          admin: {
            description:
              'Solo números, como lo marcas tú: 0990876620. El enlace de WhatsApp y el formato con espacios (099 087 6620) se generan solos — no los escribas.',
          },
        },
        {
          name: 'mapsUrl',
          type: 'text',
          required: true,
          label: 'Enlace de Google Maps',
          admin: {
            description:
              'Abre la ficha de esta sucursal en Google Maps, toca "Compartir" y pega aquí el enlace corto (empieza con maps.app.goo.gl). Es el botón "Cómo llegar".',
          },
        },
        {
          name: 'mapsCid',
          type: 'text',
          label: 'ID del mapa (avanzado)',
          admin: {
            description:
              'Lo necesita el mapa incrustado para mostrar la ficha REAL del negocio. Sin él, el mapa no aparece. Se obtiene de la URL de Maps: es el número decimal que corresponde al segundo valor "0x…" del enlace largo. Pídele a un desarrollador este dato. OJO: no son las coordenadas.',
          },
        },
        {
          name: 'services',
          type: 'array',
          label: 'Servicios',
          labels: { singular: 'Servicio', plural: 'Servicios' },
          admin: { description: 'Chips con lo que se ofrece en esta sucursal.' },
          fields: [
            {
              name: 'service',
              type: 'text',
              required: true,
              label: 'Servicio',
              admin: { description: 'Ej. "Molienda de café en tienda".' },
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'faq',
      label: 'Pregunta frecuente',
      admin: { description: 'La tarjeta de preguntas al lado del formulario de contacto.' },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
          label: 'Pregunta',
        },
        {
          name: 'answer',
          type: 'textarea',
          required: true,
          label: 'Respuesta',
        },
      ],
    },
  ],
}
