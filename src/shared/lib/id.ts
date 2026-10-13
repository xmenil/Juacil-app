/**
 * Generador de IDs estables para entorno mock
 */

export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `${prefix}-${timestamp}-${random}`;
}

export function generateOrderCode(seq: number): string {
  return `JUA-${String(seq).padStart(4, '0')}`;
}
