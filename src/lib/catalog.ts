/**
 * Todas las lecturas del catálogo pasan por aquí.
 * Si Supabase está configurado, lee de la base de datos; si no, usa src/data/store.ts.
 */
import {
  categories as localCategories,
  products as localProducts,
  type Category,
  type Product,
} from "@/data/store";
import { supabaseEnabled, supabaseRest } from "./supabase";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  description: string | null;
  specs: string[] | null;
  price: number;
  old_price: number | null;
  stock: number;
  image_url: string | null;
  gallery: string[] | null;
  categories: { slug: string } | null;
};

type CategoryRow = { slug: string; name: string; blurb: string | null; image_url: string | null };

const fromRow = (r: ProductRow): Product => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  brand: r.brand ?? "",
  category: r.categories?.slug ?? "",
  // Si el producto aún no tiene foto en Supabase, usa la foto de ejemplo con el mismo slug
  image: r.image_url ?? localProducts.find((p) => p.slug === r.slug)?.image ?? "",
  price: r.price,
  oldPrice: r.old_price ?? undefined,
  stock: r.stock,
  description: r.description ?? "",
  specs: r.specs ?? [],
  gallery: r.gallery ?? [],
});

/**
 * Memoria corta del catálogo (60 segundos).
 * Varias partes de una misma página piden productos y categorías (menú, portada, producto).
 * Sin esto, cada una haría su propia consulta a Supabase. Solo se guardan datos públicos
 * del catálogo, nunca datos de un visitante.
 */
const TTL_MS = 60_000;
const memory = new Map<string, { at: number; value: Promise<unknown> }>();

function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = memory.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value as Promise<T>;
  const value = load();
  memory.set(key, { at: Date.now(), value });
  // Si la consulta falla no se guarda el error: el siguiente intento vuelve a consultar
  value.catch(() => memory.delete(key));
  return value;
}

/** El panel de administración la llama después de guardar, para ver el cambio de inmediato. */
export function clearCatalogCache() {
  memory.clear();
}

const PRODUCT_SELECT =
  "id,slug,name,brand,description,specs,price,old_price,stock,image_url,gallery,categories(slug)";

/**
 * Lee los productos de Supabase. Si Supabase está configurado pero falla, lanza un error
 * (se muestra la página "Esta página no cargó") en vez de mostrar productos de ejemplo
 * con precios que no son los reales.
 */
async function remoteProducts(): Promise<Product[] | null> {
  if (!supabaseEnabled) return null;
  const { data, ok, status } = await supabaseRest<ProductRow[]>(
    `products?select=${PRODUCT_SELECT}&is_active=eq.true&order=created_at.asc,name.asc`,
  );
  if (!ok || !Array.isArray(data)) {
    throw new Error(`Supabase respondió ${status} al leer los productos`);
  }
  return data.map(fromRow);
}

export function getProducts(): Promise<Product[]> {
  return cached("products", async () => (await remoteProducts()) ?? localProducts);
}

export function getCategories(): Promise<Category[]> {
  return cached("categories", loadCategories);
}

async function loadCategories(): Promise<Category[]> {
  if (!supabaseEnabled) return localCategories;
  const { data, ok, status } = await supabaseRest<CategoryRow[]>(
    "categories?select=slug,name,blurb,image_url&order=position.asc",
  );
  if (!ok || !Array.isArray(data)) {
    throw new Error(`Supabase respondió ${status} al leer las categorías`);
  }
  return data.map((c) => {
    const local = localCategories.find((l) => l.slug === c.slug);
    return {
      slug: c.slug,
      name: c.name,
      blurb: c.blurb ?? "",
      image: c.image_url ?? local?.image ?? "",
    };
  });
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const all = await getProducts();
  return all.find((p) => p.slug === slug);
}

export async function getCategory(slug: string) {
  const [cats, all] = await Promise.all([getCategories(), getProducts()]);
  const category = cats.find((c) => c.slug === slug);
  return category ? { category, products: all.filter((p) => p.category === slug) } : undefined;
}

/** Quita tildes y pasa a minúsculas para que "teclado mecanico" encuentre "Teclado mecánico" */
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export async function searchProducts(q: string): Promise<Product[]> {
  const words = normalize(q).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const all = await getProducts();
  return all.filter((p) => {
    const hay = normalize(`${p.name} ${p.brand} ${p.category}`);
    return words.every((w) => hay.includes(w));
  });
}

/** Guarda un correo en el newsletter. */
export async function subscribeNewsletter(
  email: string,
): Promise<"ok" | "ya-estaba" | "no-configurado" | "error"> {
  if (!supabaseEnabled) return "no-configurado";
  try {
    const { status, ok } = await supabaseRest("newsletter", {
      method: "POST",
      body: { email: email.trim().toLowerCase(), accepted_policy: true },
      prefer: "return=minimal",
    });
    if (ok) return "ok";
    if (status === 409) return "ya-estaba";
    return "error";
  } catch {
    return "error";
  }
}
