# Qué cambió (27 de octubre de 2026)

Copia de seguridad de cómo estaba todo antes: `respaldo-original-2026-10-27.tar.gz`.

## Lo primero que debes editar

**`src/config/site.ts`**: número de WhatsApp, teléfono, correo, redes sociales, dominio y valor del
envío gratis. Todo lo marcado con `CAMBIAR`. Hoy el WhatsApp es un número falso (`573000000000`).

## Diseño nuevo

- Paleta azul noche con blanco "luz de estrella" para los botones (el mismo blanco del logo), violeta
  para enlaces y foco, y coral solo para descuentos. Está documentada al inicio de `src/styles.css`.
- Tipografías: **Tektur** (titulares y precios) e **Instrument Sans** (texto).
- Portada: el producto destacado aparece como un planeta con el anillo del logo.
- El logo ahora tiene fondo transparente (`src/assets/logo-transparente.webp`).
- Imágenes convertidas a WebP: pesan entre 3 y 6 veces menos.
- Se quitaron el carrusel automático y las estrellas animadas (hacían lenta la página en celulares).

## Páginas nuevas

| Dirección           | Qué es                                                                   |
| ------------------- | ------------------------------------------------------------------------ |
| `/producto/<slug>`  | Página de cada producto, con datos para Google (precio y disponibilidad) |
| `/categoria/<slug>` | Teclados, mouse, audio, mouse pads, combos                               |
| `/ofertas`          | Productos con descuento, ordenados por ahorro                            |
| `/buscar?q=`        | Buscador (encuentra "teclado mecanico" aunque no escribas tildes)        |
| `/sitemap.xml`      | Lista de páginas para Google                                             |

## Funciones nuevas

- **Carrito real**: suma productos, cambia cantidades, se guarda al recargar y avisa cuánto falta para
  el envío gratis.
- **Finalizar pedido por WhatsApp**: arma el mensaje con los productos y el total. Es temporal hasta
  conectar la pasarela de pago (fase 2).
- **Newsletter** con casilla de aceptación de datos (Ley 1581). Guarda en Supabase cuando lo conectes.
- **Supabase listo para conectar**: ver `LEEME-SUPABASE.md`.
- Página 404 y de error en español; menú para celular; enlace "Saltar al contenido" y foco visible
  para quien navega con teclado.

## Archivos que ya no se usan

`HeroCarousel.tsx`, `CategoryIcons.tsx`, `Starfield.tsx` y las fotos `.jpg` de `src/assets` quedaron
sin uso. Puedes borrarlos cuando quieras; no afectan la página.

# Revisión de seguridad (1 de noviembre de 2026)

**Paso obligatorio en tu PC** (paquetes con vulnerabilidades críticas). En la carpeta del proyecto:

```bash
npm install @tanstack/react-start@latest @tanstack/react-router@latest @tanstack/router-plugin@latest
npm ls seroval     # todas las líneas deben decir 1.6.11 o más
npm audit          # nada "critical" ni "high"
npm run build
```

Corregido en el código:

- Inyección de código (XSS) en los datos de producto para Google → `src/lib/safe-json.ts`.
- Encabezados de seguridad en todas las respuestas (CSP, HSTS, X-Frame-Options, etc.) →
  `src/lib/security-headers.ts`, usado en `src/server.ts`.
- Si Supabase falla ya no se muestran los productos de ejemplo (precios falsos): sale la página de error.
- El carrito guardado en el navegador valida cada dato antes de usarlo.
- La base de datos rechaza slugs raros, fotos que no sean `https://` y correos de más de 254 caracteres.
- Compatibilidad con las llaves nuevas de Supabase (`sb_publishable_...`).
- Buscador con `id` único (accesibilidad) y foto de producto fuera del orden de tabulación.

No hay contraseñas ni llaves en el código. Las llaves de Supabase van en `.env` (no se sube a GitHub).

# Revisión con las skills instaladas (13 de noviembre de 2026)

Se revisó el proyecto con `vercel-react-best-practices`, `vercel-composition-patterns`,
`web-design-guidelines` e `information-architecture`. Conclusión: **no hacía falta rehacerlo**.
La estructura, el diseño y la seguridad ya estaban bien; se corrigió lo que faltaba.

## Lo primero que debes editar (nuevo en `src/config/site.ts`)

- `shippingTime`: tiempo de entrega que prometes. Vacío = la página no promete plazo.
- `paymentMethods`: medios de pago que aceptas. Vacío = "se acuerda por WhatsApp".
- `legalName` y `documentId`: responsable de la tienda, para la política de datos.

Sigue pendiente lo de antes: el WhatsApp (`573000000000`) y el teléfono son falsos.

## Páginas nuevas

| Dirección            | Qué es                                                              |
| -------------------- | ------------------------------------------------------------------- |
| `/ayuda`             | Cómo comprar, envíos, formas de pago, garantía, retracto y contacto |
| `/politica-de-datos` | Qué datos se recogen y cómo pedir que se borren                     |

Están enlazadas desde el pie de página, el menú del celular, la portada, cada producto, el carrito
y la casilla del newsletter. **Lee los textos antes de publicar**: son compromisos con tus clientes.
La política de datos es un punto de partida, no asesoría legal; hazla revisar.

## Funciones nuevas

- **Ordenar y filtrar por marca** en cada categoría y en Ofertas. El filtro queda en la dirección
  (`/ofertas?marca=Viper&orden=precio-asc`), así se puede compartir y el botón "atrás" lo deshace.
- **Deshacer** al quitar un producto del carrito.
- **Transición entre páginas**: la foto del producto pasa de la tarjeta a la página de detalle.
  Se apaga sola si el visitante pidió menos movimiento en su dispositivo.
- La ruta de navegación del producto ahora muestra también el producto actual.

## Corregido en el código

- **El menú y el pie leían siempre las categorías de ejemplo.** Al conectar Supabase habrían
  mostrado categorías distintas a las de tu base de datos. Ahora salen del mismo lugar que el resto.
- **Carrito más liviano**: antes, cambiar una cantidad volvía a dibujar todas las tarjetas de
  producto de la página. Ahora las tarjetas no se enteran (`src/lib/cart.tsx`).
- **Menos consultas a Supabase**: la página de producto pedía los productos dos veces, una
  después de la otra. Ahora productos y categorías se piden a la vez y se recuerdan 60 segundos
  (`src/lib/catalog.ts`).
- Accesibilidad: foco visible en el buscador y el newsletter (antes se quitaba el borde de foco),
  botones del carrito más grandes para el dedo (44 px), iconos decorativos ocultos a lectores de
  pantalla, y el newsletter explica qué falta en vez de dejar el botón gris.
- Google: dirección canónica en la portada, datos de la tienda y ruta de navegación estructurados,
  y las páginas nuevas en `/sitemap.xml`.
- Un error de tipos en `src/routes/__root.tsx` que hacía fallar `npx tsc --noEmit`.

## Lo que NO se tocó

Diseño (colores, tipografías, portada), base de datos, encabezados de seguridad y el pedido por
WhatsApp. Los productos siguen siendo los 10 de ejemplo.

# Panel de administración (13 de noviembre de 2026)

Nueva sección `/admin` para crear y editar productos sin tocar código ni entrar a Supabase.
Cómo activarla y usarla: `LEEME-SUPABASE.md`, pasos 4 y 5.

- Iniciar sesión con correo y contraseña (el usuario se crea en Supabase).
- Lista de productos con interruptor Visible / Oculto.
- Formulario con datos básicos, precio e inventario, descripción, especificaciones y fotos.
- Varias fotos por producto. La página del producto ahora muestra miniaturas para cambiarlas.
- Eliminar con confirmación.

Qué cambió por dentro:

- `supabase/migrations/0001_tienda.sql` ahora incluye la columna `gallery` (fotos adicionales) y el
  almacenamiento de fotos con sus permisos. `0002_panel_admin.sql` es lo mismo para quien ya había
  ejecutado el 0001.
- Se agregó la librería `@supabase/supabase-js`. Solo se descarga al entrar a `/admin`; la tienda
  pública sigue igual de liviana.
- `/admin` no aparece en Google (`robots.txt` y etiqueta `noindex`).

**Probado contra un Supabase simulado, no contra uno real.** Entrar, crear con fotos, editar,
ocultar, eliminar y ver el producto en la tienda funcionaron. Los permisos de la base de datos
(el archivo SQL) no se pudieron ejecutar aquí: la primera vez que lo conectes, prueba crear un
producto con foto y avisa si Supabase muestra algún error.

Pendiente: editar categorías desde el panel, ver pedidos y borrar del almacenamiento las fotos
que quitas de un producto (hoy quedan guardadas sin usarse).
