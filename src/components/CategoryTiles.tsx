import { Link } from "@tanstack/react-router";
import type { Category } from "@/data/store";

export function CategoryTiles({
  categories,
  counts,
}: {
  categories: Category[];
  counts: Record<string, number>;
}) {
  return (
    <section aria-labelledby="titulo-categorias" className="mx-auto max-w-[1280px] px-4 sm:px-6">
      <h2 id="titulo-categorias" className="sr-only">
        Categorías
      </h2>
      <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
        {categories.map((c) => (
          <li key={c.slug} className="w-[42%] shrink-0 snap-start sm:w-auto">
            <Link
              to="/categoria/$slug"
              params={{ slug: c.slug }}
              className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-card"
            >
              <img
                src={c.image}
                alt=""
                width={300}
                height={375}
                loading="lazy"
                className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
              />
              <span
                className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent"
                aria-hidden
              />
              <span className="absolute inset-x-4 bottom-4 flex flex-col">
                <span className="font-display text-lg font-semibold leading-tight">{c.name}</span>
                <span className="text-[13px] text-muted-foreground">
                  {counts[c.slug] ?? 0} {counts[c.slug] === 1 ? "producto" : "productos"}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
