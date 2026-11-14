import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ProductForm } from "@/components/admin/ProductForm";
import { emptyDraft, listCategories, type AdminCategory } from "@/lib/admin/products";

export const Route = createFileRoute("/admin/productos/nuevo")({
  ssr: false,
  component: NewProduct,
});

function NewProduct() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<AdminCategory[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    listCategories()
      .then((c) => alive && setCategories(c))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="pt-8">
      <Link to="/admin" className="text-[15px] text-orbit hover:underline">
        ← Productos
      </Link>
      <h1 className="mt-3 text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold">Nuevo producto</h1>
      {error && (
        <p role="alert" className="mt-6 text-promo">
          {error}
        </p>
      )}
      {!categories && !error && (
        <p role="status" className="mt-6 text-muted-foreground">
          Cargando…
        </p>
      )}
      {categories && (
        <ProductForm
          initial={emptyDraft}
          categories={categories}
          submitLabel="Crear producto"
          onSaved={() => void navigate({ to: "/admin" })}
        />
      )}
    </div>
  );
}
