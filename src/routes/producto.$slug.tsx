import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, Minus, Plus, MessageCircle, Truck, ShieldCheck } from "lucide-react";

import { getProducts, getCategories } from "@/lib/catalog";
import { cop, discountPercent } from "@/lib/format";
import { useCartActions } from "@/lib/cart";
import { site, whatsappLink } from "@/config/site";
import { ProductGrid, Section } from "@/components/ProductGrid";
import { jsonForScript } from "@/lib/safe-json";
import type { Product } from "@/data/store";

export const Route = createFileRoute("/producto/$slug")({
  loader: async ({ params }) => {
    // Productos y categorías se piden al mismo tiempo, no uno después del otro
    const [all, categories] = await Promise.all([getProducts(), getCategories()]);
    const product = all.find((p) => p.slug === params.slug);
    if (!product) throw notFound();
    const related = all
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
    const category = categories.find((c) => c.slug === product.category);
    return { product, related, category };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { product, category } = loaderData;
    const title = `${product.name} | SpaceGaming`;
    const description = `${product.description} Precio: ${cop(product.price)}. Envío a toda Colombia.`;
    const image = product.image.startsWith("http") ? product.image : `${site.url}${product.image}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:image", content: image },
        { property: "og:url", content: `${site.url}/producto/${product.slug}` },
      ],
      links: [{ rel: "canonical", href: `${site.url}/producto/${product.slug}` }],
      scripts: [
        {
          // Datos estructurados: permiten que Google muestre precio y disponibilidad
          type: "application/ld+json",
          children: jsonForScript({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            brand: { "@type": "Brand", name: product.brand },
            description: product.description,
            image,
            offers: {
              "@type": "Offer",
              priceCurrency: "COP",
              price: product.price,
              availability:
                product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              url: `${site.url}/producto/${product.slug}`,
            },
          }),
        },
        {
          // Ruta de navegación para Google: Inicio > Categoría > Producto
          type: "application/ld+json",
          children: jsonForScript({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Inicio", item: site.url },
              ...(category
                ? [
                    {
                      "@type": "ListItem",
                      position: 2,
                      name: category.name,
                      item: `${site.url}/categoria/${category.slug}`,
                    },
                  ]
                : []),
              { "@type": "ListItem", position: category ? 3 : 2, name: product.name },
            ],
          }),
        },
      ],
    };
  },
  component: ProductPage,
});

/**
 * Foto grande del producto y, si tiene más de una, miniaturas para cambiarla.
 * Las fotos adicionales se suben desde el panel de administración.
 */
function Gallery({ product, off }: { product: Product; off: number }) {
  const photos = [product.image, ...(product.gallery ?? [])].filter(Boolean);
  const [current, setCurrent] = useState(0);
  const shown = photos[current] ?? product.image;

  return (
    <div className="self-start md:sticky md:top-32">
      <div className="relative overflow-hidden rounded-3xl bg-card">
        <img
          src={shown}
          alt={photos.length > 1 ? `${product.name}, foto ${current + 1}` : product.name}
          width={800}
          height={800}
          fetchPriority="high"
          style={{ viewTransitionName: `producto-${product.slug}` }}
          className="aspect-square w-full object-cover"
        />
        {off > 0 && (
          <span className="tabular absolute left-4 top-4 rounded-md bg-promo px-2.5 py-1 text-sm font-semibold text-background">
            −{off}%
          </span>
        )}
      </div>
      {photos.length > 1 && (
        <ul aria-label="Más fotos" className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {photos.map((url, i) => (
            <li key={url} className="shrink-0">
              <button
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-pressed={i === current}
                className={`block overflow-hidden rounded-xl border-2 transition-colors ${
                  i === current ? "border-orbit" : "border-transparent hover:border-input"
                }`}
              >
                <img
                  src={url}
                  alt=""
                  width={72}
                  height={72}
                  loading="lazy"
                  className="h-[72px] w-[72px] object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProductPage() {
  const { product, related, category } = Route.useLoaderData();
  const { add } = useCartActions();
  const [qty, setQty] = useState(1);
  const off = discountPercent(product.price, product.oldPrice);
  const soldOut = product.stock <= 0;
  const max = product.stock > 0 ? product.stock : 1;

  return (
    <>
      <div className="mx-auto max-w-[1280px] px-4 pt-6 sm:px-6">
        <nav aria-label="Ruta de navegación" className="text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link to="/" className="hover:text-foreground">
                Inicio
              </Link>
            </li>
            {category && (
              <>
                <li aria-hidden>/</li>
                <li>
                  <Link
                    to="/categoria/$slug"
                    params={{ slug: category.slug }}
                    className="hover:text-foreground"
                  >
                    {category.name}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden>/</li>
            <li aria-current="page" className="min-w-0 max-w-[28ch] truncate text-foreground">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12">
          <Gallery key={product.slug} product={product} off={off} />

          <div className="flex flex-col">
            <p className="text-muted-foreground">{product.brand}</p>
            <h1 className="mt-1 text-[clamp(1.75rem,3.4vw,2.6rem)] font-semibold leading-[1.1]">
              {product.name}
            </h1>

            <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-display tabular text-4xl font-semibold">
                {cop(product.price)}
              </span>
              {product.oldPrice && product.oldPrice > product.price && (
                <>
                  <span className="tabular text-lg text-muted-foreground line-through">
                    {cop(product.oldPrice)}
                  </span>
                  <span className="tabular text-[15px] text-promo">
                    Ahorras {cop(product.oldPrice - product.price)}
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">IVA incluido</p>

            <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {product.specs.length > 0 && (
              <ul aria-label="Características" className="mt-6 space-y-2">
                {product.specs.map((s) => (
                  <li key={s} className="flex items-start gap-2.5">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-orbit" aria-hidden />
                    {s}
                  </li>
                ))}
              </ul>
            )}

            <p
              className={`mt-6 text-[15px] ${soldOut ? "text-promo" : product.stock <= 5 ? "text-foreground" : "text-muted-foreground"}`}
            >
              {soldOut
                ? "Agotado por ahora"
                : product.stock <= 5
                  ? `Quedan ${product.stock} unidades`
                  : "Disponible"}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <div className="flex h-12 items-center rounded-full border">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid h-12 w-12 place-items-center rounded-full hover:bg-secondary"
                  aria-label="Una unidad menos"
                >
                  <Minus className="h-4 w-4" aria-hidden />
                </button>
                <span
                  className="tabular w-8 text-center"
                  aria-live="polite"
                  aria-label={`Cantidad: ${qty}`}
                >
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(max, q + 1))}
                  className="grid h-12 w-12 place-items-center rounded-full hover:bg-secondary"
                  aria-label="Una unidad más"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <button
                type="button"
                disabled={soldOut}
                onClick={() => add(product, qty)}
                className="h-12 flex-1 rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-40 sm:flex-none"
              >
                Agregar al carrito
              </button>
            </div>
            <a
              href={whatsappLink(
                `Hola, tengo una pregunta sobre: ${product.name} (${site.url}/producto/${product.slug})`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex h-12 items-center justify-center gap-2 self-start rounded-full border border-input px-6 text-[15px] transition hover:bg-secondary"
            >
              <MessageCircle className="h-4 w-4 text-whatsapp" aria-hidden />
              Preguntar por WhatsApp
            </a>

            <ul className="mt-8 space-y-3 border-t pt-6 text-[15px] text-muted-foreground">
              <li className="flex items-start gap-3">
                <Truck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                {site.freeShippingFrom > 0 && product.price >= site.freeShippingFrom
                  ? "Este producto tiene envío gratis a toda Colombia."
                  : "Envío a toda Colombia. El costo depende de tu ciudad."}
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                Producto original con garantía. Tienes 5 días hábiles para retractarte de la compra.
              </li>
            </ul>
            <p className="mt-4 text-[15px]">
              <Link to="/ayuda" className="text-orbit hover:underline">
                Ver envíos, formas de pago y garantía
              </Link>
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <Section id="titulo-relacionados" title="También te puede interesar">
          <ProductGrid products={related} />
        </Section>
      )}
    </>
  );
}
