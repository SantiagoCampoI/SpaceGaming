/**
 * Datos del negocio en UN solo lugar.
 * Cambia lo que está marcado con "CAMBIAR" y toda la página se actualiza.
 */
export const site = {
  name: "SpaceGaming",
  // CAMBIAR: la dirección final de tu página (sin "/" al final). Se usa en el sitemap y al compartir en redes.
  url: "https://spacegaming.co",
  description:
    "Teclados mecánicos, mouse gamer, diademas y mouse pads originales, con garantía y envío a toda Colombia.",

  // CAMBIAR: número de WhatsApp con indicativo 57 y sin espacios ni "+". Ej: "573101234567"
  whatsapp: "573000000000",
  // CAMBIAR: teléfono como quieres que se vea escrito
  phoneDisplay: "+57 300 000 0000",
  // CAMBIAR: correo de ventas
  email: "ventas@spacegaming.co",

  // CAMBIAR: enlaces a tus redes. Deja "" en las que no tengas y no se mostrarán.
  social: {
    instagram: "",
    facebook: "",
    tiktok: "",
    youtube: "",
    twitch: "",
  },

  // Envío gratis desde este valor (en pesos). Pon 0 si no ofreces envío gratis.
  freeShippingFrom: 300000,

  // CAMBIAR: tiempo de entrega tal como quieres prometerlo, ej. "2 a 5 días hábiles".
  // Mientras esté vacío, la página de ayuda no promete ningún plazo.
  shippingTime: "",

  // CAMBIAR: medios de pago que aceptas, ej. ["Nequi", "Transferencia Bancolombia", "Contraentrega"].
  // Mientras la lista esté vacía, la página dice que la forma de pago se acuerda por WhatsApp.
  paymentMethods: [] as string[],

  // CAMBIAR: razón social o nombre de la persona responsable de la tienda y su NIT o cédula.
  // Aparecen en la política de datos. Deja "" en documentId si aún no lo quieres publicar.
  legalName: "SpaceGaming",
  documentId: "",

  // Ciudades con punto físico o atención directa. Deja la lista vacía si solo vendes en línea.
  cities: ["Bogotá", "Medellín", "Barranquilla"],
} as const;

export const whatsappLink = (message?: string) =>
  `https://wa.me/${site.whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
