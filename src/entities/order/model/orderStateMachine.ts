import { OrderStatus } from './types';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: 'Pendiente de confirmación',
  confirmado: 'Confirmado por la tienda',
  preparado: 'Preparado / Listo para entrega',
  entregado: 'Entregado con éxito',
  cancelado: 'Cancelado',
};

export const ORDER_STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  pendiente: 'La tienda ha recibido tu pedido y se pondrá en contacto por WhatsApp.',
  confirmado: 'La tienda confirmó la disponibilidad de los productos.',
  preparado: 'Tus productos han sido empaquetados y están listos para recojo o envío.',
  entregado: 'El pedido fue entregado satisfactoriamente al comprador.',
  cancelado: 'El pedido fue cancelado y el stock ha sido devuelto al inventario.',
};

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pendiente: ['confirmado', 'cancelado'],
  confirmado: ['preparado', 'cancelado'],
  preparado: ['entregado'],
  entregado: [],
  cancelado: [],
};

/**
 * Verifica si una transición entre estados de pedido es válida.
 */
export function canTransitionOrder(current: OrderStatus, target: OrderStatus): boolean {
  if (current === target) return false;
  const allowed = ALLOWED_TRANSITIONS[current] || [];
  return allowed.includes(target);
}

/**
 * Valida la transición arrojando o retornando un mensaje comprensible.
 */
export function validateOrderTransition(
  current: OrderStatus,
  target: OrderStatus
): { valid: boolean; error?: string } {
  if (current === target) {
    return { valid: false, error: `El pedido ya se encuentra en estado "${ORDER_STATUS_LABELS[current]}".` };
  }
  
  if (current === 'cancelado') {
    return { valid: false, error: 'No es posible modificar un pedido que ya ha sido cancelado.' };
  }
  
  if (current === 'entregado') {
    return { valid: false, error: 'El pedido ya fue entregado y no admite más cambios de estado.' };
  }

  if (target === 'cancelado' && (current !== 'pendiente' && current !== 'confirmado')) {
    return { valid: false, error: 'Solo se pueden cancelar pedidos en estado pendiente o confirmado.' };
  }

  const allowed = ALLOWED_TRANSITIONS[current] || [];
  if (!allowed.includes(target)) {
    return {
      valid: false,
      error: `Transición no permitida: de "${ORDER_STATUS_LABELS[current]}" a "${ORDER_STATUS_LABELS[target]}".`,
    };
  }

  return { valid: true };
}
