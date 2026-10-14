import type { Cart } from '@/entities/cart/model/types';
import { LocalStoreRepository } from '@/shared/lib/storage';

export function getCartIssue(cart: Cart): string | null {
  for (const item of cart.items) {
    const product = LocalStoreRepository.getProductById(item.productId);
    if (!product || product.status !== 'published') return `«${item.product.name}» ya no está disponible. Retíralo para continuar.`;
    if (item.quantity > product.stock) return product.stock === 0
      ? `«${item.product.name}» está agotado. Retíralo para continuar.`
      : `Solo quedan ${product.stock} unidades de «${item.product.name}». Ajusta la cantidad para continuar.`;
  }
  return null;
}
