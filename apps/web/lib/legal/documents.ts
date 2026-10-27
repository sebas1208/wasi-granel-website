import type { LegalDocumentSlug } from "@/lib/payload"

/**
 * The two legal documents, as the owner approved them on 2026-10-26 (ticket 27).
 *
 * They live in TypeScript rather than as `.md` files on purpose. The same text has to render in two
 * places — the real page at /legal/[documento] and the modal the footer and the contact form open — and
 * a `.md` file would have to be read with `fs` on the server and then threaded into the client modal as
 * a prop. As a plain module both paths render the identical component, so the page and the window can
 * never drift apart.
 *
 * The body is markdown, rendered by `LegalDocument` via react-markdown. The heading and the
 * "última actualización" line are split out so each surface can place them itself.
 *
 * **Not legal advice.** The owner is having these reviewed by a lawyer before they bind anyone; if the
 * wording changes, change it HERE — this is the single source of truth for what the site publishes.
 */

export type LegalDocument = {
  /** The `document` value the Payload `footer` global stores for this link. */
  slug: LegalDocumentSlug
  /** The document's own heading. */
  title: string
  /** Used for the page's meta description and the modal's accessible description. */
  summary: string
  /** When the owner last approved the wording. Shown to the reader, so it must be honest. */
  updated: string
  body: string
}

export const LEGAL_DOCUMENTS: Record<LegalDocumentSlug, LegalDocument> = {
  terms: {
    slug: "terms",
    title: "Términos y Condiciones",
    summary:
      "Cómo funciona comprar en Wasi Granel: precios, impuestos, envíos, cómo se confirma un pedido y qué hacemos si algo sale mal.",
    updated: "26 de octubre de 2026",
    body: `## 1. Quiénes somos

**Wasi Granel** · RUC **0601801327001** · Matriz: Guayaquil y Benalcázar 1815, 060111 Riobamba, Ecuador.

Somos un negocio de venta de frutos secos, semillas, granos, especias y productos gourmet **al peso exacto**, con dos locales en Riobamba:

- **Matriz** — Guayaquil y Benalcázar 1815, 060111 Riobamba · 099 087 6620
- **Sucursal** — Juan Montalvo y Av. José Veloz, esquina, Riobamba · 099 147 5809

Correo: **info@wasigranel.com** · Horario: lunes a sábado de 8:00 a 19:00, domingos cerrado.

Al usar este sitio o comprarnos, aceptas estos términos. Si no estás de acuerdo con ellos, no uses el sitio ni realices pedidos.

## 2. Qué ofrecemos

Vendemos productos a granel, por peso. La cantidad mínima por pedido es de **50 gramos** por producto.

Las fotografías son referenciales: al tratarse de productos naturales, el color, el tamaño y la forma pueden variar entre lotes. La disponibilidad depende del stock de cada local y puede cambiar sin aviso.

## 3. Precios e impuestos

Los precios se muestran **por unidad de peso** (libra, kilogramo o 100 gramos) y en dólares de los Estados Unidos. El precio que ves es el que pagas.

Nuestros productos son, en su mayoría, **alimentos sujetos a tarifa 0% de IVA**, por lo que el precio mostrado no lleva IVA añadido. Si algún producto estuviera gravado, el IVA se mostrará por separado en el comprobante antes de confirmar tu pedido.

Podemos actualizar los precios en cualquier momento. El precio aplicable a tu pedido es el vigente cuando lo confirmamos.

## 4. Cómo se compra hoy

Hoy los pedidos se coordinan **por WhatsApp o en cualquiera de nuestros dos locales**. El sitio muestra el catálogo y los precios; la confirmación del pedido, el peso final y el envío se acuerdan en esa conversación.

Cuando se habilite el pago en línea, esta sección indicará qué medios de pago se aceptan y qué proveedor los procesa. Hoy **no** se procesan pagos en el sitio.

## 5. Envíos

Despachamos encomiendas **a cualquier provincia continental del Ecuador** vía **Servientrega**. El envío se coordina por WhatsApp una vez confirmado tu pedido.

El costo y el tiempo de entrega los fija el transportista según el destino y el peso. No somos responsables por retrasos del transportista, aunque te ayudamos a dar seguimiento.

## 6. Confirmación del pedido

Un pedido queda confirmado cuando lo acordamos contigo por WhatsApp o en el local, con el peso y el valor final. Hasta ese momento, el pedido no existe como compromiso.

Podemos no aceptar un pedido si el producto no está disponible, si el peso solicitado no es posible, o si detectamos un error evidente de precio o de sistema.

## 7. Productos al peso

Pesamos cada pedido al momento de despacharlo. El peso final puede variar levemente respecto al solicitado por el redondeo de la balanza, así que **cobramos el peso que realmente se despacha**, que puede ser un poco más o un poco menos que lo pedido.

Si la diferencia supera el **5%**, te escribimos antes de enviar para que decidas si mantienes, ajustas o cancelas el pedido.

## 8. Si algo sale mal

Si tu pedido llega incompleto, en mal estado o no es lo que pediste, escríbenos a **info@wasigranel.com** o por WhatsApp dentro de las **48 horas** siguientes a la recepción, con una foto del producto.

En esos casos **reponemos el producto o devolvemos el valor**, según lo que prefieras y lo que sea posible con el stock disponible.

## 9. Contenido del sitio

Los textos, fotografías, logotipos y el diseño de este sitio son nuestros o los usamos con autorización. No los copies ni los uses para fines comerciales sin pedirnos permiso.

## 10. Uso del sitio

Te pedimos usarlo de buena fe: sin intentar afectar su funcionamiento, sin extraer masivamente el catálogo y sin publicar información falsa. Podemos bloquear el acceso ante un uso abusivo.

## 11. Cambios

Podemos actualizar estos términos. La versión vigente es la publicada aquí, con su fecha de actualización. Si el cambio es importante, lo anunciaremos en el sitio.

## 12. Ley aplicable

Estos términos se rigen por las leyes de la República del Ecuador. Cualquier controversia se resolverá ante los jueces competentes de Riobamba, salvo que la ley disponga otra cosa a tu favor como consumidor.`,
  },

  privacy: {
    slug: "privacy",
    title: "Política de Privacidad",
    summary:
      "Qué datos personales recogemos cuando nos escribes o te suscribes, para qué los usamos, con quién los compartimos y cómo puedes pedir que los borremos.",
    updated: "26 de octubre de 2026",
    body: `Esta política explica qué hacemos con tus datos personales cuando usas wasigranel.com, nos escribes o te suscribes a nuestras novedades. Aplica la *Ley Orgánica de Protección de Datos Personales* del Ecuador.

## 1. Quién responde por tus datos

**Wasi Granel** · RUC **0601801327001** · Matriz: Guayaquil y Benalcázar 1815, 060111 Riobamba, Ecuador.

Correo para cualquier tema de datos personales: **info@wasigranel.com**

## 2. Qué datos recogemos

**Cuando nos escribes por el formulario de contacto:** tu nombre, tu teléfono o WhatsApp, tu correo electrónico y el mensaje que escribes.

**Cuando te suscribes a las novedades:** únicamente tu correo electrónico.

**Datos técnicos de uso:** usamos **Vercel Analytics** para saber cuántas personas visitan el sitio y qué páginas ven. Funciona **sin cookies** y sin identificadores personales: no sabemos quién eres, solo que alguien visitó una página.

**Lo que NO recogemos:** no pedimos datos de tarjetas ni datos bancarios. Hoy el sitio no procesa pagos.

## 3. Para qué los usamos

- Para **responderte** cuando nos escribes por el formulario.
- Para **enviarte novedades** si te suscribiste, y para poder darte de baja si lo pides.
- Para **entender qué páginas se usan**, y así mejorar el sitio (con datos agregados y anónimos).

No usamos tus datos para publicidad de terceros, ni para perfilarte, ni para venderte nada que no hayas pedido.

## 4. Con qué base los tratamos

Con tu **consentimiento**, que nos das al marcar la casilla del formulario o al suscribirte. Puedes retirarlo cuando quieras escribiéndonos: dejar de tratar tus datos es tan fácil como haber empezado.

## 5. Con quién los compartimos

Tus datos no se venden ni se alquilan. Intervienen estos proveedores, solo para lo necesario:

| proveedor | para qué | qué recibe |
| --- | --- | --- |
| **Google** | guarda los mensajes del formulario y la lista de suscriptores | lo que escribes en el formulario y tu correo |
| **Vercel** | aloja el sitio y mide visitas | datos técnicos de navegación, agregados |
| **Contabo** | aloja el servidor del sistema de contenidos | los datos almacenados por el sitio |
| **Servientrega** | entrega las encomiendas | nombre, dirección y teléfono, cuando haces un pedido |

## 6. Dónde se guardan

En servidores de Vercel y de Contabo, **ambos en los Estados Unidos**, lo que implica una **transferencia internacional** de datos. Al usar el formulario o suscribirte, aceptas esa transferencia.

## 7. Cuánto tiempo los guardamos

- **Mensajes del formulario:** 12 meses desde la última conversación.
- **Lista de novedades:** hasta que pidas la baja.

## 8. Tus derechos

Puedes pedirnos en cualquier momento:

- **Acceso** — saber qué datos tuyos tenemos.
- **Rectificación** — corregir los que estén mal.
- **Eliminación** — borrarlos.
- **Oposición** — que dejemos de usarlos para algo concreto.
- **Portabilidad** — recibirlos en un formato reutilizable.
- **Suspensión** — que limitemos su uso mientras se resuelve algo.

Escríbenos a **info@wasigranel.com** indicando qué quieres. Te respondemos en un plazo máximo de **15 días**. Si no quedas conforme, puedes acudir a la **Superintendencia de Protección de Datos Personales** del Ecuador.

## 9. Cookies y almacenamiento en tu navegador

No usamos cookies de publicidad ni de seguimiento.

Tu **carrito** y tus **favoritos** se guardan únicamente en tu propio navegador, no en nuestros servidores: si borras los datos del navegador o cambias de dispositivo, se pierden.

## 10. Menores de edad

El sitio no está dirigido a menores de edad. Si eres menor, pide a un adulto que gestione el contacto o la compra.

## 11. Cambios

Si cambiamos esta política, actualizamos la fecha del encabezado. Si el cambio es importante, lo anunciaremos en el sitio.

## 12. Contacto

Cualquier duda sobre esta política: **info@wasigranel.com** o cualquiera de nuestros dos locales en Riobamba.`,
  },
}

/** The canonical URL for a document — the ONE thing the footer link and the modal must agree on. */
export function legalHref(slug: LegalDocumentSlug): string {
  return `/legal/${slug}`
}

export function isLegalDocumentSlug(value: string): value is LegalDocumentSlug {
  return value === "terms" || value === "privacy"
}
