import { describe, it, expect } from 'vitest';
import {
  centsToDecimal,
  decimalToCents,
  formatMoney,
  sumCents,
  calculateTax,
} from '@/shared/lib/money';

describe('Money Domain Logic (Integer Cents)', () => {
  it('converts integer cents to decimal string correctly', () => {
    expect(centsToDecimal(2500)).toBe('25.00');
    expect(centsToDecimal(1550)).toBe('15.50');
    expect(centsToDecimal(99)).toBe('0.99');
    expect(centsToDecimal(0)).toBe('0.00');
  });

  it('converts decimal string to integer cents correctly', () => {
    expect(decimalToCents('25.00')).toBe(2500);
    expect(decimalToCents('25')).toBe(2500);
    expect(decimalToCents('15.5')).toBe(1550);
    expect(decimalToCents('0.99')).toBe(99);
    expect(decimalToCents('0')).toBe(0);
  });

  it('formats PEN money string with currency symbol', () => {
    expect(formatMoney(2500)).toBe('S/ 25.00');
    expect(formatMoney(0)).toBe('S/ 0.00');
    expect(formatMoney(12050)).toBe('S/ 120.50');
  });

  it('sums cents accurately without floating point anomalies', () => {
    const prices = [1990, 2500, 3250]; // S/ 19.90, S/ 25.00, S/ 32.50
    expect(sumCents(prices)).toBe(7740);
  });

  it('calculates tax accurately using integer arithmetic', () => {
    // 18% IGV of 10000 cents (S/ 100.00) = 1800 cents (S/ 18.00)
    expect(calculateTax(10000, 0.18)).toBe(1800);
  });
});
