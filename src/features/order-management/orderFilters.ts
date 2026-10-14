import { OrderStatus } from '@/entities/order/model/types';

export const ORDER_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'confirmado', label: 'Confirmados' },
  { value: 'preparado', label: 'Preparados' },
  { value: 'entregado', label: 'Entregados' },
  { value: 'cancelado', label: 'Cancelados' },
] as const;

export function getOrderFilter(value: string | null): 'all' | OrderStatus {
  return ORDER_FILTERS.find(filter => filter.value === value)?.value || 'all';
}
