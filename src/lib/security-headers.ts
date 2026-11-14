/**
 * Encabezados de seguridad que se agregan a todas las respuestas del servidor.
 *
 * - En desarrollo (npm run dev) solo se ponen los básicos, para no romper la
 *   vista previa de Lovable ni la recarga automática de Vite.
 * - En producción se agrega la Política de Seguridad de Contenido (CSP), que le dice
 *   al navegador de dónde puede cargar scripts, estilos, fuentes e imágenes.
 *
 * Si algún día agregas un servicio externo (pasarela de pago, analítica, Turnstile...),
 * agrega su dominio en la directiva que corresponda o el navegador lo bloqueará.
 */

const supabaseOrigin = (() => {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL;
    return url ? new URL(url).origin : "";
  } catch {
    return "";
  }
})();

const csp = [
  "default-src 'self'",
  // TanStack Start necesita scripts en línea para arrancar la página.
  // El riesgo de XSS se controla escapando los datos (ver src/lib/safe-json.ts).
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  `img-src 'self' data: blob:${supabaseOrigin ? ` ${supabaseOrigin}` : ""}`,
  `connect-src 'self'${supabaseOrigin ? ` ${supabaseOrigin}` : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const baseHeaders: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  "Cross-Origin-Opener-Policy": "same-origin",
};

const productionHeaders: Record<string, string> = {
  "Content-Security-Policy": csp,
  "X-Frame-Options": "DENY",
  // Obliga a usar HTTPS durante un año. Actívalo solo cuando el dominio ya funcione con HTTPS.
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

export function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  const all = import.meta.env.PROD ? { ...baseHeaders, ...productionHeaders } : baseHeaders;
  for (const [name, value] of Object.entries(all)) {
    if (!headers.has(name)) headers.set(name, value);
  }
  // No revelar qué tecnología usa el servidor
  headers.delete("X-Powered-By");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
