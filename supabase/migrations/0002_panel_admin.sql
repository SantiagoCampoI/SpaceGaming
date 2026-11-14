-- =====================================================================
-- SOLO si ya habías ejecutado 0001_tienda.sql ANTES del 13 de noviembre de 2026.
-- Si vas a crear la base desde cero, NO necesitas este archivo: 0001 ya lo incluye.
-- Agrega lo que usa el panel de administración: galería de fotos y almacenamiento.
-- =====================================================================
create or replace function public.all_https(urls text[]) returns boolean
language sql immutable set search_path = '' as $$
  select coalesce(bool_and(u like 'https://%'), true) from unnest(urls) as u
$$;

alter table public.products
  add column if not exists gallery text[] not null default '{}' check (public.all_https(gallery));

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
