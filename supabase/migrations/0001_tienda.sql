-- =====================================================================
-- SpaceGaming: base de datos de la tienda
-- Cómo usarlo: Supabase -> SQL Editor -> New query -> pega TODO esto -> Run.
-- Se puede ejecutar una sola vez en un proyecto nuevo.
-- =====================================================================

-- 0. Función de apoyo: revisa que todas las direcciones de una lista empiecen por https://
create or replace function public.all_https(urls text[]) returns boolean
language sql immutable set search_path = '' as $$
  select coalesce(bool_and(u like 'https://%'), true) from unnest(urls) as u
$$;

-- 1. Categorías
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),  -- va en la URL: /categoria/teclados
  name text not null,
  blurb text,                             -- frase corta que se muestra en la categoría
  image_url text,
  position integer not null default 0     -- orden en el menú
);

-- 2. Productos
create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),  -- va en la URL: /producto/mi-teclado
  name text not null,
  brand text,
  description text,
  specs text[] not null default '{}',    -- lista de características
  price integer not null check (price >= 0),          -- en pesos, sin decimales
  old_price integer check (old_price >= 0),           -- precio antes del descuento (opcional)
  stock integer not null default 0 check (stock >= 0),
  image_url text check (image_url is null or image_url like 'https://%'),
  -- fotos adicionales del producto (la principal es image_url)
  gallery text[] not null default '{}' check (public.all_https(gallery)),
  is_active boolean not null default true,            -- false = oculto en la tienda
  created_at timestamptz not null default now()
);

-- 3. Pedidos (se usarán en la fase 2, con la pasarela de pago)
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_document text not null,
  email text not null,
  phone text not null,
  address text not null,
  city text not null,
  total integer not null,
  status text not null default 'pendiente'
    check (status in ('pendiente','pagado','enviado','entregado','cancelado')),
  payment_reference text unique,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity > 0),
  unit_price integer not null
);

-- 4. Newsletter "Space Days"
create table public.newsletter (
  email text primary key check (length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  accepted_policy boolean not null,
  created_at timestamptz not null default now()
);

-- 5. Administradores (tú)
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
$$;

-- =====================================================================
-- SEGURIDAD (RLS). No borres esta parte.
-- =====================================================================
alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.newsletter  enable row level security;
alter table public.admins      enable row level security;

-- Cualquiera puede VER categorías y productos activos
create policy "ver categorias" on public.categories for select using (true);
create policy "ver productos activos" on public.products for select using (is_active or public.is_admin());

-- Solo el admin puede crear, editar o borrar
create policy "admin categorias" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "admin productos"  on public.products   for all using (public.is_admin()) with check (public.is_admin());
create policy "admin pedidos"    on public.orders     for all using (public.is_admin()) with check (public.is_admin());
create policy "admin items"      on public.order_items for all using (public.is_admin()) with check (public.is_admin());
create policy "admin ve newsletter" on public.newsletter for select using (public.is_admin());

-- Los visitantes pueden suscribirse (solo si aceptan la política), pero no ver la lista
create policy "suscribirse" on public.newsletter for insert to anon, authenticated with check (accepted_policy = true);

-- =====================================================================
-- FOTOS DE PRODUCTOS (Storage). Las usa el panel de administración (/admin).
-- Cualquiera puede VER las fotos (son públicas, como en toda tienda);
-- solo el admin puede subirlas, reemplazarlas o borrarlas.
-- Máximo 5 MB por foto y solo JPG, PNG o WebP.
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('productos', 'productos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "admin ve fotos" on storage.objects for select to authenticated
  using (bucket_id = 'productos' and public.is_admin());
create policy "admin sube fotos" on storage.objects for insert to authenticated
  with check (bucket_id = 'productos' and public.is_admin());
create policy "admin cambia fotos" on storage.objects for update to authenticated
  using (bucket_id = 'productos' and public.is_admin())
  with check (bucket_id = 'productos' and public.is_admin());
create policy "admin borra fotos" on storage.objects for delete to authenticated
  using (bucket_id = 'productos' and public.is_admin());

-- =====================================================================
-- DATOS DE EJEMPLO (los mismos de src/data/store.ts). Cámbialos por tus productos reales.
-- =====================================================================
insert into public.categories (slug, name, blurb, position) values
  ('teclados', 'Teclados', 'Mecánicos, compactos y hot-swap para escribir y jugar.', 1),
  ('mouse', 'Mouse', 'Livianos, inalámbricos y con sensores de alta precisión.', 2),
  ('audio', 'Audio', 'Diademas con micrófono para escuchar cada paso.', 3),
  ('mouse-pads', 'Mouse pads', 'Superficies de control y velocidad, en tamaño XL o circular.', 4),
  ('combos', 'Combos', 'Setups completos a mejor precio que por separado.', 5);

insert into public.products (slug, name, brand, category_id, description, specs, price, old_price, stock) values
  ('teclado-mecanico-hyperion-75-hot-swap', 'Teclado mecánico Hyperion 75% hot-swap RGB', 'Hyperion', (select id from public.categories where slug = 'teclados'), 'Formato 75%: conserva flechas y fila de funciones ocupando menos espacio en el escritorio. Los switches se cambian sin soldar.', array['Formato 75%', 'Switches intercambiables (hot-swap)', 'Iluminación RGB por tecla', 'Conexión USB-C'], 389000, 459000, 8),
  ('mouse-inalambrico-viper-26k', 'Mouse inalámbrico Viper 26K DPI, 58 g', 'Viper', (select id from public.categories where slug = 'mouse'), 'Pesa 58 gramos para movimientos rápidos sin cansar la muñeca. Sensor de hasta 26.000 DPI.', array['Sensor de 26.000 DPI', 'Peso de 58 g', 'Inalámbrico 2,4 GHz', 'Batería recargable'], 259000, 299000, 12),
  ('diadema-aurora-7-1-surround', 'Diadema Aurora 7.1 surround ARGB', 'Aurora', (select id from public.categories where slug = 'audio'), 'Sonido envolvente 7.1 para ubicar a tus rivales por el ruido. Micrófono desmontable.', array['Sonido envolvente 7.1 virtual', 'Micrófono desmontable', 'Iluminación ARGB', 'Conexión USB'], 219000, 265000, 6),
  ('mouse-pad-xl-nebula-speed', 'Mouse pad XL Nebula Speed con borde RGB', 'Nebula', (select id from public.categories where slug = 'mouse-pads'), 'Cubre teclado y mouse. Superficie de velocidad con base antideslizante y borde iluminado.', array['Tamaño XL', 'Superficie de velocidad', 'Base de caucho antideslizante', 'Borde RGB por USB'], 129000, null, 20),
  ('combo-setup-pro', 'Combo Setup Pro: teclado, mouse y pad', 'SpaceGaming', (select id from public.categories where slug = 'combos'), 'Teclado mecánico, mouse gamer y mouse pad XL que combinan entre sí. Pagas menos que comprándolos por separado.', array['Teclado mecánico RGB', 'Mouse gamer', 'Mouse pad XL', 'Iluminación sincronizable'], 649000, 749000, 4),
  ('teclado-hyperion-60-silencioso', 'Teclado compacto Hyperion 60% switch rojo silencioso', 'Hyperion', (select id from public.categories where slug = 'teclados'), 'Formato 60% para dejar más espacio al mouse. Switches rojos lineales y silenciosos.', array['Formato 60%', 'Switch rojo silencioso', 'Cable USB-C desmontable', 'Iluminación RGB'], 289000, null, 10),
  ('mouse-viper-pro-esports-8000hz', 'Mouse Viper Pro Esports 8000 Hz', 'Viper', (select id from public.categories where slug = 'mouse'), 'Reporta su posición 8.000 veces por segundo: menos retraso entre tu mano y la pantalla.', array['Tasa de sondeo de 8.000 Hz', 'Switches ópticos', 'Patas de PTFE', 'Cable flexible'], 349000, 399000, 5),
  ('diadema-inalambrica-stellar', 'Diadema inalámbrica Stellar baja latencia', 'Aurora', (select id from public.categories where slug = 'audio'), 'Sin cables y con baja latencia para que el sonido llegue a tiempo. Funciona en PC y consola.', array['Inalámbrica 2,4 GHz y Bluetooth', 'Baja latencia', 'Micrófono con cancelación de ruido', 'Compatible con PC y consola'], 399000, null, 7),
  ('mouse-pad-circular-galaxy', 'Mouse pad circular Galaxy Control', 'Nebula', (select id from public.categories where slug = 'mouse-pads'), 'Superficie de control para frenar el mouse con precisión. Formato circular para escritorios pequeños.', array['Formato circular', 'Superficie de control', 'Bordes cosidos', 'Base antideslizante'], 79000, null, 25),
  ('teclado-tkl-hyperion-pudding', 'Teclado TKL Hyperion ARGB con keycaps pudding', 'Hyperion', (select id from public.categories where slug = 'teclados'), 'Sin teclado numérico (TKL). Las teclas translúcidas dejan pasar más luz.', array['Formato TKL', 'Keycaps pudding translúcidos', 'Iluminación ARGB', 'Anti-ghosting'], 199000, 239000, 9);
