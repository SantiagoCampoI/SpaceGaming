import { Link, useNavigate } from "@tanstack/react-router";
import type { Product } from "@/data/store";
import { discountPercent } from "@/lib/format";

/**
 * Ordenar y filtrar una lista de productos.
 * La elección vive en la dirección de la página (?orden=precio-asc&marca=Viper), así:
 *   - se puede compartir el enlace ya filtrado,
 *   - el botón "atrás" del navegador deshace el filtro,
 *   - al recargar no se pierde.
 */
export const sortOptions = [
  { value: "destacados", label: "Destacados" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "descuento", label: "Mayor descuento" },
] as const;

export type SortValue = (typeof sortOptions)[number]["value"];
export type CatalogSearch = { orden?: SortValue | undefined; marca?: string | undefined };

/** Lee y limpia los parámetros de la dirección. Cualquier valor raro se descarta. */
export function parseCatalogSearch(search: Record<string, unknown>): CatalogSearch {
  const orden = sortOptions.find((o) => o.value === search["orden"])?.value;
  const marca = typeof search["marca"] === "string" ? search["marca"].slice(0, 60) : undefined;
  return {
    ...(orden && orden !== "destacados" ? { orden } : {}),
    ...(marca ? { marca } : {}),
  };
}

export function applyCatalogSearch(products: Product[], { orden, marca }: CatalogSearch) {
  const list = marca ? products.filter((p) => p.brand === marca) : products;
  switch (orden) {
    case "precio-asc":
      return [...list].sort((a, b) => a.price - b.price);
    case "precio-desc":
      return [...list].sort((a, b) => b.price - a.price);
    case "descuento":
      return [...list].sort(
        (a, b) => discountPercent(b.price, b.oldPrice) - discountPercent(a.price, a.oldPrice),
      );
    default:
      return list;
  }
}

/** Páginas que usan esta barra. Para agregar otra, ponle validateSearch: parseCatalogSearch. */
type CatalogRoute = "/categoria/$slug" | "/ofertas";

const chip =
  "inline-flex h-11 items-center rounded-full border px-4 text-[15px] transition-colors hover:bg-secondary";
const chipActive = "border-orbit bg-secondary text-foreground";
const chipIdle = "border-input text-muted-foreground";

export function CatalogToolbar({
  route: ROUTE,
  brands,
  search,
  total,
}: {
  route: CatalogRoute;
  /** Marcas presentes en la lista completa (sin filtrar) */
  brands: string[];
  search: CatalogSearch;
  /** Cuántos productos quedan después de filtrar */
  total: number;
}) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground" role="status">
          {total} {total === 1 ? "producto" : "productos"}
          {search.marca ? ` de ${search.marca}` : ""}
        </p>
        {brands.length > 1 && (
          <ul aria-label="Filtrar por marca" className="mt-3 flex flex-wrap gap-2">
            <li>
              <Link
                from={ROUTE}
                to="."
                search={(prev) => ({ ...prev, marca: undefined })}
                replace
                resetScroll={false}
                viewTransition={false}
                aria-current={search.marca ? undefined : "true"}
                className={`${chip} ${search.marca ? chipIdle : chipActive}`}
              >
                Todas
              </Link>
            </li>
            {brands.map((b) => (
              <li key={b}>
                <Link
                  from={ROUTE}
                  to="."
                  search={(prev) => ({ ...prev, marca: b })}
                  replace
                  resetScroll={false}
                  viewTransition={false}
                  aria-current={search.marca === b ? "true" : undefined}
                  className={`${chip} ${search.marca === b ? chipActive : chipIdle}`}
                >
                  <span translate="no">{b}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <label className="flex shrink-0 items-center gap-2 text-[15px] text-muted-foreground">
        Ordenar por
        <select
          name="orden"
          value={search.orden ?? "destacados"}
          onChange={(e) =>
            void navigate({
              from: ROUTE,
              to: ".",
              search: (prev) => ({
                ...prev,
                orden: sortOptions.find(
                  (o) => o.value === e.target.value && o.value !== "destacados",
                )?.value,
              }),
              replace: true,
              resetScroll: false,
              // Filtrar no es "ir a otra página": sin animación, el cambio es inmediato
              viewTransition: false,
            })
          }
          className="h-11 rounded-full border border-input px-4 text-[15px] text-foreground focus-visible:border-orbit"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
