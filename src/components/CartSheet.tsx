import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, MessageCircle, ShoppingBag } from "lucide-react";

import { useCart, type CartLine } from "@/lib/cart";
import { cop } from "@/lib/format";
import { site, whatsappLink } from "@/config/site";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";

/**
 * Panel lateral del carrito.
 * Por ahora el pedido se termina por WhatsApp. Cuando conectes la pasarela de pago,
 * el botón "Finalizar pedido" debe llevar al checkout (ver el plan, fase 2).
 */
export function CartSheet() {
  const cart = useCart();
  // Última línea eliminada, para poder deshacer un toque accidental en la papelera
  const [removed, setRemoved] = useState<CartLine | null>(null);
  const missing = site.freeShippingFrom - cart.total;

  const orderMessage = () => {
    const lines = cart.lines.map((l) => `• ${l.qty} x ${l.name} — ${cop(l.price * l.qty)}`);
    return [
      "Hola SpaceGaming, quiero hacer este pedido:",
      "",
      ...lines,
      "",
      `Total: ${cop(cart.total)}`,
      "",
      "Mi ciudad es: ",
    ].join("\n");
  };

  return (
    <Sheet open={cart.open} onOpenChange={cart.setOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overscroll-contain bg-card p-0 sm:max-w-md"
      >
        <div className="border-b px-6 py-5">
          <SheetTitle className="font-display text-xl font-semibold">Tu carrito</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {cart.count === 0
              ? "Todavía no has agregado productos."
              : `${cart.count} ${cart.count === 1 ? "producto" : "productos"}`}
          </SheetDescription>
        </div>

        {removed && !cart.lines.some((l) => l.slug === removed.slug) && (
          <p
            role="status"
            className="flex items-center justify-between gap-3 border-b bg-secondary/60 px-6 py-3 text-sm"
          >
            <span className="min-w-0 truncate">Quitaste {removed.name}.</span>
            <button
              type="button"
              onClick={() => {
                cart.restore(removed);
                setRemoved(null);
              }}
              className="shrink-0 rounded-full px-3 py-1.5 font-medium text-orbit hover:bg-secondary"
            >
              Deshacer
            </button>
          </p>
        )}

        {cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag
              className="h-10 w-10 text-muted-foreground"
              strokeWidth={1.25}
              aria-hidden
            />
            <p className="max-w-[26ch] text-muted-foreground">
              Agrega un producto y aparecerá aquí con su precio.
            </p>
            <Link
              to="/ofertas"
              onClick={() => cart.setOpen(false)}
              className="rounded-full bg-primary px-5 py-2.5 text-[15px] font-semibold text-primary-foreground"
            >
              Ver ofertas
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y overflow-y-auto px-6">
              {cart.lines.map((l) => (
                <li key={l.slug} className="flex gap-4 py-4">
                  <img
                    src={l.image}
                    alt=""
                    width={72}
                    height={72}
                    className="h-[72px] w-[72px] shrink-0 rounded-lg bg-secondary object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <Link
                      to="/producto/$slug"
                      params={{ slug: l.slug }}
                      onClick={() => cart.setOpen(false)}
                      className="line-clamp-2 text-[15px] leading-snug hover:text-orbit"
                    >
                      {l.name}
                    </Link>
                    <div className="mt-auto flex items-center justify-between gap-2">
                      <div className="flex items-center rounded-full border">
                        <button
                          type="button"
                          onClick={() => cart.setQty(l.slug, l.qty - 1)}
                          className="grid h-11 w-11 place-items-center rounded-full hover:bg-secondary"
                          aria-label={`Quitar una unidad de ${l.name}`}
                        >
                          <Minus className="h-3.5 w-3.5" aria-hidden />
                        </button>
                        <span className="tabular w-6 text-center text-sm" aria-live="polite">
                          {l.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => cart.setQty(l.slug, l.qty + 1)}
                          disabled={l.stock > 0 && l.qty >= l.stock}
                          className="grid h-11 w-11 place-items-center rounded-full hover:bg-secondary disabled:opacity-40"
                          aria-label={`Agregar una unidad de ${l.name}`}
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </div>
                      <span className="font-display tabular font-semibold">
                        {cop(l.price * l.qty)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setRemoved(l);
                          cart.remove(l.slug);
                        }}
                        className="grid h-11 w-11 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                        aria-label={`Eliminar ${l.name} del carrito`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-4 border-t bg-background/40 px-6 py-5">
              {site.freeShippingFrom > 0 && (
                <p className="text-sm text-muted-foreground">
                  {missing > 0 ? (
                    <>
                      Te faltan <span className="tabular text-foreground">{cop(missing)}</span> para
                      el envío gratis.
                    </>
                  ) : (
                    <span className="text-foreground">Tu pedido tiene envío gratis.</span>
                  )}
                </p>
              )}
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-display tabular text-2xl font-semibold">
                  {cop(cart.total)}
                </span>
              </div>
              <a
                href={whatsappLink(orderMessage())}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                Finalizar pedido por WhatsApp
              </a>
              <p className="text-center text-xs text-muted-foreground">
                Te confirmamos disponibilidad, envío y forma de pago por chat.{" "}
                <Link
                  to="/ayuda"
                  hash="como-comprar"
                  onClick={() => cart.setOpen(false)}
                  className="text-orbit underline underline-offset-2"
                >
                  Cómo funciona
                </Link>
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
