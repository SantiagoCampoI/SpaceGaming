import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

import { site, whatsappLink } from "@/config/site";
import { cop } from "@/lib/format";

/**
 * Página de ayuda: cómo comprar, envíos, pagos, garantía y retracto.
 *
 * Todo lo que aquí se promete sale de src/config/site.ts o ya estaba dicho en otras partes
 * de la tienda. Si cambias una condición (ej. el valor del envío gratis), cámbiala allá.
 * Revisa estos textos antes de publicar: son compromisos con tus clientes.
 */
export const Route = createFileRoute("/ayuda")({
  head: () => ({
    meta: [
      { title: "Envíos, pagos y garantía | SpaceGaming" },
      {
        name: "description",
        content:
          "Cómo comprar en SpaceGaming: envíos a toda Colombia, formas de pago, garantía y derecho de retracto.",
      },
      { property: "og:title", content: "Envíos, pagos y garantía | SpaceGaming" },
      { property: "og:url", content: `${site.url}/ayuda` },
    ],
    links: [{ rel: "canonical", href: `${site.url}/ayuda` }],
  }),
  component: HelpPage,
});

const sections = [
  { id: "como-comprar", title: "Cómo comprar" },
  { id: "envios", title: "Envíos" },
  { id: "pagos", title: "Formas de pago" },
  { id: "garantia", title: "Garantía" },
  { id: "retracto", title: "Devoluciones y retracto" },
  { id: "contacto", title: "Contacto" },
] as const;

function Block({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t py-10">
      <h2 id={id} className="text-2xl font-semibold">
        {title}
      </h2>
      <div className="mt-4 max-w-[65ch] space-y-3 text-[17px] leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function HelpPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-10 sm:px-6">
      <h1 className="text-[clamp(2rem,4vw,3rem)] font-semibold">Envíos, pagos y garantía</h1>
      <p className="mt-2 max-w-[60ch] text-lg text-muted-foreground">
        Lo que necesitas saber antes de comprar. Si te queda una duda, escríbenos por WhatsApp.
      </p>

      <nav aria-label="En esta página" className="mt-8">
        <ul className="flex flex-wrap gap-2">
          {sections.map((s) => (
            <li key={s.id}>
              <Link
                to="/ayuda"
                hash={s.id}
                className="inline-flex h-11 items-center rounded-full bg-secondary px-4 text-[15px] hover:bg-secondary/70"
              >
                {s.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-10">
        <Block id="como-comprar" title="Cómo comprar">
          <ol className="list-decimal space-y-2 pl-5">
            <li>Agrega al carrito los productos que quieres.</li>
            <li>
              Abre el carrito y pulsa <span className="text-foreground">Finalizar pedido</span>. Se
              abre WhatsApp con tu pedido ya escrito.
            </li>
            <li>
              Envía el mensaje con tu ciudad. Te confirmamos disponibilidad, costo de envío y forma
              de pago por el chat.
            </li>
          </ol>
          <p>No tienes que crear una cuenta para comprar.</p>
        </Block>

        <Block id="envios" title="Envíos">
          <p>Enviamos a toda Colombia.</p>
          {site.freeShippingFrom > 0 ? (
            <p>
              El envío es gratis en compras desde{" "}
              <span className="tabular text-foreground">{cop(site.freeShippingFrom)}</span>. Por
              debajo de ese valor, el costo depende de tu ciudad y te lo confirmamos antes de que
              pagues.
            </p>
          ) : (
            <p>El costo depende de tu ciudad y te lo confirmamos antes de que pagues.</p>
          )}
          {site.shippingTime ? (
            <p>
              Tiempo de entrega: <span className="text-foreground">{site.shippingTime}</span>.
            </p>
          ) : (
            <p>El tiempo de entrega depende de tu ciudad. Te lo decimos al confirmar el pedido.</p>
          )}
          {site.cities.length > 0 && <p>Atendemos directamente en {site.cities.join(", ")}.</p>}
        </Block>

        <Block id="pagos" title="Formas de pago">
          {site.paymentMethods.length > 0 ? (
            <>
              <p>Aceptamos:</p>
              <ul className="list-disc space-y-1 pl-5">
                {site.paymentMethods.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </>
          ) : (
            <p>La forma de pago la acordamos contigo por WhatsApp al confirmar el pedido.</p>
          )}
          <p>Todos los precios están en pesos colombianos e incluyen IVA.</p>
        </Block>

        <Block id="garantia" title="Garantía">
          <p>Vendemos productos originales, con factura y garantía del fabricante.</p>
          <p>
            Si tu producto falla, escríbenos por WhatsApp con el número de pedido y una foto o video
            de la falla. Te indicamos los pasos para hacer efectiva la garantía.
          </p>
        </Block>

        <Block id="retracto" title="Devoluciones y retracto">
          <p>
            Tienes 5 días hábiles desde que recibes tu compra para retractarte, como lo establece el
            Estatuto del Consumidor (Ley 1480 de 2011).
          </p>
          <p>Escríbenos dentro de ese plazo y te explicamos cómo devolver el producto.</p>
        </Block>

        <Block id="contacto" title="Contacto">
          <ul className="space-y-2">
            <li>
              WhatsApp: <span className="tabular text-foreground">{site.phoneDisplay}</span>
            </li>
            <li>
              Correo:{" "}
              <a href={`mailto:${site.email}`} className="text-orbit hover:underline">
                {site.email}
              </a>
            </li>
          </ul>
          <a
            href={whatsappLink("Hola SpaceGaming, tengo una pregunta.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Escribir por WhatsApp
          </a>
        </Block>
      </div>
    </div>
  );
}
