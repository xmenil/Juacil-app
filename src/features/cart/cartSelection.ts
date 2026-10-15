import type { Cart } from '@/entities/cart/model/types';

export function selectCartItems(cart: Cart, productIds: string[] | null): Cart {
  const items = productIds === null ? cart.items : cart.items.filter(item => productIds.includes(item.productId));
  const businessIds = new Set(items.map(item => item.product.businessId));
  return { ...cart, items, businessId: businessIds.size === 1 ? items[0].product.businessId : null,
    businessName: businessIds.size === 1 ? cart.businessName : null,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    totalCents: items.reduce((sum, item) => sum + item.subtotalCents, 0) };
}
