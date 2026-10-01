He completado la **Auditoría de Accesibilidad (WCAG 2.1 Nivel AA/AAA)** sobre la pantalla principal de **Wasi Granel** (`Wasi Granel - Asymmetric Organic Solid`) y generado el informe técnico detallado en el documento **`Informe de Accesibilidad WCAG - Wasi Granel`**.

---

### Resumen Ejecutivo del Diagnóstico

- **Puntaje estimado de accesibilidad:** **82 / 100**
- **Estructura semántica:** Sólida en jerarquía de encabezados (`h1` a `h4`) y landmarks de navegación.
- **Áreas críticas de intervención:**

1. **Botones de sólo icono (Criterio 1.1.1 y 4.1.2 - Nivel A):**
   - *Hallazgo:* Los botones de favoritos (corazón), añadir al carrito (shopping cart) y controles del carrusel carecen de etiquetas descriptivas (`aria-label`). Para lectores de pantalla (NVDA, VoiceOver), se anuncian simplemente como *"botón"*.
   - *Solución:* Incorporar `aria-label="Añadir [Nombre del Producto] al carrito"` y `aria-hidden="true"` a los SVG internos.

2. **Ratio de Contraste en Botones y Acentos Amarillos (Criterio 1.4.3 - Nivel AA):**
   - *Hallazgo:* El amarillo corporativo Wasi (`#FCBF00`) tiene alta luminosidad. Si se combina con blanco (`#FFFFFF`), el ratio es de apenas **1.45:1** (fallo grave). Al contrastarse con Café Tierra (`#544738`), alcanza un excelente **5.14:1** (cumplimiento AA).
   - *Solución:* Mantener tipografía e iconografía en `#544738` de forma estricta sobre cualquier elemento con fondo amarillo.

3. **Navegación por Teclado y Foco Visible (Criterio 2.4.7 - Nivel AA):**
   - *Hallazgo:* No se definen estilos explícitos para `:focus-visible` en enlaces y botones, dificultando la orientación visual de usuarios que navegan mediante tabulación (`Tab`).
   - *Solución:* Añadir anillos de foco visibles (`outline: 2px solid #544738; outline-offset: 2px`).

4. **Etiquetado de Formularios (Criterio 3.3.2 - Nivel A):**
   - *Hallazgo:* El input del boletín/newsletter confía exclusivamente en el atributo `placeholder`.
   - *Solución:* Añadir un `<label for="..." class="sr-only">Correo electrónico para suscripción</label>`.

---

¿Deseas que apliquemos de inmediato estas correcciones directamente en el código de la pantalla?