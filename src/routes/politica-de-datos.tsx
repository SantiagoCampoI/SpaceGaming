import { createFileRoute } from "@tanstack/react-router";
import { site } from "@/config/site";

/**
 * Política de tratamiento de datos personales.
 *
 * IMPORTANTE: este texto es un punto de partida que describe lo que la página hace hoy
 * (newsletter y pedidos por WhatsApp). No es asesoría legal. Antes de publicar, complétalo
 * con tus datos en src/config/site.ts (legalName, documentId) y hazlo revisar por alguien
 * que conozca la Ley 1581 de 2012. Si agregas pasarela de pago, cuentas de usuario o
 * analítica, esta página debe actualizarse.
 */
export const Route = createFileRoute("/politica-de-datos")({
  head: () => ({
    meta: [
      { title: "Política de datos | SpaceGaming" },
      {
        name: "description",
        content:
          "Qué datos personales recoge SpaceGaming, para qué los usa y cómo pedir que se eliminen.",
      },
      { property: "og:url", content: `${site.url}/politica-de-datos` },
    ],
    links: [{ rel: "canonical", href: `${site.url}/politica-de-datos` }],
  }),
  component: DataPolicyPage,
});

function DataPolicyPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-10 sm:px-6">
      <h1 className="text-[clamp(2rem,4vw,3rem)] font-semibold">Política de datos</h1>
      <div className="mt-6 max-w-[65ch] space-y-8 text-[17px] leading-relaxed text-muted-foreground">
        <section aria-labelledby="pd-responsable">
          <h2 id="pd-responsable" className="text-xl font-semibold text-foreground">
            Quién es el responsable
          </h2>
          <p className="mt-2">
            {site.legalName}
            {site.documentId ? `, identificado con ${site.documentId}` : ""}. Correo de contacto:{" "}
            <a href={`mailto:${site.email}`} className="text-orbit hover:underline">
              {site.email}
            </a>
            .
          </p>
        </section>

        <section aria-labelledby="pd-datos">
          <h2 id="pd-datos" className="text-xl font-semibold text-foreground">
            Qué datos recogemos y para qué
          </h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              <span className="text-foreground">Correo electrónico</span>, si te suscribes a Space
              Days. Lo usamos solo para avisarte de ofertas y productos nuevos.
            </li>
            <li>
              <span className="text-foreground">Datos del pedido</span> que nos envías por WhatsApp
              (nombre, teléfono, ciudad y dirección). Los usamos para confirmar, cobrar y entregar
              tu compra, y para atender garantías.
            </li>
            <li>
              <span className="text-foreground">Tu carrito</span> se guarda únicamente en tu
              navegador. No lo recibimos hasta que nos envías el pedido.
            </li>
          </ul>
        </section>

        <section aria-labelledby="pd-derechos">
          <h2 id="pd-derechos" className="text-xl font-semibold text-foreground">
            Tus derechos
          </h2>
          <p className="mt-2">
            Puedes pedir en cualquier momento conocer, corregir o eliminar tus datos, y dejar de
            recibir nuestros correos, según la Ley 1581 de 2012. Escríbenos a{" "}
            <a href={`mailto:${site.email}`} className="text-orbit hover:underline">
              {site.email}
            </a>
            .
          </p>
        </section>

        <section aria-labelledby="pd-terceros">
          <h2 id="pd-terceros" className="text-xl font-semibold text-foreground">
            Con quién los compartimos
          </h2>
          <p className="mt-2">
            No vendemos tus datos. Solo los compartimos con la transportadora que entrega tu pedido
            y con los servicios que usamos para operar la tienda.
          </p>
        </section>
      </div>
    </div>
  );
}
