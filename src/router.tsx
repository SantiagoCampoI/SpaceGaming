import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Transición suave entre páginas (la foto del producto "viaja" de la tarjeta al detalle).
    // Los navegadores que no la soportan simplemente cambian de página como siempre.
    defaultViewTransition: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
