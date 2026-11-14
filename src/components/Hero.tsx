import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

import type { Product } from "@/data/store";
import { whatsappLink } from "@/config/site";
import { cop } from "@/lib/format";

/**
 * Portada. El producto destacado se muestra como un planeta con un anillo,
 * igual que el planeta del logo. El anillo pasa por detrás arriba y por delante abajo.
 */
export function Hero({ featured }: { featured?: Product | undefined }) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-[1280px] items-center gap-8 px-4 pb-12 pt-8 sm:px-6 md:grid-cols-[1.05fr_1fr] md:gap-6 md:pb-16 md:pt-10">
        <div className="max-w-[34rem]">
          <h1 className="text-[clamp(2.25rem,5.2vw,3.9rem)] font-semibold leading-[1.04]">
            Arma el setup que tienes en mente
          </h1>
          <p className="mt-5 max-w-[44ch] text-[17px] leading-relaxed text-muted-foreground sm:text-lg">
            Periféricos originales con garantía y envío a toda Colombia. ¿Dudas entre dos modelos?
            Te asesoramos por WhatsApp antes de comprar.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/ofertas"
              className="inline-flex h-12 items-center rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-[0_0_32px_-6px_rgb(238_240_250/0.45)] transition hover:bg-primary/90"
            >
              Ver ofertas
            </Link>
            <a
              href={whatsappLink("Hola, quiero asesoría para armar mi setup.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-input px-6 text-[15px] font-medium transition hover:bg-secondary"
            >
              <MessageCircle className="h-4 w-4 text-whatsapp" aria-hidden />
              Pedir asesoría
            </a>
          </div>
        </div>

        {featured && <Planet product={featured} />}
      </div>
    </section>
  );
}

function Planet({ product }: { product: Product }) {
  // Geometría compartida por el anillo de atrás y el de adelante (viewBox 0..100)
  const ring = { cx: 50, cy: 52, rx: 49, ry: 12.5, tilt: -16 };
  const Ellipse = ({ className = "" }: { className?: string }) => (
    <ellipse
      cx={ring.cx}
      cy={ring.cy}
      rx={ring.rx}
      ry={ring.ry}
      pathLength={1}
      fill="none"
      stroke="currentColor"
      strokeWidth={0.32}
      strokeLinecap="round"
      className={`ring-draw ${className}`}
    />
  );

  return (
    <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[440px] md:max-w-[520px]">
      <div className="relative aspect-square">
        {/* Anillo de atrás: mitad superior */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full text-orbit/45"
          aria-hidden
        >
          <defs>
            <clipPath id="ring-back">
              <rect x="0" y="0" width="100" height={ring.cy} />
            </clipPath>
          </defs>
          <g transform={`rotate(${ring.tilt} ${ring.cx} ${ring.cy})`} clipPath="url(#ring-back)">
            <Ellipse />
          </g>
        </svg>

        {/* El planeta: la foto del producto recortada en círculo, con sombra de terminador */}
        <Link
          to="/producto/$slug"
          params={{ slug: product.slug }}
          className="absolute inset-[15%] block overflow-hidden rounded-full"
          aria-label={`Ver ${product.name}`}
        >
          <img
            src={product.image}
            alt=""
            width={520}
            height={520}
            fetchPriority="high"
            className="h-full w-full scale-110 object-cover"
          />
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 32% 28%, transparent 38%, rgb(10 14 31 / 0.55) 72%, rgb(10 14 31 / 0.92) 100%)",
              boxShadow: "inset 0 0 0 1px rgb(238 240 250 / 0.08)",
            }}
            aria-hidden
          />
        </Link>

        {/* Anillo de adelante: mitad inferior, por encima de la foto */}
        <svg
          viewBox="0 0 100 100"
          className="pointer-events-none absolute inset-0 h-full w-full text-orbit"
          aria-hidden
        >
          <defs>
            <clipPath id="ring-front">
              <rect x="0" y={ring.cy} width="100" height={100 - ring.cy} />
            </clipPath>
          </defs>
          <g transform={`rotate(${ring.tilt} ${ring.cx} ${ring.cy})`} clipPath="url(#ring-front)">
            <Ellipse />
          </g>
        </svg>
      </div>

      {/* Etiqueta del producto destacado */}
      <Link
        to="/producto/$slug"
        params={{ slug: product.slug }}
        className="relative -mt-6 ml-auto flex w-fit max-w-[16rem] flex-col rounded-xl border bg-card/90 px-4 py-3 backdrop-blur transition hover:border-orbit sm:absolute sm:bottom-[3%] sm:right-0 sm:mt-0"
      >
        <span className="text-[13px] text-muted-foreground">Destacado</span>
        <span className="text-[15px] font-medium leading-snug">{product.name}</span>
        <span className="mt-1 flex items-baseline gap-2">
          <span className="font-display tabular text-lg font-semibold">{cop(product.price)}</span>
          {product.oldPrice && (
            <span className="tabular text-[13px] text-muted-foreground line-through">
              {cop(product.oldPrice)}
            </span>
          )}
        </span>
      </Link>
    </div>
  );
}
