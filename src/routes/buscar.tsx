import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { searchProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/ProductGrid";

export const Route = createFileRoute("/buscar")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? search["q"].slice(0, 80) : "",
  }),
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: async ({ deps }) => ({ q: deps.q, results: await searchProducts(deps.q) }),
  head: () => ({
    meta: [{ title: "Buscar | SpaceGaming" }, { name: "robots", content: "noindex" }],
  }),
  component: SearchPage,
});

const rootApi = getRouteApi("__root__");

function SearchPage() {
  const { q, results } = Route.useLoaderData();
  const categories = rootApi.useLoaderData();
  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-10 sm:px-6">
      <h1 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold">
        {q ? `Resultados para “${q}”` : "Buscar productos"}
      </h1>
      {q && (
        <p className="mt-2 text-muted-foreground">
          {results.length} {results.length === 1 ? "producto encontrado" : "productos encontrados"}
        </p>
      )}
      <div className="mt-8">
        {results.length ? (
          <ProductGrid products={results} />
        ) : (
          <div className="rounded-2xl border p-8">
            <p className="text-lg">
              {q
                ? "No encontramos productos con esas palabras."
                : "Escribe qué buscas en la barra de arriba."}
            </p>
            <p className="mt-2 text-muted-foreground">
              Prueba con una palabra más general o entra a una categoría:
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/categoria/$slug"
                    params={{ slug: c.slug }}
                    className="inline-block rounded-full bg-secondary px-4 py-2 text-[15px] hover:bg-secondary/70"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
