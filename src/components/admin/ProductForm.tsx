import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ImagePlus, Plus, Star, Trash2 } from "lucide-react";

import { cop, discountPercent } from "@/lib/format";
import {
  saveProduct,
  slugify,
  uploadPhoto,
  type AdminCategory,
  type ProductDraft,
} from "@/lib/admin/products";

/**
 * Formulario de producto. Lo usan "Nuevo producto" y "Editar producto":
 * cada página le pasa el producto inicial y decide qué pasa después de guardar.
 * Las acciones propias de una página (ej. "Eliminar") entran por `extraActions`.
 */
type Errors = Partial<
  Record<"name" | "slug" | "categoryId" | "price" | "oldPrice" | "stock", string>
>;

const input =
  "h-12 w-full rounded-xl border border-input bg-secondary/70 px-4 text-[15px] text-foreground placeholder:text-muted-foreground focus-visible:border-orbit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orbit/60 aria-[invalid=true]:border-promo";

const onlyDigits = (s: string) => s.replace(/\D/g, "").slice(0, 9);

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: ReactNode;
  error?: string | undefined;
  children: (props: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby": string;
  }) => ReactNode;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[15px] font-medium">
        {label}
      </label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": `${id}-nota` })}
      <p
        id={`${id}-nota`}
        className={`mt-1.5 text-[13px] ${error ? "text-promo" : "text-muted-foreground"}`}
      >
        {error ?? hint}
      </p>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-t py-8">
      <legend className="float-left mb-5 w-full font-display text-xl font-semibold">{title}</legend>
      <div className="clear-both space-y-5">{children}</div>
    </fieldset>
  );
}

export function ProductForm({
  initial,
  categories,
  submitLabel,
  onSaved,
  extraActions,
}: {
  initial: ProductDraft;
  categories: AdminCategory[];
  submitLabel: string;
  onSaved: (id: string) => void;
  extraActions?: ReactNode;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  // En un producto nuevo la dirección se arma sola con el nombre, hasta que la edites a mano
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [brand, setBrand] = useState(initial.brand);
  const [categoryId, setCategoryId] = useState(initial.categoryId);
  const [description, setDescription] = useState(initial.description);
  const [specs, setSpecs] = useState(initial.specs.length ? initial.specs : [""]);
  const [price, setPrice] = useState(initial.price ? String(initial.price) : "");
  const [oldPrice, setOldPrice] = useState(initial.oldPrice ? String(initial.oldPrice) : "");
  const [stock, setStock] = useState(String(initial.stock));
  // La primera foto de la lista es la principal (la que sale en las tarjetas)
  const [photos, setPhotos] = useState(
    initial.imageUrl ? [initial.imageUrl, ...initial.gallery] : initial.gallery,
  );
  const [isActive, setIsActive] = useState(initial.isActive);

  const [errors, setErrors] = useState<Errors>({});
  // Después del primer intento de guardar, los avisos se actualizan mientras corriges
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [uploading, setUploading] = useState(0);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Avisar antes de cerrar la pestaña con cambios sin guardar
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const touch = () => setDirty(true);

  const onPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    setPhotoError("");
    const list = Array.from(files);
    setUploading((n) => n + list.length);
    // Se suben todas a la vez; las que fallen no impiden las demás
    const results = await Promise.allSettled(list.map(uploadPhoto));
    const ok = results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
    const failed = results.flatMap((r) =>
      r.status === "rejected" ? [(r.reason as Error).message] : [],
    );
    if (ok.length) {
      setPhotos((prev) => [...prev, ...ok]);
      touch();
    }
    if (failed.length) setPhotoError(failed.join(" "));
    setUploading((n) => n - list.length);
  };

  const validate = (): Errors => {
    const e: Errors = {};
    const p = Number(price);
    const op = oldPrice ? Number(oldPrice) : null;
    if (!name.trim()) e.name = "Escribe el nombre del producto.";
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      e.slug = "Solo minúsculas, números y guiones. Ejemplo: teclado-mecanico-75.";
    }
    if (!categoryId) e.categoryId = "Elige una categoría.";
    if (!price || p <= 0) e.price = "Escribe el precio en pesos, sin puntos. Ejemplo: 389000.";
    if (op !== null && op <= p) {
      e.oldPrice =
        "El precio anterior debe ser mayor que el precio actual. Déjalo vacío si no hay descuento.";
    }
    if (stock === "") e.stock = "Escribe cuántas unidades tienes. Pon 0 si está agotado.";
    return e;
  };

  useEffect(() => {
    if (submitted) setErrors(validate());
    // validate lee solo estos campos
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted, name, slug, categoryId, price, oldPrice, stock]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validate();
    setSubmitted(true);
    setErrors(found);
    setFormError("");
    if (Object.keys(found).length) {
      // Lleva al primer campo con error
      requestAnimationFrame(() =>
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
      return;
    }
    setSaving(true);
    try {
      const id = await saveProduct({
        id: initial.id,
        name,
        slug,
        brand,
        categoryId,
        description,
        specs,
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : null,
        stock: Number(stock),
        imageUrl: photos[0] ?? null,
        gallery: photos.slice(1),
        isActive,
      });
      setDirty(false);
      onSaved(id);
    } catch (err) {
      setFormError((err as Error).message);
    }
    setSaving(false);
  };

  const off = discountPercent(Number(price), oldPrice ? Number(oldPrice) : undefined);

  return (
    <form ref={formRef} onSubmit={onSubmit} onChange={touch} noValidate className="mt-6 max-w-3xl">
      <Group title="Datos básicos">
        <Field
          label="Nombre"
          hint="Como lo verá el cliente. Incluye marca y modelo."
          error={errors.name}
        >
          {(a) => (
            <input
              {...a}
              name="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              autoComplete="off"
              maxLength={160}
              placeholder="Teclado mecánico 75% hot-swap RGB…"
              className={input}
            />
          )}
        </Field>

        <Field
          label="Dirección en la tienda"
          hint={
            <>
              Quedará en <span className="text-foreground">/producto/{slug || "…"}</span>. Evita
              cambiarla después de publicar: los enlaces viejos dejarían de funcionar.
            </>
          }
          error={errors.slug}
        >
          {(a) => (
            <input
              {...a}
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value.toLowerCase());
              }}
              autoComplete="off"
              spellCheck={false}
              maxLength={80}
              className={input}
            />
          )}
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Marca" hint="Sirve para el filtro por marca de la tienda.">
            {(a) => (
              <input
                {...a}
                name="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                autoComplete="off"
                maxLength={60}
                className={input}
              />
            )}
          </Field>
          <Field label="Categoría" error={errors.categoryId}>
            {(a) => (
              <select
                {...a}
                name="categoryId"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={input}
              >
                <option value="">Elige una…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>
      </Group>

      <Group title="Precio e inventario">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field
            label="Precio (COP)"
            hint={
              price ? `Se verá como ${cop(Number(price))}. IVA incluido.` : "En pesos, sin puntos."
            }
            error={errors.price}
          >
            {(a) => (
              <input
                {...a}
                name="price"
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(onlyDigits(e.target.value))}
                autoComplete="off"
                placeholder="389000…"
                className={`${input} tabular`}
              />
            )}
          </Field>
          <Field
            label="Precio anterior"
            hint={off > 0 ? `Mostrará −${off}% de descuento.` : "Opcional. Solo si está en oferta."}
            error={errors.oldPrice}
          >
            {(a) => (
              <input
                {...a}
                name="oldPrice"
                inputMode="numeric"
                value={oldPrice}
                onChange={(e) => setOldPrice(onlyDigits(e.target.value))}
                autoComplete="off"
                placeholder="459000…"
                className={`${input} tabular`}
              />
            )}
          </Field>
          <Field label="Unidades" hint="Con 0 aparece como agotado." error={errors.stock}>
            {(a) => (
              <input
                {...a}
                name="stock"
                inputMode="numeric"
                value={stock}
                onChange={(e) => setStock(onlyDigits(e.target.value).slice(0, 5))}
                autoComplete="off"
                className={`${input} tabular`}
              />
            )}
          </Field>
        </div>
      </Group>

      <Group title="Descripción y especificaciones">
        <Field label="Descripción" hint="Dos o tres frases: qué es y para quién sirve.">
          {(a) => (
            <textarea
              {...a}
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={1200}
              className={`${input} h-auto py-3 leading-relaxed`}
            />
          )}
        </Field>

        <div>
          <p id="specs-titulo" className="mb-1.5 text-[15px] font-medium">
            Especificaciones
          </p>
          <ul aria-labelledby="specs-titulo" className="space-y-2">
            {specs.map((s, i) => (
              <li key={i} className="flex gap-2">
                <input
                  name={`spec-${i}`}
                  aria-label={`Especificación ${i + 1}`}
                  value={s}
                  onChange={(e) =>
                    setSpecs((list) => list.map((v, j) => (j === i ? e.target.value : v)))
                  }
                  autoComplete="off"
                  maxLength={120}
                  placeholder={i === 0 ? "Sensor de 26.000 DPI…" : ""}
                  className={input}
                />
                <button
                  type="button"
                  onClick={() => {
                    setSpecs((list) => (list.length > 1 ? list.filter((_, j) => j !== i) : [""]));
                    touch();
                  }}
                  aria-label={`Quitar especificación ${i + 1}`}
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-input text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setSpecs((list) => [...list, ""])}
            className="mt-3 inline-flex h-11 items-center gap-2 rounded-full border border-input px-4 text-[15px] transition-colors hover:bg-secondary"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Agregar especificación
          </button>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Una por línea, con el dato concreto: “Peso de 58 g”, “Conexión USB-C”.
          </p>
        </div>
      </Group>

      <Group title="Fotos">
        {photos.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photos.map((url, i) => (
              <li key={url} className="relative overflow-hidden rounded-xl border bg-card">
                <img
                  src={url}
                  alt={`Foto ${i + 1}`}
                  width={300}
                  height={300}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
                {i === 0 && (
                  <span className="absolute left-2 top-2 rounded-md bg-orbit px-2 py-0.5 text-[12px] font-semibold text-background">
                    Principal
                  </span>
                )}
                <div className="flex divide-x border-t">
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhotos((list) => [url, ...list.filter((u) => u !== url)]);
                        touch();
                      }}
                      aria-label={`Usar la foto ${i + 1} como principal`}
                      className="grid h-11 flex-1 place-items-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <Star className="h-4 w-4" aria-hidden />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setPhotos((list) => list.filter((u) => u !== url));
                      touch();
                    }}
                    aria-label={`Quitar la foto ${i + 1}`}
                    className="grid h-11 flex-1 place-items-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div>
          <label className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-full border border-input px-5 text-[15px] transition-colors hover:bg-secondary focus-within:ring-2 focus-within:ring-orbit/60">
            <ImagePlus className="h-4 w-4" aria-hidden />
            {uploading > 0 ? `Subiendo ${uploading}…` : "Subir fotos"}
            <input
              type="file"
              name="photos"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={uploading > 0}
              onChange={(e) => {
                void onPhotos(e.target.files);
                e.target.value = "";
              }}
              className="sr-only"
            />
          </label>
          <p className="mt-2 text-[13px] text-muted-foreground">
            JPG, PNG o WebP. Cuadradas se ven mejor. Se reducen solas antes de subir. La primera es
            la que sale en las tarjetas; usa la estrella para cambiarla.
          </p>
          {photoError && (
            <p role="alert" className="mt-2 text-[13px] text-promo">
              {photoError}
            </p>
          )}
        </div>
      </Group>

      <Group title="Publicación">
        <div className="flex items-start gap-3">
          <input
            id="producto-visible"
            name="isActive"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 accent-[var(--orbit)]"
          />
          <label htmlFor="producto-visible" className="text-[15px]">
            Mostrar en la tienda
            <span className="block text-[13px] text-muted-foreground">
              Desmárcalo para guardar el producto sin publicarlo todavía.
            </span>
          </label>
        </div>
      </Group>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t bg-background/95 px-4 py-4 backdrop-blur sm:mx-0 sm:px-0">
        <button
          type="submit"
          disabled={saving || uploading > 0}
          className="h-12 rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {saving ? "Guardando…" : submitLabel}
        </button>
        {extraActions}
        <p role="alert" className="min-w-0 flex-1 text-[14px] text-promo">
          {formError ||
            (Object.keys(errors).length > 0 ? "Revisa los campos marcados en rojo." : "")}
        </p>
      </div>
    </form>
  );
}
