import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { cop } from "@/lib/format";
import { listProducts, setProductActive, type ProductListItem } from "@/lib/admin/products";

export const Route = createFileRoute("/admin/")({ ssr: false, component: AdminProducts });

function AdminProducts() {
  const [items, setItems] = useState<ProductListItem[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    listProducts()
      .then((list) => alive && setItems(list))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  const toggle = async (item: ProductListItem) => {
    const next = !item.isActive;
    // Se refleja de inmediato; si Supabase lo rechaza, vuelve a como estaba
    setItems((list) => list?.map((p) => (p.id === item.id ? { ...p, isActive: next } : p)) ?? list);
    try {
      await setProductActive(item.id, next);
    } catch (e) {
      setItems(
        (list) => list?.map((p) => (p.id === item.id ? { ...p, isActive: !next } : p)) ?? list,
      );
      setError((e as Error).message);
    }
  };

  return (
    <div className="pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold">Productos</h1>
        <Link
          to="/admin/productos/nuevo"
          className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-5 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Nuevo producto
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-xl border border-promo/40 p-4 text-promo">
          {error}
        </p>
      )}

      {items === null && !error && (
        <p role="status" className="mt-8 text-muted-foreground">
          Cargando productos…
        </p>
      )}

      {items?.length === 0 && (
        <div className="mt-8 rounded-2xl border p-8">
          <p className="text-lg">Todavía no hay productos.</p>
          <p className="mt-1 text-muted-foreground">Crea el primero con el botón de arriba.</p>
        </div>
      )}

      {items && items.length > 0 && (
        <>
          <p className="mt-4 text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "producto" : "productos"}. Los cambios se ven en la
            tienda en un minuto como máximo.
          </p>
          <ul className="mt-4 divide-y border-y">
            {items.map((p) => (
              <li key={p.id} className="flex items-center gap-4 py-4">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt=""
                    width={64}
                    height={64}
                    loading="lazy"
                    className="h-16 w-16 shrink-0 rounded-lg bg-secondary object-cover"
                  />
                ) : (
                  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-secondary text-center text-[11px] leading-tight text-muted-foreground">
                    Sin foto
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <Link
                    to="/admin/productos/$id"
                    params={{ id: p.id }}
                    className="line-clamp-2 font-medium hover:text-orbit"
                  >
                    {p.name}
                  </Link>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {p.categoryName} · <span className="tabular">{cop(p.price)}</span> ·{" "}
                    <span className={p.stock === 0 ? "text-promo" : ""}>
                      {p.stock === 0 ? "Agotado" : `${p.stock} en inventario`}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={p.isActive}
                  aria-label={`Mostrar ${p.name} en la tienda`}
                  onClick={() => void toggle(p)}
                  className={`h-11 shrink-0 rounded-full border px-4 text-sm transition-colors hover:bg-secondary ${
                    p.isActive
                      ? "border-orbit text-foreground"
                      : "border-input text-muted-foreground"
                  }`}
                >
                  {p.isActive ? "Visible" : "Oculto"}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
