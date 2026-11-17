import type { GlobalConfig } from 'payload'

import { revalidateGlobals } from '../hooks/revalidateStorefront'

/**
 * Datos de compra — how customers pay and how we deliver (ticket 23).
 *
 * These facts used to be nowhere: the bank details were going to be hardcoded in the web app, the shipping
 * rules were invented by the Stitch mockups (a flat "Calculado en checkout" that nothing computed), and the
 * free-shipping thresholds did not exist at all. The owner's call (2026-11-17): they belong here, editable,
 * for the same reason the store's phone numbers live in `contacto` — nobody should have to ship code to
 * change an account number.
 *
 * Editor notes:
 *  - `numeroCuenta` and `titular` are shown to a customer who is about to send money. If the titular does
 *    not match what they see in their banking app, the transfer gets refused — so this is one of the few
 *    fields where a typo costs a sale rather than looking untidy.
 *  - `qr` is an **upload**, not a file in the web app, so a reissued DeUna QR can be replaced here without
 *    a deploy. The image in `apps/web/public/pago/` is the seed, not the home.
 *  - The shipping zones are an **array** on purpose, and each one's `clave` is pinned to the values the
 *    checkout and `Orders.zone` use, so a new tier is a schema change rather than a silent mismatch.
 *
 * ASSUMPTION (2026-11-17, easy to reverse): the CUSTOMER picks city vs surroundings at checkout, so there
 * are THREE cases — inside Riobamba ($1.50), Riobamba's surroundings ($2.50) and anywhere else (quoted).
 * The owner's words were "inside Riobamba the shipping costs $1.5 and outside (in the surroundings) $2.5…
 * and be parametrizable… if the user already chose…", which reads as the customer declaring which of the
 * two local prices applies. The alternative — one "Riobamba" option and the store resolving the price from
 * the address — would collapse `riobamba` and `alrededores` back into a single zone and drop this extra
 * checkout option; nothing else here would have to change.
 */
export const Tienda: GlobalConfig = {
  slug: 'tienda',
  label: 'Datos de compra',
  admin: {
    group: 'Tienda',
    description:
      'Cómo nos pagan y cómo entregamos. Se muestra en la página de pago y en el checkout. Guardar aquí no publica: hay que pulsar Publicar.',
  },
  access: {
    read: () => true,
  },
  /**
   * Drafts matter more here than anywhere else on the site: an account number should never go live
   * half-edited. Autosave keeps the editing experience consistent with the other globals.
   */
  versions: {
    drafts: { autosave: { interval: 375 } },
  },
  hooks: {
    afterChange: [revalidateGlobals],
  },
  fields: [
    {
      type: 'group',
      name: 'pago',
      label: 'Datos para pagar',
      fields: [
        {
          name: 'banco',
          type: 'text',
          required: true,
          label: 'Banco',
          admin: { description: 'Ej. Banco del Pichincha.' },
        },
        {
          name: 'tipoCuenta',
          type: 'text',
          required: true,
          label: 'Tipo de cuenta',
          admin: { description: 'Ej. Cuenta de ahorros.' },
        },
        {
          name: 'numeroCuenta',
          type: 'text',
          required: true,
          label: 'Número de cuenta',
          admin: {
            description:
              'Se muestra al cliente para que transfiera. Un dígito mal aquí significa una transferencia rechazada.',
          },
        },
        {
          name: 'titular',
          type: 'text',
          required: true,
          label: 'Titular',
          admin: {
            description:
              'Tal como aparece en el banco. El cliente lo compara con su app antes de transferir.',
          },
        },
        {
          name: 'ruc',
          type: 'text',
          required: true,
          label: 'RUC',
          admin: { description: 'El RUC del negocio, tal como consta en el SRI.' },
        },
        {
          name: 'qr',
          type: 'upload',
          relationTo: 'media',
          label: 'QR de DeUna',
          admin: {
            description:
              'La imagen que el cliente escanea. Súbela aquí para reemplazarla sin tocar el código.',
          },
        },
        {
          name: 'nota',
          type: 'textarea',
          label: 'Nota para el cliente',
          admin: {
            description:
              'Ej. "Cuando hayas pagado, envíanos el comprobante por WhatsApp y confirmamos tu pedido."',
          },
        },
      ],
    },
    {
      type: 'group',
      name: 'envios',
      label: 'Envíos',
      fields: [
        {
          name: 'zonas',
          type: 'array',
          label: 'Zonas de entrega',
          minRows: 1,
          admin: {
            description:
              'Dentro de Riobamba y sus alrededores entregamos con Motofast (con distinto costo cada uno); el resto del país con Servientrega. Se pueden añadir más zonas, pero cada una necesita una clave que el sistema entienda.',
          },
          fields: [
            {
              name: 'clave',
              type: 'select',
              required: true,
              label: 'Clave del sistema',
              options: [
                { label: 'Dentro de Riobamba (ciudad)', value: 'riobamba' },
                { label: 'Alrededores de Riobamba', value: 'alrededores' },
                { label: 'Otra ciudad', value: 'otra' },
              ],
              admin: {
                description:
                  'Debe coincidir con lo que el checkout ofrece y con lo que guarda cada pedido. No cambiar sin una migración.',
              },
            },
            {
              name: 'etiqueta',
              type: 'text',
              required: true,
              label: 'Cómo se muestra al cliente',
              admin: { description: 'Ej. "Riobamba (entrega gratis)".' },
            },
            {
              name: 'courier',
              type: 'text',
              required: true,
              label: 'Quién entrega',
              admin: { description: 'Ej. Motofast, Servientrega.' },
            },
            {
              name: 'costo',
              type: 'number',
              label: 'Costo de envío',
              admin: {
                description:
                  'Lo que cobramos. Déjalo vacío cuando el precio se acuerda caso por caso, como fuera de Riobamba.',
              },
            },
            {
              name: 'gratisDesde',
              type: 'number',
              label: 'Envío gratis desde',
              admin: {
                description: 'Monto desde el cual el envío corre por nuestra cuenta. Ej. 30 o 60.',
              },
            },
            {
              name: 'nota',
              type: 'textarea',
              label: 'Nota para el cliente',
              admin: {
                description:
                  'Ej. "El costo del envío se confirma contigo por WhatsApp antes de despachar."',
              },
            },
          ],
        },
      ],
    },
  ],
}
