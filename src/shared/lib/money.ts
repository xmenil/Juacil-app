/**
 * Manejo estricto de dinero en céntimos (números enteros)
 * Cumple con ADR-02 y especificación de JUÁCIL
 */

const PEN_FORMATTER = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formatea céntimos enteros a moneda peruana (PEN).
 * Ejemplo: 1850 -> "S/ 18.50"
 */
export function formatMoney(cents: number): string {
  if (isNaN(cents) || !isFinite(cents)) {
    return 'S/ 0.00';
  }
  // Reemplazar espacios de no separación (\u00a0) por espacio estándar para consistencia
  return PEN_FORMATTER.format(cents / 100).replace(/\u00a0/g, ' ');
}

/**
 * Convierte céntimos a string decimal para campos de formulario.
 * Ejemplo: 1850 -> "18.50"
 */
export function centsToDecimal(cents: number): string {
  if (isNaN(cents)) return '0.00';
  return (cents / 100).toFixed(2);
}

/**
 * Convierte un valor decimal o string a céntimos enteros.
 * Ejemplo: "18.50" o 18.5 -> 1850
 */
export function decimalToCents(amount: number | string): number {
  if (typeof amount === 'string') {
    const cleaned = amount.trim().replace(',', '.');
    const parsed = parseFloat(cleaned);
    if (isNaN(parsed) || parsed < 0) return 0;
    return Math.round(parsed * 100);
  }
  if (isNaN(amount) || amount < 0) return 0;
  return Math.round(amount * 100);
}

/**
 * Suma una lista de montos en céntimos enteros sin error de redondeo de punto flotante.
 */
export function sumCents(centsList: number[]): number {
  return centsList.reduce((acc, curr) => acc + (isNaN(curr) ? 0 : Math.round(curr)), 0);
}

/**
 * Calcula un porcentaje o impuesto sobre un monto en céntimos manteniendo enteros.
 */
export function calculateTax(cents: number, rate: number): number {
  return Math.round(cents * rate);
}

