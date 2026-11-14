import type { ReactNode } from "react";
import type { Product } from "@/data/store";
import { ProductCard } from "./ProductCard";

export function ProductGrid({
  products,
  priorityCount = 0,
}: {
  products: Product[];
  priorityCount?: number;
}) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p, i) => (
        <li key={p.id} className="flex">
          <ProductCard product={p} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}

export function Section({
  id,
  title,
  aside,
  children,
}: {
  id: string;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mx-auto mt-20 max-w-[1280px] px-4 sm:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 id={id} className="text-2xl font-semibold sm:text-[2rem]">
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}
