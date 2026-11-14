# Conectar Supabase paso a paso

Mientras no hagas esto, la tienda funciona igual con los productos de ejemplo de `src/data/store.ts`.
Cuando la conectes, los productos se leen de tu base de datos y el newsletter guarda los correos.

## 1. Crear el proyecto (5 minutos)

1. Entra a <https://supabase.com> y crea una cuenta (puedes usar tu cuenta de GitHub).
2. **New project**. Nombre: `spacegaming`. Región: **South America (São Paulo)**, la más cercana a Colombia.
3. Guarda la contraseña de la base de datos en un lugar seguro (un gestor de contraseñas).

## 2. Crear las tablas

1. En el menú izquierdo: **SQL Editor → New query**.
2. Abre el archivo `supabase/migrations/0001_tienda.sql`, copia **todo** y pégalo.
3. Pulsa **Run**. Debe decir "Success".
4. Ve a **Table Editor**: verás `products`, `categories`, etc., con los 10 productos de ejemplo.

> ¿Ya habías ejecutado `0001_tienda.sql` antes del 13 de noviembre de 2026? Entonces no lo repitas:
> ejecuta solo `supabase/migrations/0002_panel_admin.sql`, que agrega lo que usa el panel.

## 3. Conectar la página

1. En Supabase: **Project Settings → API Keys** y **Data API**. Copia:
   - **Project URL** (`https://xxxx.supabase.co`)
   - La **Publishable key** (`sb_publishable_...`) o, en proyectos antiguos, la **anon** (`eyJ...`).
   - NUNCA la **Secret key** (`sb_secret_...`) ni la `service_role`.
2. En la carpeta del proyecto, copia `.env.example` con el nombre `.env` y pega esos dos datos.
3. Reinicia `npm run dev`. Los productos ahora vienen de Supabase.
4. En Cloudflare agrégalas en **Settings → Build → Build variables and secrets** (se usan al
   compilar). Guía completa en el documento del plan, pestaña "Guía: Cloudflare y seguridad".

> Si usas Lovable: también puedes conectar tu proyecto de Supabase desde el botón de Supabase en el
> editor. Lovable agregará su propia librería; esta conexión sigue funcionando.

## 4. Crear tu usuario administrador

Sin este paso nadie puede entrar al panel, ni siquiera tú.

1. En Supabase: **Authentication → Users → Add user → Create new user**. Escribe tu correo y una
   contraseña larga que no uses en otro sitio. Marca **Auto Confirm User**.
2. Copia el **UID** del usuario que aparece en la lista.
3. En **SQL Editor** ejecuta, con tu UID entre las comillas:
   `insert into public.admins values ('PEGA-EL-UID');`
4. Recomendado: en **Authentication → Sign In / Providers → Email**, desactiva **Allow new users
   to sign up**. La tienda no tiene registro de clientes, así que nadie más necesita crear cuentas.

## 5. Usar el panel de administración

Entra a `/admin` en tu tienda (ej. `http://localhost:3000/admin`) con ese correo y contraseña.

- **Nuevo producto**: nombre, marca, categoría, precio, precio anterior (si está en oferta),
  unidades, descripción, especificaciones y fotos.
- **Fotos**: sube varias a la vez. La primera es la principal (la de las tarjetas); con la estrella
  eliges otra. Se reducen solas a 1600 px y se convierten a WebP para que la tienda cargue rápido.
- **Visible / Oculto**: oculta un producto sin borrarlo. Úsalo cuando se agote por un tiempo.
- **Eliminar**: pide confirmación y no se puede deshacer. Un producto que ya aparece en pedidos no
  se puede borrar; ocúltalo.
- Los cambios se ven en la tienda en un minuto como máximo.

Los precios van en pesos enteros, sin puntos: `389000`.

Las categorías todavía se editan en Supabase: **Table Editor → categories**.

### ¿Es seguro que el panel esté en una dirección pública?

Sí. Cualquiera puede abrir `/admin` y ver la pantalla de inicio de sesión, pero la protección no
está en la página sino en la base de datos: solo un usuario que esté en la tabla `admins` puede
crear, cambiar o borrar productos y fotos. Todo lo demás lo rechaza Supabase.

Lo que sí depende de ti: usa una contraseña fuerte y no compartas el usuario.

## Ver los correos del newsletter

**Table Editor → newsletter**. Desde la página nadie puede leer esa lista; solo tú desde el panel de Supabase.
