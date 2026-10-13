import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStoreRepository } from '@/shared/lib/storage';

describe('LocalStoreRepository & Business Rules', () => {
  beforeEach(() => {
    localStorage.clear();
    LocalStoreRepository.resetToInitial();
  });

  it('initializes repository with Tingo María businesses and products', () => {
    const businesses = LocalStoreRepository.getBusinesses();
    const products = LocalStoreRepository.getProducts();

    expect(businesses.length).toBeGreaterThanOrEqual(4);
    expect(products.length).toBeGreaterThanOrEqual(10);

    // Verify businesses have Tingo María regional locations
    const locations = businesses.map((b) => b.location);
    expect(locations.some((loc) => loc.includes('Tingo María'))).toBe(true);
    expect(locations).toContain('Castillo Grande');
    expect(locations).toContain('Valle del Monzón');
  });

  it('decrements stock atomically when an order is placed', () => {
    const products = LocalStoreRepository.getProducts();
    const testProduct = products.find((p) => p.stock > 2);
    expect(testProduct).toBeDefined();

    if (!testProduct) return;

    const initialStock = testProduct.stock;
    const orderQuantity = 2;

    const result = LocalStoreRepository.createOrder({
      businessId: testProduct.businessId,
      customerId: 'user_lucia',
      customerName: 'Lucía Ramos',
      customerPhone: '962111222',
      deliveryType: 'pickup',
      items: [
        {
          productId: testProduct.id,
          quantity: orderQuantity,
        },
      ],
    });

    expect(result.success).toBe(true);

    const updatedProduct = LocalStoreRepository.getProductById(testProduct.id);
    expect(updatedProduct?.stock).toBe(initialStock - orderQuantity);
  });

  it('restores stock automatically when an order is cancelled', () => {
    const products = LocalStoreRepository.getProducts();
    const testProduct = products.find((p) => p.stock > 2);
    expect(testProduct).toBeDefined();

    if (!testProduct) return;

    const initialStock = testProduct.stock;
    const orderQuantity = 2;

    const createResult = LocalStoreRepository.createOrder({
      businessId: testProduct.businessId,
      customerId: 'user_lucia',
      customerName: 'Lucía Ramos',
      customerPhone: '962111222',
      deliveryType: 'pickup',
      items: [
        {
          productId: testProduct.id,
          quantity: orderQuantity,
        },
      ],
    });

    expect(createResult.success).toBe(true);
    if (!createResult.success) return;
    const orderId = createResult.order.id;

    // Verify stock was reduced
    let p = LocalStoreRepository.getProductById(testProduct.id);
    expect(p?.stock).toBe(initialStock - orderQuantity);

    // Cancel order
    const cancelResult = LocalStoreRepository.updateOrderStatus(orderId, 'cancelado', 'Cancelación por prueba');
    expect(cancelResult.success).toBe(true);

    // Verify stock is restored
    p = LocalStoreRepository.getProductById(testProduct.id);
    expect(p?.stock).toBe(initialStock);
  });
});
