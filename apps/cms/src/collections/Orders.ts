import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

/**
 * Orders placed at checkout (ticket 23).
 *
 * The flow is deliberately **merchant-initiated**: the storefront only records the order, and the store then
 * messages the customer on WhatsApp with the order summary and the payment details. Nothing here talks to a
 * payment provider, and nothing here is public.
 *
 * Two things are worth knowing about this shape:
 *
 *  - **No revalidation hooks.** The catalog hooks on Products/Categories/Media exist because those collections
 *    are rendered on the storefront. An order is never rendered anywhere, so touching the catalog tag here
 *    would clear the site's cache for nothing.
 *  - **The order line prices are snapshots.** `unitPrice` is copied from the cart at the moment the customer
 *    added the line, so a later price change in Products cannot rewrite what someone was quoted.
 *
 * Access is authenticated-only, for every operation. The storefront writes orders through a Next route
 * handler using a Payload **API key** (see `Users.auth.useAPIKey`), which authenticates as a user — so
 * `create` is allowed for that key while remaining closed to the public. Customer names, phone numbers and
 * addresses live in here, which is exactly why `read` is not public.
 */

/** The status set, in the order a real order moves through them. */
export const ORDER_STATUSES = [
  { label: 'Nuevo', value: 'nuevo' },
  { label: 'Enviado por WhatsApp', value: 'enviado' },
  { label: 'Pagado', value: 'pagado' },
  { label: 'Entregado', value: 'entregado' },
  { label: 'Cancelado', value: 'cancelado' },
  { label: 'Vencido', value: 'vencido' },
] as const


/**
 * Strip a phone number to digits and put it in international form.
 *
 * Ecuadorian numbers arrive as "099 087 6620" or "+593 99 087 6620". A `wa.me` link needs the country code
 * and no leading zero, so a 10-digit number starting with 0 becomes 593… rather than losing its first digit.
 * Anything else is left as digits so a foreign number is not mangled.
 */
export function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10 && digits.startsWith('0')) return `593${digits.slice(1)}`
  return digits
}

/** `WG-YYYY-NNNN`, sequential within the year. */
async function nextReference(req: { payload: { find: (a: unknown) => Promise<{ docs: { reference?: string | null }[] }> } }) {
  const prefix = `WG-${new Date().getFullYear()}-`
  const found = await req.payload.find({
    collection: 'orders',
    where: { reference: { like: prefix } },
    sort: '-reference',
    limit: 1,
    depth: 0,
  })
  const last = found.docs[0]?.reference
  const n = last ? Number.parseInt(last.slice(prefix.length), 10) + 1 : 1
  return `${prefix}${String(Number.isFinite(n) ? n : 1).padStart(4, '0')}`
}

/**
 * Everything an order needs before it is stored.
 *
 * The reference is generated here rather than in the route handler so it cannot be forgotten by a second
 * caller, and the storefront is never trusted to invent one. `reference` is unique, so a simultaneous double
 * submit loses to the database rather than duplicating — at this volume that is the right trade.
 *
 * The status timestamps are stamped, never overwritten: re-saving an order that is already `pagado` must not
 * move the moment it was paid.
 */
const beforeChange: CollectionBeforeChangeHook = async ({ data, req, operation, originalDoc }) => {
  if (operation === 'create') {
    if (!data.reference) data.reference = await nextReference(req as never)
    if (data.customer?.phone) data.customer.phone = normalisePhone(data.customer.phone)
    if (data.whatsappConsent && !data.whatsappConsentAt) {
      data.whatsappConsentAt = new Date().toISOString()
    }
  }

  const status = data.status ?? originalDoc?.status
  const now = new Date().toISOString()
  if (status === 'enviado' && !data.messageSentAt && !originalDoc?.messageSentAt) data.messageSentAt = now
  if (status === 'pagado' && !data.paidAt && !originalDoc?.paidAt) data.paidAt = now
  if (status === 'entregado' && !data.deliveredAt && !originalDoc?.deliveredAt) data.deliveredAt = now

  return data
}

/** The payment channels the store offers, all of them settled outside the site. */
export const PAYMENT_METHODS = [
  { label: 'Transferencia bancaria', value: 'transferencia' },
  { label: 'DeUna', value: 'deuna' },
  { label: 'Pago contra entrega', value: 'contra_entrega' },
] as const

const isLoggedIn = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'status', 'customer.name', 'zone', 'subtotal', 'createdAt'],
    group: 'Ventas',
    description:
        'Pedidos recibidos desde la tienda. Todavía no llega aviso por correo: no hay proveedor de correo configurado, así que revisa esta lista.',
  },
  /**
   * Orders hold a customer's name, phone and address. Unlike Products there is no public read: everyone who
   * touches this collection must be authenticated, and the API key counts as a user.
   */
  access: {
    read: isLoggedIn,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  hooks: {
    beforeChange: [beforeChange],
  },
  fields: [
    {
      name: 'reference',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description:
          'Human-readable order number, e.g. "WG-2026-0001". Set automatically on create; the customer is asked to quote it when they transfer.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'nuevo',
      index: true,
      options: [...ORDER_STATUSES],
      admin: { description: 'Movido a mano por la tienda — no hay pasarela de pago.' },
    },
    {
      name: 'customer',
      type: 'group',
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Nombre y apellido' },
        {
          name: 'phone',
          type: 'text',
          required: true,
          index: true,
          label: 'Teléfono / WhatsApp',
          admin: { description: 'The number the store messages. Normalised to digits before saving.' },
        },
        { name: 'address', type: 'text', required: true, label: 'Dirección de entrega' },
        { name: 'note', type: 'textarea', label: 'Nota para el pedido' },
      ],
    },
    {
      name: 'zone',
      type: 'select',
      required: true,
      options: [
        { label: 'Riobamba (envío gratis)', value: 'riobamba' },
        { label: 'Otra ciudad (Servientrega, costo por confirmar)', value: 'otra' },
      ],
      admin: {
        description:
          'Riobamba is free delivery by our own staff. "Otra ciudad" is quoted by Servientrega and confirmed with the buyer in the same WhatsApp conversation.',
      },
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'product', type: 'relationship', relationTo: 'products', required: true },
        {
          name: 'optionLabel',
          type: 'text',
          admin: { description: 'What the customer actually chose, e.g. "500 g" or "1 unidad".' },
        },
        {
          name: 'kind',
          type: 'select',
          required: true,
          options: [
            { label: 'Al peso', value: 'weight' },
            { label: 'Por unidad', value: 'unit' },
          ],
        },
        { name: 'grams', type: 'number', admin: { description: 'Peso solicitado, en gramos (peso).' } },
        { name: 'amount', type: 'number', admin: { description: 'Cantidad (unidad).' } },
        { name: 'qty', type: 'number', required: true, defaultValue: 1 },
        {
          name: 'unitPrice',
          type: 'number',
          required: true,
          admin: { description: 'Precio unitario cotizado — copiado del carrito, no recalculado.' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'subtotal',
          type: 'number',
          required: true,
          admin: { description: 'Lo que el cliente veía en el carrito. No incluye envío.' },
        },
        {
          name: 'shipping',
          type: 'number',
          admin: { description: 'Costo de envío, fijado por la tienda al confirmar. Vacío en Riobamba.' },
        },
        {
          name: 'total',
          type: 'number',
          admin: { description: 'Subtotal + envío. Confirmado en el chat.' },
        },
      ],
    },
    {
      name: 'paymentMethod',
      type: 'select',
      options: [...PAYMENT_METHODS],
      admin: { description: 'Acordado con el cliente; el cobro ocurre fuera del sitio.' },
    },
    /**
     * The WhatsApp consent, kept with the order it belongs to. Meta requires an explicit opt-in that is not
     * pre-ticked and does not verify it at send time — the proof is the business's to hold, so the wording and
     * the moment of consent are stored alongside the order rather than in a separate log.
     */
    {
      type: 'row',
      fields: [
        {
          name: 'whatsappConsent',
          type: 'checkbox',
          required: true,
          label: 'Consentimiento de WhatsApp',
          admin: {
            readOnly: true,
            description: 'El cliente aceptó recibir por WhatsApp la confirmación y los datos de pago.',
          },
        },
        {
          name: 'whatsappConsentAt',
          type: 'date',
          admin: { readOnly: true, description: 'Cuándo lo aceptó. Es la prueba del consentimiento.' },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Seguimiento',
      admin: { position: 'sidebar' },
      fields: [
        { name: 'messageSentAt', type: 'date', admin: { readOnly: true, description: 'Primer mensaje enviado.' } },
        { name: 'paidAt', type: 'date', admin: { readOnly: true } },
        { name: 'deliveredAt', type: 'date', admin: { readOnly: true } },
      ],
    },
  ],
}
