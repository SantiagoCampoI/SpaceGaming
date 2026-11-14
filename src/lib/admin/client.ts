/**
 * Cliente de Supabase SOLO para el panel de administración.
 *
 * La tienda pública no lo usa (lee el catálogo con src/lib/supabase.ts, sin librerías).
 * Aquí sí hace falta la librería oficial porque maneja el inicio de sesión: guarda la
 * sesión, la renueva sola y la envía en cada consulta. Se descarga únicamente al entrar
 * a /admin, así que no hace más pesada la tienda para los visitantes.
 *
 * Usa la misma llave pública de siempre. Lo que impide que un extraño edite productos
 * NO es este archivo: son las reglas RLS de la base de datos (solo quien esté en la tabla
 * "admins" puede escribir). Aunque alguien abra /admin, sin esa fila no puede cambiar nada.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const adminConfigured = Boolean(url && key);

let client: Promise<SupabaseClient> | undefined;

export function getAdminClient(): Promise<SupabaseClient> {
  if (!url || !key) return Promise.reject(new Error("Supabase no está configurado"));
  client ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: "spacegaming-admin" },
    }),
  );
  return client;
}
