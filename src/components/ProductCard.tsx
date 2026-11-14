import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import type { Product } from "@/data/store";
import { cop, discountPercent } from "@/lib/format";
import { useCartActions } from "@/lib/cart";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const { add } = useCartActions();
  const off = discountPercent(product.price, product.oldPrice);
  const soldOut = product.stock <= 0;

  return (
    <article className="group relative flex flex-col">
      <Link
        to="/producto/$slug"
        params={{ slug: product.slug }}
        className="relative block overflow-hidden rounded-2xl bg-card"
        tabIndex={-1}
        aria-hidden="true"
      >
        <img
          src={product.image}
          alt={product.name}
          width={400}
          height={400}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          // Mismo nombre que la foto grande de la página del producto: al entrar, la foto "viaja"
          style={{ viewTransitionName: `producto-${product.slug}` }}
          className="aspect-square w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        {off > 0 && (
          <span className="tabular absolute left-3 top-3 rounded-md bg-promo px-2 py-0.5 text-[13px] font-semibold text-background">
            −{off}%
          </span>
        )}
        {soldOut && (
          <span className="absolute inset-x-3 bottom-3 rounded-md bg-background/85 py-1 text-center text-[13px]">
            Agotado
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 pt-3">
        <p className="text-[13px] text-muted-foreground">{product.brand}</p>
        <h3 className="font-sans text-[15px] font-medium leading-snug tracking-normal">
          <Link
            to="/producto/$slug"
            params={{ slug: product.slug }}
            className="line-clamp-2 hover:text-orbit"
          >
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="flex flex-col">
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="tabular text-[13px] text-muted-foreground line-through">
                {cop(product.oldPrice)}
              </span>
            )}
            <span className="font-display tabular text-lg font-semibold leading-tight sm:text-xl">
              {cop(product.price)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => add(product)}
            disabled={soldOut}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:bg-orbit disabled:opacity-40"
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </article>
  );
}
