import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { MessageCircle } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CartProvider } from "@/lib/cart";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CartSheet } from "@/components/CartSheet";
import { site, whatsappLink } from "@/config/site";
import { getCategories } from "@/lib/catalog";
import { jsonForScript } from "@/lib/safe-json";

function NotFoundComponent() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-20 text-center">
      <p className="font-display text-7xl font-semibold text-orbit">404</p>
      <h1 className="mt-4 text-2xl font-semibold">Esta página se perdió en el espacio</h1>
      <p className="mt-2 text-muted-foreground">
        Puede que el producto ya no esté disponible o que el enlace tenga un error.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="rounded-full bg-primary px-5 py-2.5 text-[15px] font-semibold text-primary-foreground"
        >
          Volver al inicio
        </Link>
        <Link to="/ofertas" className="rounded-full border border-input px-5 py-2.5 text-[15px]">
          Ver ofertas
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold">Esta página no cargó</h1>
      <p className="mt-2 text-muted-foreground">
        Algo falló de nuestro lado. Intenta de nuevo o vuelve al inicio.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => {
            void router.invalidate();
            reset();
          }}
          className="rounded-full bg-primary px-5 py-2.5 text-[15px] font-semibold text-primary-foreground"
        >
          Intentar de nuevo
        </button>
        <a href="/" className="rounded-full border border-input px-5 py-2.5 text-[15px]">
          Volver al inicio
        </a>
      </div>
    </div>
  );
}

const defaultTitle = "SpaceGaming | Periféricos gamer originales en Colombia";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // Las categorías del menú y del pie salen del mismo lugar que el resto del catálogo
  // (Supabase si está conectado). Antes el menú leía siempre la lista de ejemplo.
  loader: () => getCategories(),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0a0e1f" },
      { title: defaultTitle },
      { name: "description", content: site.description },
      { name: "author", content: "SpaceGaming" },
      { property: "og:site_name", content: "SpaceGaming" },
      { property: "og:title", content: defaultTitle },
      { property: "og:description", content: site.description },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "es_CO" },
      { property: "og:image", content: `${site.url}/og-image.jpg` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${site.url}/og-image.jpg` },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "shortcut icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Tektur:wght@500;600;700&display=swap",
      },
    ],
    scripts: [
      {
        // Le dice a Google quién es la tienda y cómo contactarla
        type: "application/ld+json",
        children: jsonForScript({
          "@context": "https://schema.org",
          "@type": "OnlineStore",
          name: site.name,
          url: site.url,
          logo: `${site.url}/favicon.png`,
          description: site.description,
          email: site.email,
          areaServed: "CO",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es-CO">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const categories = Route.useLoaderData();
  // En el panel de administración no va el botón flotante: taparía el botón de guardar
  const inAdmin = useLocation({ select: (l) => l.pathname.startsWith("/admin") });

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Saltar al contenido
        </a>
        <SiteHeader categories={categories} />
        <main id="contenido">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        <SiteFooter categories={categories} />
        <CartSheet />
        {!inAdmin && (
          <a
            href={whatsappLink("Hola SpaceGaming, tengo una pregunta.")}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escríbenos por WhatsApp"
            className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-[#073b1c] shadow-[0_8px_24px_-6px_rgb(37_211_102/0.55)] transition hover:scale-105"
          >
            <MessageCircle className="h-6 w-6" />
          </a>
        )}
      </CartProvider>
    </QueryClientProvider>
  );
}
