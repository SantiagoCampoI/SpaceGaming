import { Link } from "@tanstack/react-router";
import {
  Facebook,
  Instagram,
  Youtube,
  Twitch,
  Music2,
  MessageCircle,
  Mail,
  Phone,
} from "lucide-react";

import logo from "@/assets/logo-transparente.webp";
import type { Category } from "@/data/store";
import { site, whatsappLink } from "@/config/site";

const socialLinks = [
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "facebook", label: "Facebook", Icon: Facebook },
  { key: "tiktok", label: "TikTok", Icon: Music2 },
  { key: "youtube", label: "YouTube", Icon: Youtube },
  { key: "twitch", label: "Twitch", Icon: Twitch },
] as const;

const helpLinks = [
  { hash: "como-comprar", label: "Cómo comprar" },
  { hash: "envios", label: "Envíos" },
  { hash: "pagos", label: "Formas de pago" },
  { hash: "garantia", label: "Garantía" },
  { hash: "retracto", label: "Devoluciones y retracto" },
] as const;

export function SiteFooter({ categories }: { categories: Category[] }) {
  const socials = socialLinks.filter((s) => site.social[s.key]);

  return (
    <footer className="mt-24 border-t bg-card/60">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-sm space-y-4">
          <img
            src={logo}
            alt="SpaceGaming"
            width={120}
            height={98}
            loading="lazy"
            className="h-16 w-auto"
          />
          <p className="text-[15px] text-muted-foreground">{site.description}</p>
          {socials.length > 0 && (
            <ul className="flex gap-2">
              {socials.map(({ key, label, Icon }) => (
                <li key={key}>
                  <a
                    href={site.social[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`SpaceGaming en ${label}`}
                    className="grid h-10 w-10 place-items-center rounded-full bg-secondary transition-colors hover:bg-orbit hover:text-background"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav aria-labelledby="pie-tienda">
          <h2 id="pie-tienda" className="mb-4 font-sans text-[15px] font-semibold tracking-normal">
            Tienda
          </h2>
          <ul className="space-y-2.5 text-[15px] text-muted-foreground">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  to="/categoria/$slug"
                  params={{ slug: c.slug }}
                  className="hover:text-foreground"
                >
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/ofertas" className="hover:text-foreground">
                Ofertas
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-labelledby="pie-ayuda">
          <h2 id="pie-ayuda" className="mb-4 font-sans text-[15px] font-semibold tracking-normal">
            Ayuda
          </h2>
          <ul className="space-y-2.5 text-[15px] text-muted-foreground">
            {helpLinks.map((l) => (
              <li key={l.hash}>
                <Link to="/ayuda" hash={l.hash} className="hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/politica-de-datos" className="hover:text-foreground">
                Política de datos
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 font-sans text-[15px] font-semibold tracking-normal">Contacto</h2>
          <ul className="space-y-2.5 text-[15px] text-muted-foreground">
            <li>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-foreground"
              >
                <MessageCircle className="h-4 w-4 text-whatsapp" aria-hidden /> WhatsApp{" "}
                {site.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={`tel:+${site.whatsapp}`}
                className="flex items-center gap-2 hover:text-foreground"
              >
                <Phone className="h-4 w-4" aria-hidden /> Llamar
              </a>
            </li>
            <li>
              <a
                href={`mailto:${site.email}`}
                className="flex items-center gap-2 hover:text-foreground"
              >
                <Mail className="h-4 w-4" aria-hidden /> {site.email}
              </a>
            </li>
            {site.cities.length > 0 && (
              <li className="pt-2">
                Atendemos en {site.cities.join(", ")} y enviamos a toda Colombia.
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-5 text-[13px] text-muted-foreground sm:px-6">
          <span>
            © {new Date().getFullYear()} <span translate="no">SpaceGaming</span>. Precios en pesos
            colombianos con IVA incluido.
          </span>
          <a
            href="https://www.sic.gov.co"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            Superintendencia de Industria y Comercio
          </a>
        </div>
      </div>
    </footer>
  );
}
