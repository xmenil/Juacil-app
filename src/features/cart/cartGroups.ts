import type { Cart, CartItem } from '@/entities/cart/model/types';
import type { Business } from '@/entities/business/model/types';
import { LocalStoreRepository } from '@/shared/lib/storage';

export interface CartStoreGroup {
  businessId: string;
  businessName: string;
  business?: Business;
  items: CartItem[];
  itemCount: number;
  totalCents: number;
}

/** Agrupa los productos del carrito por tienda, conservando el orden en que se agregaron. */
export function groupCartByBusiness(cart: Cart): CartStoreGroup[] {
  const groups = new Map<string, CartStoreGroup>();
  for (const item of cart.items) {
    const businessId = item.product.businessId;
    let group = groups.get(businessId);
    if (!group) {
      const business = LocalStoreRepository.getBusinessById(businessId);
      group = { businessId, businessName: business?.name || 'Tienda aliada', business, items: [], itemCount: 0, totalCents: 0 };
      groups.set(businessId, group);
    }
    group.items.push(item);
    group.itemCount += item.quantity;
    group.totalCents += item.subtotalCents;
  }
  return [...groups.values()];
}
