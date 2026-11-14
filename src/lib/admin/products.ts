/**
 * Lectura y escritura de productos desde el panel de administración.
 */
import { getAdminClient } from "./client";
import { clearCatalogCache } from "@/lib/catalog";

export const PHOTO_BUCKET = "productos";
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
/** Lado más largo de la foto que se guarda. Más grande no se nota y hace lenta la tienda. */
const MAX_PHOTO_SIDE = 1600;

export type AdminCategory = { id: string; slug: string; name: string };

/** Un producto tal como se edita en el formulario */
export type ProductDraft = {
  id?: string | undefined;
  name: string;
  slug: string;
  brand: string;
  categoryId: string;
  description: string;
  specs: string[];
  price: number;
  oldPrice: number | null;
  stock: number;
  imageUrl: string | null;
  gallery: string[];
  isActive: boolean;
};

export type ProductListItem = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  categoryName: string;
};

type Row = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  category_id: string | null;
  description: string | null;
  specs: string[] | null;
  price: number;
  old_price: number | null;
  stock: number;
  image_url: string | null;
  gallery: string[] | null;
  is_active: boolean;
};

export const emptyDraft: ProductDraft = {
  name: "",
  slug: "",
  brand: "",
  categoryId: "",
  description: "",
  specs: [],
  price: 0,
  oldPrice: null,
  stock: 0,
  imageUrl: null,
  gallery: [],
  isActive: true,
};

/** "Teclado Mecánico 75%" -> "teclado-mecanico-75" (lo que va en la dirección del producto) */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Convierte los errores de Supabase en un mensaje que diga qué hacer */
function explain(error: { code?: string; message: string }): Error {
  if (error.code === "23505") {
    return new Error(
      "Ya existe otro producto con esa dirección (slug). Cámbiala por una distinta.",
    );
  }
  if (error.code === "23503") {
    return new Error(
      "Este producto ya aparece en pedidos, así que no se puede borrar. Ocúltalo de la tienda en su lugar.",
    );
  }
  if (error.code === "42501" || /row-level security/i.test(error.message)) {
    return new Error(
      "Tu usuario no tiene permiso de administrador. Revisa el paso 5 de LEEME-SUPABASE.md.",
    );
  }
  if (error.code === "42703" || /gallery/i.test(error.message)) {
    return new Error(
      "A la base de datos le falta una actualización. Ejecuta supabase/migrations/0002_panel_admin.sql en el SQL Editor.",
    );
  }
  return new Error(`No se pudo completar: ${error.message}`);
}

export async function listCategories(): Promise<AdminCategory[]> {
  const db = await getAdminClient();
  const { data, error } = await db.from("categories").select("id,slug,name").order("position");
  if (error) throw explain(error);
  return data as AdminCategory[];
}

export async function listProducts(): Promise<ProductListItem[]> {
  const db = await getAdminClient();
  const { data, error } = await db
    .from("products")
    .select("id,slug,name,brand,price,old_price,stock,image_url,is_active,categories(name)")
    .order("created_at", { ascending: false });
  if (error) throw explain(error);
  type ListRow = Pick<
    Row,
    "id" | "slug" | "name" | "brand" | "price" | "old_price" | "stock" | "image_url" | "is_active"
  > & { categories: { name: string } | null };
  return (data as unknown as ListRow[]).map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    brand: r.brand ?? "",
    price: r.price,
    oldPrice: r.old_price,
    stock: r.stock,
    imageUrl: r.image_url,
    isActive: r.is_active,
    categoryName: r.categories?.name ?? "Sin categoría",
  }));
}

export async function getProductDraft(id: string): Promise<ProductDraft | null> {
  const db = await getAdminClient();
  const { data, error } = await db.from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw explain(error);
  if (!data) return null;
  const r = data as Row;
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    brand: r.brand ?? "",
    categoryId: r.category_id ?? "",
    description: r.description ?? "",
    specs: r.specs ?? [],
    price: r.price,
    oldPrice: r.old_price,
    stock: r.stock,
    imageUrl: r.image_url,
    gallery: r.gallery ?? [],
    isActive: r.is_active,
  };
}

/** Crea el producto si no tiene id; si lo tiene, lo actualiza. Devuelve el id. */
export async function saveProduct(draft: ProductDraft): Promise<string> {
  const db = await getAdminClient();
  const values = {
    name: draft.name.trim(),
    slug: draft.slug.trim(),
    brand: draft.brand.trim() || null,
    category_id: draft.categoryId || null,
    description: draft.description.trim() || null,
    specs: draft.specs.map((s) => s.trim()).filter(Boolean),
    price: draft.price,
    old_price: draft.oldPrice,
    stock: draft.stock,
    image_url: draft.imageUrl,
    gallery: draft.gallery,
    is_active: draft.isActive,
  };
  const query = draft.id
    ? db.from("products").update(values).eq("id", draft.id).select("id").single()
    : db.from("products").insert(values).select("id").single();
  const { data, error } = await query;
  if (error) throw explain(error);
  clearCatalogCache();
  return (data as { id: string }).id;
}

export async function setProductActive(id: string, isActive: boolean): Promise<void> {
  const db = await getAdminClient();
  const { error } = await db.from("products").update({ is_active: isActive }).eq("id", id);
  if (error) throw explain(error);
  clearCatalogCache();
}

export async function deleteProduct(id: string): Promise<void> {
  const db = await getAdminClient();
  const { error } = await db.from("products").delete().eq("id", id);
  if (error) throw explain(error);
  clearCatalogCache();
}

/**
 * Reduce la foto a 1600 px por el lado más largo y la convierte a WebP antes de subirla.
 * Una foto de celular pesa 3 a 8 MB; así queda en unos cientos de KB y la tienda carga rápido.
 * Si el navegador no puede convertirla, se sube la original.
 */
async function shrink(file: File): Promise<{ blob: Blob; ext: string; type: string }> {
  const original = { blob: file, ext: file.type.split("/")[1] ?? "jpg", type: file.type };
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_PHOTO_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, "image/webp", 0.85));
    if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return original;
    return { blob, ext: "webp", type: "image/webp" };
  } catch {
    return original;
  }
}

/** Sube una foto y devuelve su dirección pública (https://...) */
export async function uploadPhoto(file: File): Promise<string> {
  if (!PHOTO_TYPES.includes(file.type)) {
    throw new Error(`"${file.name}" no es JPG, PNG ni WebP. Conviértela y vuelve a intentarlo.`);
  }
  const { blob, ext, type } = await shrink(file);
  if (blob.size > MAX_PHOTO_BYTES) {
    throw new Error(`"${file.name}" pesa más de 5 MB incluso reducida. Usa una foto más liviana.`);
  }
  const db = await getAdminClient();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await db.storage
    .from(PHOTO_BUCKET)
    .upload(path, blob, { contentType: type, cacheControl: "31536000", upsert: false });
  if (error) {
    throw /bucket not found/i.test(error.message)
      ? new Error(
          "Falta el almacenamiento de fotos. Ejecuta supabase/migrations/0002_panel_admin.sql en el SQL Editor.",
        )
      : new Error(`No se pudo subir "${file.name}": ${error.message}`);
  }
  return db.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}
