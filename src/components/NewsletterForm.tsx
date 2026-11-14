import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { subscribeNewsletter } from "@/lib/catalog";

type Status = "idle" | "sending" | "ok" | "ya-estaba" | "no-configurado" | "error";

const messages: Record<Exclude<Status, "idle" | "sending">, string> = {
  ok: "Listo. Te escribiremos cuando haya ofertas o lanzamientos.",
  "ya-estaba": "Ese correo ya estaba suscrito.",
  "no-configurado": "El registro todavía no está activo. Escríbenos por WhatsApp mientras tanto.",
  error: "No pudimos guardar tu correo. Revisa que esté bien escrito e inténtalo de nuevo.",
};

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [needsConsent, setNeedsConsent] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accepted) {
      // El botón queda activo y aquí se explica qué falta, en vez de un botón gris sin motivo
      setNeedsConsent(true);
      document.getElementById("newsletter-acepto")?.focus();
      return;
    }
    setNeedsConsent(false);
    setStatus("sending");
    setStatus(await subscribeNewsletter(email));
  };

  return (
    <section
      aria-labelledby="titulo-newsletter"
      className="mx-auto mt-24 max-w-[1280px] px-4 sm:px-6"
    >
      <div className="grid gap-8 rounded-3xl border bg-card px-6 py-10 sm:px-10 md:grid-cols-2 md:items-center">
        <div>
          <h2 id="titulo-newsletter" className="text-2xl font-semibold sm:text-3xl">
            Space Days
          </h2>
          <p className="mt-2 max-w-[42ch] text-muted-foreground">
            Una vez al mes avisamos ofertas y productos nuevos. Solo eso, y puedes salirte cuando
            quieras.
          </p>
        </div>
        {status === "ok" || status === "ya-estaba" ? (
          <p role="status" className="text-lg">
            {messages[status]}
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">
                Correo electrónico
              </label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com…"
                className="h-12 flex-1 rounded-full border border-input bg-secondary/70 px-5 text-[15px] placeholder:text-muted-foreground focus-visible:border-orbit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orbit/60"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="h-12 rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
              >
                {status === "sending" ? "Suscribiendo…" : "Suscribirme"}
              </button>
            </div>
            <div className="flex items-start gap-2.5 text-[13px] text-muted-foreground">
              <input
                id="newsletter-acepto"
                type="checkbox"
                name="acepto"
                checked={accepted}
                onChange={(e) => {
                  setAccepted(e.target.checked);
                  if (e.target.checked) setNeedsConsent(false);
                }}
                aria-describedby={needsConsent ? "newsletter-falta" : undefined}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--orbit)]"
              />
              <span>
                <label htmlFor="newsletter-acepto">
                  Acepto el tratamiento de mis datos para recibir comunicaciones de SpaceGaming (Ley
                  1581 de 2012).
                </label>{" "}
                <Link to="/politica-de-datos" className="text-orbit underline underline-offset-2">
                  Leer la política de datos
                </Link>
              </span>
            </div>
            {needsConsent && (
              <p id="newsletter-falta" role="alert" className="text-[13px] text-promo">
                Marca la casilla de aceptación para poder suscribirte.
              </p>
            )}
            {(status === "error" || status === "no-configurado") && (
              <p role="alert" className="text-[13px] text-promo">
                {messages[status]}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
