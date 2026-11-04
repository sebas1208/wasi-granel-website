# Preguntas para la familia — el checkout de Wasi Granel

**Para qué sirve esto.** Antes de programar el pago y el envío del sitio hay que definir cosas que solo
ustedes saben. Cada pregunta dice **por qué importa** y, donde ya tengo una recomendación, la pongo.

No hay que contestar todo hoy. Las que más nos bloquean están marcadas con **⚠️**.

---

## 1. Pagos

**⚠️ 1.1 — ¿Cuáles son los datos reales de la cuenta para transferencias?**

Banco, tipo de cuenta (ahorros o corriente), número de cuenta, y el **titular tal como aparece en el banco**.

*Por qué:* van impresos en la página de pago del sitio. Si el titular no coincide con lo que el cliente ve
en la app de su banco, es la causa más común de que le rechacen la transferencia.

**⚠️ 1.2 — ¿Tienen DeUna, y de quién es la cuenta?**

Hay dos tipos y se cobran distinto:

- **DeUna de persona:** no cobra comisión al recibir. Es a nombre de quien sea, normalmente personal.
- **DeUna Negocios:** cobra **2%** por venta. Exige **RUC activo y ser el representante legal único**, así que
  solo la puede abrir quien tenga el RUC a su nombre.

*Necesitamos:* la **imagen del QR de DeUna de persona**, para publicarla en el sitio (por WhatsApp no se
puede adjuntar una imagen en un mensaje automático, así que se comparte como enlace).

**1.3 — ¿Están de acuerdo en que el sitio no cobre en línea?**

El cliente pide desde la web, nosotros le escribimos por WhatsApp, él transfiere, y recién ahí despachamos.
Es lo que ya definimos, pero conviene que todos estén de acuerdo.

**⚠️ 1.4 — ¿Ofrecemos pago contra entrega?**

- **En Riobamba:** es fácil y gratis. Nuestro propio repartidor cobra en la puerta (0% de comisión).
- **Fuera de Riobamba:** el courier cobra por nosotros y se queda **~3% + IVA**, y el dinero llega días
  después, no el mismo día. Además hay un riesgo real: los pedidos contra entrega se rechazan.
  **El promedio del mercado es 8%, y en algunos casos llega al 15–30%.** Un rechazo nos cuesta el envío de
  ida y muchas veces también el de vuelta.

*Mi recomendación:* contra entrega en Riobamba, y fuera de Riobamba pedir transferencia antes de despachar.

**1.5 — ¿Cobramos por envases retornables?**

El diseño puso por defecto una línea de "Envases retornables $1.00". ¿Eso existe de verdad?

*Por qué:* si existe, necesitamos el precio y la regla (¿se devuelve el valor cuando el cliente trae el
envase?). Si no existe, lo quitamos del sitio.

---

## 2. Envíos

**⚠️ 2.1 — ¿Qué es exactamente "Riobamba o cerca", donde el envío es gratis?**

¿Solo la ciudad de Riobamba? ¿Qué parroquias? ¿Cantones vecinos como Guano, Chambo o Penipe?

*Por qué:* el cliente elige esto en el formulario del sitio ("Riobamba" u "Otra ciudad"), y de esa elección
depende si le cobramos envío o no.

**2.2 — Fuera de Riobamba, ¿cómo cobramos el envío?**

Lo acordado: el cliente pone "otra ciudad", nosotros le confirmamos el costo real por WhatsApp antes de
despachar. No ponemos un precio fijo en el sitio.

*Dato que ayuda a decidir:* mandar un paquete pequeño a otra provincia cuesta **entre $3 y $6** (Gintracom
$2.74–$5.48 por 1 a 5 kg; Urbano desde $3.55 hasta 4 kg). **Ningún courier de Ecuador publica una tabla de
precios**, así que cualquier número que pongamos sería nuestro, no de ellos.

**2.3 — ¿Con qué courier trabajamos?**

Servientrega no publica precios para Ecuador: hay que pedirle una cotización a un asesor de cuenta.
Para comparar: Gintracom cobra 3% + IVA por cobro contra entrega (máximo $1.000), Urbano hasta $500, Laar
hasta $300.

**2.4 — ¿Cuál es el pedido más pesado que despachamos normalmente?**

*Por qué:* de eso depende que un precio de envío fijo no nos haga perder plata en un pedido grande.

---

## 3. Precios y productos

**⚠️ 3.1 — Faltan los precios de 6 productos.**

Hoy están en **$0**: Semilla de Apio, Semillas de Amapola 25 Gr, Manzana Deshidratada, Cloruro de Calcio,
Agar Agar y Alginato.

*Por qué:* si el sitio sale en vivo así, un cliente puede pedir cualquiera de esos y el sistema lo cotiza
en cero.

**3.2 — ¿Los precios llevan IVA?**

Lo que entendí es que no, porque casi todos son alimentos con tarifa 0%. Pero va escrito en los Términos y
Condiciones, así que **conviene confirmarlo con el contador**.

**3.3 — ¿Hay un monto mínimo de compra?**

Hoy el sistema exige **50 gramos como mínimo por producto**. ¿Hay además un mínimo por pedido completo
(por ejemplo, no despachar pedidos de $2)?

**3.4 — ¿Los precios que tenemos están actualizados?**

Los del catálogo vienen de la lista que cargamos hace semanas. Si cambiaron, hay que actualizarlos antes de
que el sitio sea público.

---

## 4. Lo que prometemos por WhatsApp

**⚠️ 4.1 — ¿Mantenemos la promesa de la foto de la balanza?**

El diseño de celular dice que el cliente acepta recibir *"la foto de la balanza con el gramaje exacto"*.

*Por qué:* es una idea excelente para la confianza — el cliente ve que pesamos de verdad, y hace que el
ajuste de ±5% se sienta justo en vez de arbitrario. **Pero alguien tiene que tomar esa foto en cada pedido.**

**4.2 — ¿Y la foto del empaque?**

Igual: suena muy bien, pero hay que cumplirlo siempre. Si no están seguros, es mejor no prometerlo.

**4.3 — ¿En qué horario pueden contestar WhatsApp?**

El sitio promete una respuesta. ¿Lunes a sábado de 8:00 a 19:00? ¿Y si entra un pedido un domingo — se
contesta el lunes, o alguien mira igual?

**4.4 — ¿Confirmamos siempre el peso antes de despachar?**

El sistema cotiza el pedido con el peso que pide el cliente, y nosotros confirmamos el peso real al
despachar. Si el peso real cambia más de 5%, hay que escribirle antes. ¿Están de acuerdo con esa regla?
(Va escrita en los Términos.)

---

## 5. Operación diaria

**⚠️ 5.1 — ¿Quién revisa los pedidos, y cada cuánto?**

Los pedidos caen en una lista dentro del sistema. **Todavía no llega ningún aviso por correo** (no tenemos
proveedor de correo), así que por ahora hay que entrar a mirar.

*Por qué:* si nadie mira, un cliente puede esperar horas sin saber nada.

**⚠️ 5.2 — ¿Desde qué número de WhatsApp escribimos a los clientes?**

Mencionaron un teléfono aparte con WhatsApp Business. ¿Ese es el número que usamos para los pedidos?
**Necesitamos el número exacto**, porque es el que va a quedar en el sistema.

**5.3 — ¿Cuántas personas necesitan acceso al sistema?**

Cada persona con acceso necesita su propio usuario y contraseña.

**5.4 — Si un pedido no se puede cumplir (sin stock), ¿qué hacemos?**

¿Se avisa y se cancela, o se ofrece cambiarlo por otro producto?

**5.5 — ¿Después de cuánto tiempo damos por perdido un pedido sin pago?**

Propuse **3 días**; después pasa a "Vencido" y deja de aparecer entre los pendientes. ¿Les parece bien?

---

## 6. Legal y contabilidad

**⚠️ 6.1 — ¿Cuál es la razón social exacta del negocio?**

Necesitamos saber si es **persona natural con RUC** (el de la mamá) o una compañía, y cómo debe aparecer
escrito en los Términos y en la página de pago. Hoy el sistema dice "Wasi Granel" con el RUC
**0601801327001**. Una plantilla de diseño inventó "Wasi Granel S.A.S." y un RUC equivocado, así que hay que
confirmar el texto exacto.

**6.2 — El abogado:** los Términos y Condiciones y la Política de Privacidad ya están escritos y aprobados,
pero conviene que un abogado los revise antes de publicarlos. Son dos documentos.

**6.3 — El contador:**

- ¿Se puede recibir pagos de clientes en una cuenta **DeUna de persona**, o tiene que ser la de negocio?
- ¿Cómo emitimos **factura** por un pedido hecho en la web? ¿Se la mandamos por WhatsApp?
- El RUC de la mamá, ¿cubre esta venta en línea?

**6.4 — ¿En qué horario y con qué datos aparecemos?**

El sitio dice: *Lunes a Sábado 8:00 – 19:00, Domingos: cerrado*, y los correos
`info@wasigranel.com`. ¿Está todo correcto?

---

## 7. Lanzamiento

**⚠️ 7.1 — ¿Están listos para que el sitio sea público?**

Cuando publiquemos, la página de "Espéranos Pronto" desaparece y el sitio real queda visible para
cualquiera, en todo el mundo. Todavía no hay pasarela de pago ni checkout completo.

**7.2 — ¿Sale con checkout desde el primer día, o primero solo como catálogo?**

Hoy el carrito se ve pero no se puede confirmar un pedido. Si quieren, el sitio puede salir mostrando todo y
recibiendo pedidos solo por WhatsApp y en las tiendas, y el checkout se activa después.

**7.3 — ¿Quién consigue las fotos de los productos?**

Faltan fotos de varios productos del catálogo. ¿Las tomamos nosotros, o hay que encargarlas?

**7.4 — ¿Hay algo del sitio actual que quieran cambiar antes de publicar?**

---

## Resumen de lo que nos bloquea más

Si solo contestan cinco cosas, que sean estas:

1. Los **datos bancarios** y la **imagen del QR de DeUna** (1.1 y 1.2).
2. Si hacemos **contra entrega** fuera de Riobamba o no (1.4).
3. Qué significa **"cerca de Riobamba"** para el envío gratis (2.1).
4. **Qué es la razón social** exacta, y qué dice el contador sobre DeUna de persona y facturas (6.1 y 6.3).
5. Los **precios de los 6 productos** que están en $0 (3.1).
