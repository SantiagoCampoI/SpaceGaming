import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/ProductGrid";
import {
  CatalogToolbar,
  applyCatalogSearch,
  parseCatalogSearch,
} from "@/components/CatalogToolbar";
import { site } from "@/config/site";

export const Route = createFileRoute("/ofertas")({
  validateSearch: parseCatalogSearch,
  loader: async () => {
    const all = await getProducts();
    // Ordenadas de mayor a menor ahorro en pesos
    return all
      .filter((p) => p.oldPrice && p.oldPrice > p.price)
      .sort((a, b) => b.oldPrice! - b.price - (a.oldPrice! - a.price));
  },
  head: () => ({
    meta: [
      { title: "Ofertas en periféricos gamer | SpaceGaming" },
      {
        name: "description",
        content: "Teclados, mouse y diademas con descuento. Envío a toda Colombia.",
      },
      { property: "og:url", content: `${site.url}/ofertas` },
    ],
    links: [{ rel: "canonical", href: `${site.url}/ofertas` }],
  }),
  component: OffersPage,
});

function OffersPage() {
  const deals = Route.useLoaderData();
  const search = Route.useSearch();

  const brands = useMemo(
    () => [...new Set(deals.map((p) => p.brand).filter(Boolean))].sort(),
    [deals],
  );
  const visible = useMemo(() => applyCatalogSearch(deals, search), [deals, search]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-10 sm:px-6">
      <h1 className="text-[clamp(2rem,4vw,3rem)] font-semibold">Ofertas</h1>
      <p className="mt-2 max-w-[60ch] text-lg text-muted-foreground">
        Productos con descuento mientras haya unidades. Ordenados por lo que más ahorras.
      </p>

      {deals.length === 0 ? (
        <p className="mt-8 rounded-2xl border p-8 text-muted-foreground">
          No hay ofertas activas en este momento. Vuelve pronto.
        </p>
      ) : (
        <>
          <div className="mt-6">
            <CatalogToolbar
              route="/ofertas"
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
                <p className="text-lg">No hay ofertas de {search.marca} en este momento.</p>
                <Link
                  to="."
                  search={{}}
                  replace
                  className="mt-4 inline-flex h-11 items-center rounded-full bg-primary px-5 text-[15px] font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Ver todas las ofertas
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
