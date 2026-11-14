import { createFileRoute, Link } from "@tanstack/react-router";
import { Truck, ShieldCheck, MessageCircle, PackageCheck } from "lucide-react";

import { Hero } from "@/components/Hero";
import { CategoryTiles } from "@/components/CategoryTiles";
import { ProductGrid, Section } from "@/components/ProductGrid";
import { NewsletterForm } from "@/components/NewsletterForm";
import { getCategories, getProducts } from "@/lib/catalog";
import { site } from "@/config/site";
import { cop } from "@/lib/format";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [products, categories] = await Promise.all([getProducts(), getCategories()]);
    return { products, categories };
  },
  head: () => ({
    meta: [{ property: "og:url", content: site.url }],
    links: [{ rel: "canonical", href: site.url }],
  }),
  component: Index,
});

function Index() {
  const { products, categories } = Route.useLoaderData();

  const counts = Object.fromEntries(
    categories.map((c) => [c.slug, products.filter((p) => p.category === c.slug).length]),
  );
  const featured = products.find((p) => p.category === "combos") ?? products[0];
  const deals = products.filter((p) => p.oldPrice && p.oldPrice > p.price && p.id !== featured?.id);
  const rest = products.filter((p) => !deals.includes(p) && p.id !== featured?.id);

  const perks = [
    {
      Icon: Truck,
      title: "Envío a toda Colombia",
      sub:
        site.freeShippingFrom > 0
          ? `Gratis en compras desde ${cop(site.freeShippingFrom)}`
          : "Despachamos a cualquier ciudad",
    },
    {
      Icon: ShieldCheck,
      title: "Productos originales",
      sub: "Con factura y garantía del fabricante",
    },
    {
      Icon: MessageCircle,
      title: "Asesoría antes de comprar",
      sub: "Te ayudamos a elegir por WhatsApp",
    },
    {
      Icon: PackageCheck,
      title: "Derecho de retracto",
      sub: "5 días hábiles para devolver tu compra",
    },
  ];

  return (
    <>
      <Hero featured={featured} />
      <CategoryTiles categories={categories} counts={counts} />

      {deals.length > 0 && (
        <Section
          id="titulo-ofertas"
          title="Ofertas de la semana"
          aside={
            <Link to="/ofertas" className="shrink-0 text-[15px] text-orbit hover:underline">
              Ver todas
            </Link>
          }
        >
          <ProductGrid products={deals} />
        </Section>
      )}

      <section
        aria-label="Por qué comprar aquí"
        className="mx-auto mt-20 max-w-[1280px] px-4 sm:px-6"
      >
        <ul className="grid gap-6 border-t pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map(({ Icon, title, sub }) => (
            <li key={title} className="flex items-start gap-3">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-orbit" strokeWidth={1.75} aria-hidden />
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-[15px] text-muted-foreground">{sub}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 border-b pb-8 text-[15px]">
          <Link to="/ayuda" className="text-orbit hover:underline">
            Ver envíos, formas de pago y garantía
          </Link>
        </p>
      </section>

      {rest.length > 0 && (
        <Section id="titulo-catalogo" title="Más del catálogo">
          <ProductGrid products={rest} />
        </Section>
      )}

      <NewsletterForm />
    </>
  );
}
