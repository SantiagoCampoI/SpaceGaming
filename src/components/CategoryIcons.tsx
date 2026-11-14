import { Keyboard, Mouse, Headphones, Monitor, Gamepad2, Mic } from "lucide-react";

const categories = [
  { label: "TECLADO", Icon: Keyboard },
  { label: "MOUSE", Icon: Mouse },
  { label: "AUDIO", Icon: Headphones },
  { label: "MONITORES", Icon: Monitor },
  { label: "CONTROLES", Icon: Gamepad2 },
  { label: "MICRÓFONOS", Icon: Mic },
];

export function CategoryIcons() {
  return (
    <section className="mx-auto max-w-[1400px] px-4">
      <div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-secondary/90 p-4 sm:grid-cols-6">
        {categories.map(({ label, Icon }) => (
          <a
            key={label}
            href="#destacados"
            className="group flex flex-col items-center gap-2 rounded-md p-2 transition hover:bg-background"
          >
            <Icon
              className="h-7 w-7 text-foreground/70 transition group-hover:text-primary"
              strokeWidth={1.5}
            />
            <span className="text-center text-[10px] font-bold tracking-wide text-muted-foreground group-hover:text-primary">
              {label}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
