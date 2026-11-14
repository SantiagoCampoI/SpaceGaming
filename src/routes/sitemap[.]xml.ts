import { createFileRoute } from "@tanstack/react-router";
import { getCategories, getProducts } from "@/lib/catalog";
import { site } from "@/config/site";

/** Genera /sitemap.xml para que Google encuentre todas las páginas. */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [products, categories] = await Promise.all([getProducts(), getCategories()]);
        const paths = [
          "/",
          "/ofertas",
          "/ayuda",
          "/politica-de-datos",
          ...categories.map((c) => `/categoria/${c.slug}`),
          ...products.map((p) => `/producto/${p.slug}`),
        ];
        const body =
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          paths.map((p) => `  <url><loc>${site.url}${p}</loc></url>`).join("\n") +
          `\n</urlset>\n`;
        return new Response(body, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
