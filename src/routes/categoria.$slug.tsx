import { useMemo } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getCategory } from "@/lib/catalog";
import { ProductGrid } from "@/components/ProductGrid";
import {
  CatalogToolbar,
  applyCatalogSearch,
  parseCatalogSearch,
} from "@/components/CatalogToolbar";
import { site } from "@/config/site";

export const Route = createFileRoute("/categoria/$slug")({
  validateSearch: parseCatalogSearch,
  loader: async ({ params }) => {
    const data = await getCategory(params.slug);
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.category.name} gamer | SpaceGaming` },
            { name: "description", content: `${loaderData.category.blurb} Envío a toda Colombia.` },
            { property: "og:title", content: `${loaderData.category.name} gamer | SpaceGaming` },
            { property: "og:url", content: `${site.url}/categoria/${loaderData.category.slug}` },
          ],
          // La dirección "oficial" es la de la categoría sin filtros, para que Google no vea
          // cada combinación de orden y marca como una página distinta.
          links: [{ rel: "canonical", href: `${site.url}/categoria/${loaderData.category.slug}` }],
        }
      : {},
  component: CategoryPage,
});

function CategoryPage() {
  const { category, products } = Route.useLoaderData();
  const search = Route.useSearch();

  const brands = useMemo(
    () => [...new Set(products.map((p) => p.brand).filter(Boolean))].sort(),
    [products],
  );
  const visible = useMemo(() => applyCatalogSearch(products, search), [products, search]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-10 sm:px-6">
      <h1 className="text-[clamp(2rem,4vw,3rem)] font-semibold">{category.name}</h1>
      <p className="mt-2 max-w-[60ch] text-lg text-muted-foreground">{category.blurb}</p>

      {products.length === 0 ? (
        <p className="mt-8 rounded-2xl border p-8 text-muted-foreground">
          Pronto tendremos productos en esta categoría.
        </p>
      ) : (
        <>
          <div className="mt-6">
            <CatalogToolbar
              route="/categoria/$slug"
              brands={brands}
              search={search}
              total={visible.length}
            />
          </div>
          <div className="mt-6">
            {visible.length ? (
              <ProductGrid products={visible} priorityCount={4} />
            ) : (
              <div className="rounded-2xl border p-8">
                <p className="text-lg">No hay productos de {search.marca} en esta categoría.</p>
                <Link
                  to="."
                  search={{}}
                  replace
                  className="mt-4 inline-flex h-11 items-center rounded-full bg-primary px-5 text-[15px] font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Ver todos los productos de {category.name}
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
