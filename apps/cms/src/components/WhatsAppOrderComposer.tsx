import type React from 'react'
import type { UIFieldServerProps } from 'payload'

import { CopyTextButton } from './CopyTextButton'
import {
  composeOrderMessage,
  toComposeOrder,
  toComposeStore,
  whatsappOrderLink,
  type PayloadContactoLike,
  type PayloadTiendaLike,
} from '../lib/order-whatsapp'

/**
 * The WhatsApp composer on an Order's edit view (ticket 23).
 *
 * ## Where this lives, and why not in the action bar
 *
 * It is a `type: 'ui'` field, so it renders full-width inside the document form. The obvious-looking
 * alternative — `admin.components.edit.beforeDocumentControls` — is a flex ROW with a fixed height inside
 * the sticky action bar (`--doc-controls-height`, `overflow: auto`), which a message this long would
 * overflow and squash the Save button in. A UI field is presentational-only: it adds **no stored field and
 * no database column**, so Orders' data model is untouched and no migration is involved.
 *
 * It is a SERVER component. Payload renders field components on the server and hands them `payload`, so the
 * order, the `tienda` global and the `contacto` global are read with the Local API — the same store facts
 * the storefront renders, no client fetch and no second copy of the account number in JS.
 *
 * ## What a human still does
 *
 * Nothing is sent automatically. The store reads the message, and taps the link. That is the v1 flow: the
 * conversation is merchant-initiated and a person is accountable for what leaves the store's phone.
 *
 * ## Why the message ends with a LINK instead of the QR
 *
 * A `wa.me` link carries **text only** — the platform has no parameter for an attachment, and the WhatsApp
 * Business app's fixed greeting cannot carry one either. So the payment block links to `/pago` on the
 * storefront, where the real DeUna QR is served (and where the owner can replace it from the CMS without a
 * deploy). The image is never attached, and it never can be, from this path. See `lib/order-whatsapp.ts`.
 */
export const WhatsAppOrderComposer = async (props: UIFieldServerProps & { id?: number | string }) => {
  const { id, payload } = props

  // The create view has no document yet, so there is no stored order to describe. Say so instead of
  // rendering an empty composer that looks broken.
  if (id === undefined || id === null) {
    return (
      <Panel>
        <Header />
        <p style={{ margin: 0, fontSize: '13px' }}>
          Guarda el pedido primero. El mensaje se compone a partir del pedido guardado.
        </p>
      </Panel>
    )
  }

  const siteUrl = (process.env.STOREFRONT_URL ?? 'https://wasigranel.com').replace(/\/+$/, '')

  const [order, tienda, contacto] = await Promise.all([
    // depth: 1 — the product names live on the related documents. At depth 0 every line would read
    // "Producto #12" instead of the name the customer bought.
    payload.findByID({ collection: 'orders', id, depth: 1, overrideAccess: true }).catch(() => null),
    payload.findGlobal({ slug: 'tienda', depth: 0, overrideAccess: true }).catch(() => null),
    payload.findGlobal({ slug: 'contacto', depth: 0, overrideAccess: true }).catch(() => null),
  ])

  if (!order) {
    return (
      <Panel>
        <Header />
        <p style={{ margin: 0, fontSize: '13px' }}>
          No se pudo leer este pedido. Vuelve a cargar la página.
        </p>
      </Panel>
    )
  }

  const { store, missing } = toComposeStore(
    (tienda ?? {}) as PayloadTiendaLike,
    (contacto ?? {}) as PayloadContactoLike,
    { siteUrl },
  )

  // A payment block with a hole in it is worse than no payment block: the customer would be told to
  // transfer to nothing. So the composer refuses and names exactly what is missing.
  if (missing.length > 0) {
    return (
      <Panel>
        <Header />
        <div style={warningStyle}>
          <strong>Faltan datos de la tienda, así que el mensaje no se puede componer todavía.</strong>
          <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
            {missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <p style={{ margin: '8px 0 0' }}>
            Se editan en <strong>Tienda → Datos de compra</strong> y en <strong>Contacto</strong>. Publica el
            cambio y vuelve a cargar este pedido.
          </p>
        </div>
      </Panel>
    )
  }

  const message = composeOrderMessage(toComposeOrder(order), store)
  const waLink = whatsappOrderLink(order.customer?.phone ?? '', message)

  return (
    <Panel>
      <Header />
      <p style={{ margin: '0 0 12px', fontSize: '13px' }}>
        Para <strong>{order.customer?.name}</strong> ·{' '}
        <span style={{ opacity: 0.75 }}>{order.customer?.phone}</span> — se abre WhatsApp en este dispositivo
        con el mensaje ya escrito. Tú decides cuándo enviarlo: nada se envía solo.
      </p>

      <pre
        data-testid="whatsapp-order-message"
        style={{
          margin: '0 0 12px',
          padding: '14px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: '12.5px',
          lineHeight: 1.55,
          background: 'var(--theme-elevation-0, #fff)',
          border: '1px solid var(--theme-elevation-150, #e0e0e0)',
          borderRadius: '6px',
          maxHeight: '420px',
          overflow: 'auto',
        }}
      >
        {message}
      </pre>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        <a
          data-testid="whatsapp-order-open"
          href={waLink}
          rel="noopener noreferrer"
          target="_blank"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 16px',
            borderRadius: '4px',
            background: 'var(--theme-success-500, #1f7a3f)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '13px',
            textDecoration: 'none',
          }}
        >
          Abrir WhatsApp
        </a>
        <CopyTextButton
          text={message}
          label="Copiar mensaje"
          style={{
            padding: '9px 16px',
            borderRadius: '4px',
            border: '1px solid var(--theme-elevation-150, #d0d0d0)',
            background: 'var(--theme-elevation-50, #f7f7f7)',
            color: 'var(--theme-text, #1a1a1a)',
            fontSize: '13px',
            fontWeight: 600,
          }}
        />
        <CopyTextButton
          text={order.customer?.phone ?? ''}
          label="Copiar teléfono"
          style={{
            padding: '9px 16px',
            borderRadius: '4px',
            border: '1px solid var(--theme-elevation-150, #d0d0d0)',
            background: 'var(--theme-elevation-50, #f7f7f7)',
            color: 'var(--theme-text, #1a1a1a)',
            fontSize: '13px',
            fontWeight: 600,
          }}
        />
      </div>

      <p style={{ margin: '12px 0 0', fontSize: '12px', opacity: 0.75 }}>
        El enlace lleva solo texto, por eso el mensaje incluye la dirección de la página de pago en lugar de
        adjuntar el QR. El QR real está en <code>{siteUrl}/pago</code>.
      </p>
    </Panel>
  )
}

/* ——— small presentational helpers ————————————————————————————————————————————————— */

const warningStyle: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: '6px',
  border: '1px solid var(--theme-warning-500, #b26a00)',
  background: 'var(--theme-warning-100, #fff5e0)',
  color: 'var(--theme-text, #1a1a1a)',
  fontSize: '13px',
  lineHeight: 1.5,
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-testid="whatsapp-order-composer"
      style={{
        margin: '8px 0 20px',
        padding: '16px 18px',
        borderRadius: '6px',
        border: '1px solid var(--theme-elevation-150, #e0e0e0)',
        background: 'var(--theme-elevation-50, #fafafa)',
      }}
    >
      {children}
    </div>
  )
}

function Header() {
  return (
    <h3
      style={{
        margin: '0 0 6px',
        fontSize: '14px',
        fontWeight: 700,
        letterSpacing: '0.01em',
      }}
    >
      Mensaje de WhatsApp para el cliente
    </h3>
  )
}
