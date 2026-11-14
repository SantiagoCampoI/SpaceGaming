import { useId, useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, MessageCircle } from "lucide-react";

import logo from "@/assets/logo-transparente.webp";
import type { Category } from "@/data/store";
import { site, whatsappLink } from "@/config/site";
import { cop } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

function SearchForm({ className = "" }: { className?: string }) {
  const inputId = useId();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (term) void navigate({ to: "/buscar", search: { q: term } });
  };
  return (
    <form role="search" onSubmit={onSubmit} className={`relative ${className}`}>
      <label htmlFor={inputId} className="sr-only">
        Buscar productos
      </label>
      <input
        id={inputId}
        type="search"
        name="q"
        enterKeyHint="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Busca teclados, mouse, diademas…"
        autoComplete="off"
        className="h-11 w-full rounded-full border border-input bg-secondary/70 pl-11 pr-4 text-[15px] text-foreground placeholder:text-muted-foreground focus-visible:border-orbit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orbit/60"
      />
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </form>
  );
}

const navLink =
  "rounded-full px-3 py-1.5 text-[15px] text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground data-[status=active]:bg-secondary";

export function SiteHeader({ categories }: { categories: Category[] }) {
  const cart = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-4 sm:gap-5 sm:px-6">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            className="-ml-2 grid h-11 w-11 place-items-center rounded-full text-foreground hover:bg-secondary lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </SheetTrigger>
          <SheetContent side="left" className="flex w-[85%] flex-col gap-6 bg-card p-6">
            <SheetTitle className="sr-only">Menú</SheetTitle>
            <img
              src={logo}
              alt="SpaceGaming"
              width={120}
              height={98}
              className="h-12 w-auto self-start"
            />
            <SearchForm />
            <nav aria-label="Categorías" className="flex flex-col">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  to="/categoria/$slug"
                  params={{ slug: c.slug }}
                  onClick={() => setMenuOpen(false)}
                  className="border-b py-3.5 text-lg text-foreground"
                >
                  {c.name}
                </Link>
              ))}
              <Link
                to="/ofertas"
                onClick={() => setMenuOpen(false)}
                className="border-b py-3.5 text-lg text-promo"
              >
                Ofertas
              </Link>
              <Link
                to="/ayuda"
                onClick={() => setMenuOpen(false)}
                className="py-3.5 text-lg text-muted-foreground"
              >
                Envíos, pagos y garantía
              </Link>
            </nav>
            <a
              href={whatsappLink("Hola, quiero asesoría para armar mi setup.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto flex items-center gap-2 text-[15px] text-muted-foreground"
            >
              <MessageCircle className="h-4 w-4 text-whatsapp" aria-hidden /> Asesoría por WhatsApp
            </a>
          </SheetContent>
        </Sheet>

        <Link to="/" className="shrink-0" aria-label="SpaceGaming, ir al inicio">
          <img src={logo} alt="SpaceGaming" width={120} height={98} className="h-12 w-auto" />
        </Link>

        <SearchForm className="hidden flex-1 sm:block sm:max-w-xl" />

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <a
            href={whatsappLink("Hola, quiero asesoría para armar mi setup.")}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-11 items-center gap-2 rounded-full px-3 text-[15px] text-muted-foreground transition-colors hover:text-foreground md:flex"
          >
            <MessageCircle className="h-4 w-4 text-whatsapp" aria-hidden />
            Asesoría
          </a>
          <button
            type="button"
            onClick={() => cart.setOpen(true)}
            className="relative flex h-11 items-center gap-2 rounded-full bg-secondary px-4 text-[15px] font-medium transition-colors hover:bg-secondary/70"
            aria-label={`Abrir carrito, ${cart.count} ${cart.count === 1 ? "producto" : "productos"}`}
          >
            <ShoppingBag className="h-[18px] w-[18px]" aria-hidden />
            <span className="tabular hidden sm:inline">{cop(cart.total)}</span>
            {cart.count > 0 && (
              <span className="tabular grid h-5 min-w-5 place-items-center rounded-full bg-orbit px-1 text-xs font-semibold text-background">
                {cart.count}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 pb-3 sm:hidden">
        <SearchForm />
      </div>

      <div className="hidden border-t lg:block">
        <div className="mx-auto flex h-12 max-w-[1280px] items-center gap-1 px-4 sm:px-6">
          <nav aria-label="Categorías" className="-ml-3 flex items-center gap-1">
            {categories.map((c) => (
              <Link
                key={c.slug}
                to="/categoria/$slug"
                params={{ slug: c.slug }}
                className={navLink}
              >
                {c.name}
              </Link>
            ))}
            <Link to="/ofertas" className={`${navLink} text-promo hover:text-promo`}>
              Ofertas
            </Link>
          </nav>
          <Link
            to="/ayuda"
            hash="envios"
            className="ml-auto rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {site.freeShippingFrom > 0 ? (
              <>
                Envío gratis a toda Colombia desde{" "}
                <span className="tabular text-foreground">{cop(site.freeShippingFrom)}</span>
              </>
            ) : (
              "Envíos a toda Colombia"
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
