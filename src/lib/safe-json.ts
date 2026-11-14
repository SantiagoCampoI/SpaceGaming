/**
 * Convierte datos a JSON seguro para meterlo dentro de una etiqueta <script>.
 * Sin esto, un texto como "</script><script>..." en la descripción de un producto
 * podría cerrar la etiqueta y ejecutar código en el navegador del visitante (XSS).
 */
export function jsonForScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
