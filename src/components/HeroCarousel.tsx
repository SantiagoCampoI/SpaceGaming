import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Starfield } from "./Starfield";
import heroKeyboard from "@/assets/hero-keyboard.jpg";
import mouse from "@/assets/product-mouse.jpg";
import audifonos from "@/assets/product-audifonos.jpg";

const slides = [
  {
    kicker: "MUY PRONTO EN SPACEGAMING",
    title: "BREAKING NEWS",
    subtitle: "¡NUEVAS TECNOLOGÍAS ESTÁN POR LLEGAR A COLOMBIA!",
    image: heroKeyboard,
  },
  {
    kicker: "SEMANA DE OFERTAS",
    title: "SPACE DAYS",
    subtitle: "HASTA 40% OFF EN MOUSE GAMER INALÁMBRICOS",
    image: mouse,
  },
  {
    kicker: "AUDIO DE COMPETENCIA",
    title: "SONIDO 7.1",
    subtitle: "DIADEMAS ARGB CON MICRÓFONO DESMONTABLE",
    image: audifonos,
  },
];

const sideBanners = [
  {
    title: "¿YA TIENES TU SETUP EN MENTE?",
    sub: "ELIGE TUS PERIFÉRICOS FAVORITOS",
    cta: "LISTA DE PRECIOS",
  },
  { title: "ENCUENTRA EDICIONES ESPECIALES", sub: "COLECCIONES LIMITADAS", cta: "VER TIENDA" },
  {
    title: "FÁCIL, RÁPIDO Y ONLINE",
    sub: "SIN INTERESES, SIN COMPLICACIONES",
    cta: "COMPRA AHORA",
  },
];

export function HeroCarousel() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);
  const s = slides[i]!;

  return (
    <section className="mx-auto grid max-w-[1400px] gap-3 px-4 py-4 lg:grid-cols-[1fr_320px]">
      <div className="relative h-[300px] overflow-hidden rounded-lg bg-ink sm:h-[380px]">
        <Starfield />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(220,38,38,0.55),transparent_60%)]" />
        <img
          src={s.image}
          alt={s.title}
          className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-70 [mask-image:linear-gradient(to_right,transparent,black_40%)]"
        />
        <div className="relative z-10 flex h-full max-w-[60%] flex-col justify-center gap-3 p-6 sm:p-10">
          <span className="w-fit rounded bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground">
            {s.kicker}
          </span>
          <h2 className="display text-3xl font-black text-ink-foreground sm:text-5xl">{s.title}</h2>
          <p className="text-sm font-semibold text-ink-foreground/80 sm:text-lg">{s.subtitle}</p>
          <a
            href="#destacados"
            className="mt-2 w-fit rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition hover:brightness-110"
          >
            VER PRODUCTOS
          </a>
        </div>

        <button
          aria-label="Anterior"
          onClick={() => setI((p) => (p - 1 + slides.length) % slides.length)}
          className="absolute left-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-ink/60 text-ink-foreground transition hover:bg-primary"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          aria-label="Siguiente"
          onClick={() => setI((p) => (p + 1) % slides.length)}
          className="absolute right-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-ink/60 text-ink-foreground transition hover:bg-primary"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Banner ${idx + 1}`}
              onClick={() => setI(idx)}
              className={`h-2.5 w-2.5 rounded-full transition ${idx === i ? "bg-primary" : "bg-ink-foreground/40"}`}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {sideBanners.map((b) => (
          <a
            key={b.title}
            href="#destacados"
            className="relative flex flex-col justify-center gap-1 overflow-hidden rounded-lg bg-ink p-4 text-ink-foreground transition hover:brightness-125"
          >
            <Starfield />
            <span className="relative display text-sm font-bold leading-tight">{b.title}</span>
            <span className="relative text-xs text-ink-foreground/70">{b.sub}</span>
            <span className="relative mt-1 w-fit rounded bg-primary px-2 py-1 text-[10px] font-bold">
              {b.cta}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
