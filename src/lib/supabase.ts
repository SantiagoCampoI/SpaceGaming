/**
 * Conexión mínima con Supabase usando su API REST (sin librerías extra).
 *
 * Necesita dos variables de entorno (ver .env.example):
 *   VITE_SUPABASE_URL       -> la "Project URL" de tu proyecto
 *   VITE_SUPABASE_ANON_KEY  -> la llave "publishable" (sb_publishable_...) o la antigua "anon".
 *                              Es pública a propósito.
 *
 * NUNCA pongas aquí la llave "service_role" / "secret": esa da acceso total y
 * cualquier variable que empiece por VITE_ termina visible en el navegador.
 * La seguridad real la ponen las reglas RLS de supabase/migrations/0001_tienda.sql.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseEnabled = Boolean(url && anonKey);

type RestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  /** Encabezado Prefer de PostgREST, ej. "return=minimal" */
  prefer?: string;
};

/** Llama a /rest/v1/<path>. Devuelve { data, status }. */
export async function supabaseRest<T>(path: string, opts: RestOptions = {}) {
  if (!url || !anonKey) throw new Error("Supabase no está configurado");
  const headers: Record<string, string> = { apikey: anonKey };
  // Las llaves antiguas ("anon") son JWT y también van en Authorization.
  // Las nuevas ("sb_publishable_...") solo van en el encabezado apikey.
  if (anonKey.startsWith("eyJ")) headers["Authorization"] = `Bearer ${anonKey}`;
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.prefer) headers["Prefer"] = opts.prefer;

  const res = await fetch(`${url}/rest/v1/${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : null,
    // Si Supabase no responde en 8 segundos, se corta en vez de dejar la página cargando
    signal: AbortSignal.timeout(8000),
  });
  const text = await res.text();
  const data = text ? (JSON.parse(text) as T) : (null as T);
  return { data, status: res.status, ok: res.ok };
}
