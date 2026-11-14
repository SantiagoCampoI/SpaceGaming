function layer(count: number, size: number, seed: number) {
  const shadows: string[] = [];
  let s = seed;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  for (let i = 0; i < count; i++) {
    shadows.push(
      `${Math.round(rnd() * 2000)}px ${Math.round(rnd() * 2400)}px 0 rgba(255,255,255,${0.35 + rnd() * 0.65})`,
    );
  }
  return { boxShadow: shadows.join(", "), width: size, height: size };
}

const layers = [
  { style: layer(140, 1, 7), duration: "90s" },
  { style: layer(70, 2, 23), duration: "60s" },
  { style: layer(30, 3, 91), duration: "40s" },
];

/** Animated starfield backdrop. */
export function Starfield({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      {layers.map((l, i) => (
        <div key={i} className="absolute inset-0">
          <div
            className="stars-layer absolute left-0 top-0 rounded-full bg-white"
            style={{ ...l.style, animationDuration: l.duration }}
          />
          <div
            className="stars-layer absolute left-0 rounded-full bg-white"
            style={{ ...l.style, top: 1200, animationDuration: l.duration }}
          />
        </div>
      ))}
    </div>
  );
}
