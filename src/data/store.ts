/**
 * Catálogo de EJEMPLO.
 * Mientras Supabase no esté conectado, la tienda muestra estos productos.
 * Cuando conectes Supabase (ver LEEME-SUPABASE.md), los productos se leen de la base de datos
 * y este archivo solo queda como respaldo.
 */
import teclado from "@/assets/product-teclado.webp";
import mouse from "@/assets/product-mouse.webp";
import audifonos from "@/assets/product-audifonos.webp";
import mousepad from "@/assets/product-mousepad.webp";
import combo from "@/assets/hero-keyboard.webp";

export type Category = {
  slug: string;
  name: string;
  /** Frase corta que aparece en la página de la categoría */
  blurb: string;
  image: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  price: number;
  oldPrice?: number | undefined;
  stock: number;
  description: string;
  specs: string[];
  /** Fotos adicionales (opcional). La principal es "image". */
  gallery?: string[] | undefined;
};

export const categories: Category[] = [
  {
    slug: "teclados",
    name: "Teclados",
    blurb: "Mecánicos, compactos y hot-swap para escribir y jugar.",
    image: teclado,
  },
  {
    slug: "mouse",
    name: "Mouse",
    blurb: "Livianos, inalámbricos y con sensores de alta precisión.",
    image: mouse,
  },
  {
    slug: "audio",
    name: "Audio",
    blurb: "Diademas con micrófono para escuchar cada paso.",
    image: audifonos,
  },
  {
    slug: "mouse-pads",
    name: "Mouse pads",
    blurb: "Superficies de control y velocidad, en tamaño XL o circular.",
    image: mousepad,
  },
  {
    slug: "combos",
    name: "Combos",
    blurb: "Setups completos a mejor precio que por separado.",
    image: combo,
  },
];

export const products: Product[] = [
  {
    id: "1",
    slug: "teclado-mecanico-hyperion-75-hot-swap",
    name: "Teclado mecánico Hyperion 75% hot-swap RGB",
    brand: "Hyperion",
    category: "teclados",
    image: teclado,
    price: 389000,
    oldPrice: 459000,
    stock: 8,
    description:
      "Formato 75%: conserva flechas y fila de funciones ocupando menos espacio en el escritorio. Los switches se cambian sin soldar.",
    specs: [
      "Formato 75%",
      "Switches intercambiables (hot-swap)",
      "Iluminación RGB por tecla",
      "Conexión USB-C",
    ],
  },
  {
    id: "2",
    slug: "mouse-inalambrico-viper-26k",
    name: "Mouse inalámbrico Viper 26K DPI, 58 g",
    brand: "Viper",
    category: "mouse",
    image: mouse,
    price: 259000,
    oldPrice: 299000,
    stock: 12,
    description:
      "Pesa 58 gramos para movimientos rápidos sin cansar la muñeca. Sensor de hasta 26.000 DPI.",
    specs: ["Sensor de 26.000 DPI", "Peso de 58 g", "Inalámbrico 2,4 GHz", "Batería recargable"],
  },
  {
    id: "3",
    slug: "diadema-aurora-7-1-surround",
    name: "Diadema Aurora 7.1 surround ARGB",
    brand: "Aurora",
    category: "audio",
    image: audifonos,
    price: 219000,
    oldPrice: 265000,
    stock: 6,
    description:
      "Sonido envolvente 7.1 para ubicar a tus rivales por el ruido. Micrófono desmontable.",
    specs: [
      "Sonido envolvente 7.1 virtual",
      "Micrófono desmontable",
      "Iluminación ARGB",
      "Conexión USB",
    ],
  },
  {
    id: "4",
    slug: "mouse-pad-xl-nebula-speed",
    name: "Mouse pad XL Nebula Speed con borde RGB",
    brand: "Nebula",
    category: "mouse-pads",
    image: mousepad,
    price: 129000,
    stock: 20,
    description:
      "Cubre teclado y mouse. Superficie de velocidad con base antideslizante y borde iluminado.",
    specs: [
      "Tamaño XL",
      "Superficie de velocidad",
      "Base de caucho antideslizante",
      "Borde RGB por USB",
    ],
  },
  {
    id: "5",
    slug: "combo-setup-pro",
    name: "Combo Setup Pro: teclado, mouse y pad",
    brand: "SpaceGaming",
    category: "combos",
    image: combo,
    price: 649000,
    oldPrice: 749000,
    stock: 4,
    description:
      "Teclado mecánico, mouse gamer y mouse pad XL que combinan entre sí. Pagas menos que comprándolos por separado.",
    specs: ["Teclado mecánico RGB", "Mouse gamer", "Mouse pad XL", "Iluminación sincronizable"],
  },
  {
    id: "6",
    slug: "teclado-hyperion-60-silencioso",
    name: "Teclado compacto Hyperion 60% switch rojo silencioso",
    brand: "Hyperion",
    category: "teclados",
    image: teclado,
    price: 289000,
    stock: 10,
    description:
      "Formato 60% para dejar más espacio al mouse. Switches rojos lineales y silenciosos.",
    specs: ["Formato 60%", "Switch rojo silencioso", "Cable USB-C desmontable", "Iluminación RGB"],
  },
  {
    id: "7",
    slug: "mouse-viper-pro-esports-8000hz",
    name: "Mouse Viper Pro Esports 8000 Hz",
    brand: "Viper",
    category: "mouse",
    image: mouse,
    price: 349000,
    oldPrice: 399000,
    stock: 5,
    description:
      "Reporta su posición 8.000 veces por segundo: menos retraso entre tu mano y la pantalla.",
    specs: ["Tasa de sondeo de 8.000 Hz", "Switches ópticos", "Patas de PTFE", "Cable flexible"],
  },
  {
    id: "8",
    slug: "diadema-inalambrica-stellar",
    name: "Diadema inalámbrica Stellar baja latencia",
    brand: "Aurora",
    category: "audio",
    image: audifonos,
    price: 399000,
    stock: 7,
    description:
      "Sin cables y con baja latencia para que el sonido llegue a tiempo. Funciona en PC y consola.",
    specs: [
      "Inalámbrica 2,4 GHz y Bluetooth",
      "Baja latencia",
      "Micrófono con cancelación de ruido",
      "Compatible con PC y consola",
    ],
  },
  {
    id: "9",
    slug: "mouse-pad-circular-galaxy",
    name: "Mouse pad circular Galaxy Control",
    brand: "Nebula",
    category: "mouse-pads",
    image: mousepad,
    price: 79000,
    stock: 25,
    description:
      "Superficie de control para frenar el mouse con precisión. Formato circular para escritorios pequeños.",
    specs: ["Formato circular", "Superficie de control", "Bordes cosidos", "Base antideslizante"],
  },
  {
    id: "10",
    slug: "teclado-tkl-hyperion-pudding",
    name: "Teclado TKL Hyperion ARGB con keycaps pudding",
    brand: "Hyperion",
    category: "teclados",
    image: teclado,
    price: 199000,
    oldPrice: 239000,
    stock: 9,
    description: "Sin teclado numérico (TKL). Las teclas translúcidas dejan pasar más luz.",
    specs: ["Formato TKL", "Keycaps pudding translúcidos", "Iluminación ARGB", "Anti-ghosting"],
  },
];
