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
  return PEN_FORMATTER.format(cents / 100);
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
