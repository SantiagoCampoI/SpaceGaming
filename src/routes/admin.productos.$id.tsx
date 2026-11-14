import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { ProductForm } from "@/components/admin/ProductForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  deleteProduct,
  getProductDraft,
  listCategories,
  type AdminCategory,
  type ProductDraft,
} from "@/lib/admin/products";

export const Route = createFileRoute("/admin/productos/$id")({
  ssr: false,
  component: EditProduct,
});

type Loaded = { draft: ProductDraft | null; categories: AdminCategory[] };

function EditProduct() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<Loaded | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let alive = true;
    setData(null);
    // Producto y categorías se piden a la vez
    Promise.all([getProductDraft(id), listCategories()])
      .then(([draft, categories]) => alive && setData({ draft, categories }))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [id]);

  const remove = async () => {
    try {
      await deleteProduct(id);
      void navigate({ to: "/admin" });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="pt-8">
      <Link to="/admin" className="text-[15px] text-orbit hover:underline">
        ← Productos
      </Link>
      <h1 className="mt-3 text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold">Editar producto</h1>

      {error && (
        <p role="alert" className="mt-6 rounded-xl border border-promo/40 p-4 text-promo">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="mt-6 rounded-xl border border-orbit/40 p-4">
          Cambios guardados. Se verán en la tienda en un minuto como máximo.{" "}
          {data?.draft && (
            <Link
              to="/producto/$slug"
              params={{ slug: data.draft.slug }}
              className="text-orbit underline underline-offset-2"
            >
              Ver en la tienda
            </Link>
          )}
        </p>
      )}
      {!data && !error && (
        <p role="status" className="mt-6 text-muted-foreground">
          Cargando…
        </p>
      )}
      {data && !data.draft && (
        <p className="mt-6 text-muted-foreground">Este producto ya no existe.</p>
      )}

      {data?.draft && (
        <ProductForm
          key={data.draft.id}
          initial={data.draft}
          categories={data.categories}
          submitLabel="Guardar cambios"
          onSaved={() => {
            setSaved(true);
            setError("");
            window.scrollTo({ top: 0 });
          }}
          extraActions={
            <AlertDialog>
              <AlertDialogTrigger className="h-12 rounded-full border border-input px-5 text-[15px] text-promo transition-colors hover:bg-secondary">
                Eliminar
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar este producto?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se borra de la tienda y del panel, y no se puede deshacer. Si solo quieres dejar
                    de venderlo por ahora, desmarca “Mostrar en la tienda”.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => void remove()}>
                    Eliminar producto
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          }
        />
      )}
    </div>
  );
}
