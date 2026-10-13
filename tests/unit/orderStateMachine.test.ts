import { describe, it, expect } from 'vitest';
import {
  canTransitionOrder,
  validateOrderTransition,
} from '@/entities/order/model/orderStateMachine';

describe('Order State Machine', () => {
  it('allows valid state progression: pendiente -> confirmado -> preparado -> entregado', () => {
    expect(canTransitionOrder('pendiente', 'confirmado')).toBe(true);
    expect(validateOrderTransition('pendiente', 'confirmado').valid).toBe(true);

    expect(canTransitionOrder('confirmado', 'preparado')).toBe(true);
    expect(validateOrderTransition('confirmado', 'preparado').valid).toBe(true);

    expect(canTransitionOrder('preparado', 'entregado')).toBe(true);
    expect(validateOrderTransition('preparado', 'entregado').valid).toBe(true);
  });

  it('allows cancellation only from pendiente or confirmado', () => {
    expect(canTransitionOrder('pendiente', 'cancelado')).toBe(true);
    expect(canTransitionOrder('confirmado', 'cancelado')).toBe(true);
    expect(canTransitionOrder('preparado', 'cancelado')).toBe(false);
    expect(validateOrderTransition('preparado', 'cancelado').valid).toBe(false);
  });

  it('rejects illegal backward or skipped transitions', () => {
    expect(canTransitionOrder('pendiente', 'entregado')).toBe(false);
    expect(canTransitionOrder('preparado', 'pendiente')).toBe(false);
    expect(canTransitionOrder('confirmado', 'pendiente')).toBe(false);
  });

  it('treats cancelado and entregado as terminal sink states', () => {
    expect(canTransitionOrder('cancelado', 'pendiente')).toBe(false);
    expect(canTransitionOrder('cancelado', 'confirmado')).toBe(false);
    expect(canTransitionOrder('entregado', 'pendiente')).toBe(false);
    expect(canTransitionOrder('entregado', 'cancelado')).toBe(false);
  });

  it('rejects self transitions', () => {
    expect(canTransitionOrder('pendiente', 'pendiente')).toBe(false);
    expect(validateOrderTransition('pendiente', 'pendiente').valid).toBe(false);
  });
});
