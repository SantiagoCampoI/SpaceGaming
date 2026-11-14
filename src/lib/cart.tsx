/**
 * Carrito de compras.
 * Se guarda en el navegador (localStorage), así no se pierde al recargar la página.
 * Ojo: el precio que se guarda aquí es solo para mostrarlo. Cuando haya pasarela de pago,
 * el total real se debe recalcular en el servidor con los precios de la base de datos.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/data/store";

export type CartLine = {
  slug: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  stock: number;
};

/** Lo que cambia: el contenido del carrito. */
type CartState = {
  lines: CartLine[];
  count: number;
  total: number;
  open: boolean;
};

/** Lo que se puede hacer. Estas funciones nunca cambian de identidad. */
type CartActions = {
  setOpen: (v: boolean) => void;
  add: (p: Product, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  /** Vuelve a poner una línea eliminada (botón "Deshacer") */
  restore: (line: CartLine) => void;
  clear: () => void;
};

/*
 * Dos contextos separados a propósito. Una tarjeta de producto solo necesita "agregar":
 * si leyera también el contenido del carrito, las 10, 40 o 200 tarjetas de la página
 * se volverían a dibujar cada vez que alguien cambia una cantidad.
 */
const CartStateContext = createContext<CartState | null>(null);
const CartActionsContext = createContext<CartActions | null>(null);

/**
 * El carrito guardado en el navegador lo puede modificar cualquiera.
 * Aquí se descarta todo lo que no tenga la forma esperada.
 */
function sanitizeLine(value: unknown): CartLine | null {
  if (!value || typeof value !== "object") return null;
  const l = value as Record<string, unknown>;
  const isInt = (n: unknown, max: number): n is number =>
    typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= max;
  if (typeof l["slug"] !== "string" || !/^[a-z0-9-]{1,120}$/.test(l["slug"])) return null;
  if (typeof l["name"] !== "string" || typeof l["image"] !== "string") return null;
  if (!isInt(l["price"], 100_000_000) || !isInt(l["qty"], 99) || !isInt(l["stock"], 100_000))
    return null;
  if (l["qty"] === 0) return null;
  const image = l["image"];
  // Solo imágenes del propio sitio o https (nunca "javascript:" u otros esquemas)
  if (!(image.startsWith("/") || image.startsWith("https://"))) return null;
  return {
    slug: l["slug"],
    name: l["name"].slice(0, 200),
    image,
    price: l["price"],
    qty: l["qty"],
    stock: l["stock"],
  };
}
const STORAGE_KEY = "spacegaming-carrito-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  // Cargar el carrito guardado (solo en el navegador)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) setLines(parsed.map(sanitizeLine).filter((l) => l !== null));
      }
    } catch {
      /* navegador en modo privado o datos dañados: empezamos con el carrito vacío */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* sin almacenamiento disponible */
    }
  }, [lines, loaded]);

  const add = useCallback((p: Product, qty = 1) => {
    setLines((prev) => {
      const found = prev.find((l) => l.slug === p.slug);
      if (found) {
        return prev.map((l) =>
          l.slug === p.slug ? { ...l, qty: Math.min(l.qty + qty, p.stock || 99) } : l,
        );
      }
      return [
        ...prev,
        {
          slug: p.slug,
          name: p.name,
          image: p.image,
          price: p.price,
          qty: Math.min(qty, p.stock || 99),
          stock: p.stock,
        },
      ];
    });
    setOpen(true);
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.slug !== slug)
        : prev.map((l) => (l.slug === slug ? { ...l, qty: Math.min(qty, l.stock || 99) } : l)),
    );
  }, []);

  const remove = useCallback(
    (slug: string) => setLines((prev) => prev.filter((l) => l.slug !== slug)),
    [],
  );
  const restore = useCallback(
    (line: CartLine) =>
      setLines((prev) => (prev.some((l) => l.slug === line.slug) ? prev : [...prev, line])),
    [],
  );
  const clear = useCallback(() => setLines([]), []);

  const actions = useMemo<CartActions>(
    () => ({ setOpen, add, setQty, remove, restore, clear }),
    [add, setQty, remove, restore, clear],
  );

  const state = useMemo<CartState>(() => {
    let count = 0;
    let total = 0;
    for (const l of lines) {
      count += l.qty;
      total += l.qty * l.price;
    }
    return { lines, count, total, open };
  }, [lines, open]);

  return (
    <CartActionsContext.Provider value={actions}>
      <CartStateContext.Provider value={state}>{children}</CartStateContext.Provider>
    </CartActionsContext.Provider>
  );
}

/** Solo las acciones. Úsalo en componentes que agregan al carrito pero no lo muestran. */
export function useCartActions() {
  const ctx = useContext(CartActionsContext);
  if (!ctx) throw new Error("useCartActions debe usarse dentro de <CartProvider>");
  return ctx;
}

/** Contenido del carrito + acciones. Úsalo en el panel del carrito y en el encabezado. */
export function useCart() {
  const state = useContext(CartStateContext);
  const actions = useCartActions();
  if (!state) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return useMemo(() => ({ ...state, ...actions }), [state, actions]);
}
