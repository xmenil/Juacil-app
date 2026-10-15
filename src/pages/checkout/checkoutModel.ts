import { z } from 'zod';
import type { Cart } from '@/entities/cart/model/types';
import type { Business } from '@/entities/business/model/types';
import { LocalStoreRepository } from '@/shared/lib/storage';

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(3, 'Ingresa tu nombre y apellidos (al menos 3 caracteres).'),
  customerPhone: z.string().trim().transform(value => value.replace(/[\s()+-]/g, ''))
    .transform(value => value.length === 11 && value.startsWith('51') ? value.slice(2) : value)
    .pipe(z.string().regex(/^9\d{8}$/, 'Ingresa un celular peruano de 9 dígitos.')),
  deliveryType: z.enum(['pickup', 'delivery']),
  deliveryAddress: z.string().trim(),
  notes: z.string().trim().max(500, 'Las notas pueden tener hasta 500 caracteres.'),
}).superRefine((values, context) => {
  if (values.deliveryType === 'delivery' && values.deliveryAddress.length < 5) {
    context.addIssue({ code: 'custom', path: ['deliveryAddress'], message: 'Indica la dirección y una referencia para coordinar la entrega.' });
  }
});
export type CheckoutValues = z.infer<typeof checkoutSchema>;

export interface CheckoutReviewItem {
  productId: string; name: string; imageUrl: string; quantity: number;
  unitPriceCents: number; subtotalCents: number; priceChanged: boolean;
}
export interface CheckoutStoreGroup {
  businessId: string; business?: Business; items: CheckoutReviewItem[]; totalCents: number;
}

/**
 * Revisa el carrito antes de registrar pedidos.
 * El carrito puede tener productos de varias tiendas: se registra un pedido por cada tienda.
 */
export function reviewCheckoutCart(cart: Cart) {
  let issue: string | null = !cart.items.length ? 'Tu carrito está vacío.' : null;
  const ids = new Set<string>();
  const groupMap = new Map<string, CheckoutStoreGroup>();
  const items = cart.items.map(item => {
    const product = LocalStoreRepository.getProductById(item.productId);
    const businessId = product?.businessId || item.product.businessId;
    let group = groupMap.get(businessId);
    if (!group) {
      const business = LocalStoreRepository.getBusinessById(businessId);
      if (!issue) {
        if (!business) issue = `La tienda de «${item.product.name}» ya no está disponible. Revisa tu carrito.`;
        else if (business.status && business.status !== 'active') issue = `«${business.name}» no está activa para recibir pedidos. Revisa tu carrito.`;
      }
      group = { businessId, business, items: [], totalCents: 0 };
      groupMap.set(businessId, group);
    }
    if (!issue) {
      if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0 || ids.has(item.productId)) issue = 'Hay una cantidad o un producto inválido. Revisa tu carrito.';
      else if (!product || product.status !== 'published') issue = `«${item.product.name}» ya no está disponible para este pedido. Revisa tu carrito.`;
      else if (product.stock < item.quantity) issue = `Solo quedan ${product.stock} unidades de «${product.name}». Ajusta la cantidad en tu carrito.`;
    }
    ids.add(item.productId);
    const unitPriceCents = product?.priceCents ?? item.unitPriceCents;
    const reviewItem: CheckoutReviewItem = { productId: item.productId, name: product?.name || item.product.name, imageUrl: product?.imageUrl || item.product.imageUrl,
      quantity: item.quantity, unitPriceCents, subtotalCents: unitPriceCents * item.quantity,
      priceChanged: unitPriceCents !== item.unitPriceCents };
    group.items.push(reviewItem);
    group.totalCents += reviewItem.subtotalCents;
    return reviewItem;
  });
  const groups = [...groupMap.values()];
  const totalCents = items.reduce((sum, item) => sum + item.subtotalCents, 0);
  if (!Number.isSafeInteger(totalCents) || totalCents < 0) issue = 'No se pudo calcular el importe. Revisa tu carrito.';
  return { groups, business: groups.length === 1 ? groups[0].business : undefined, items, totalCents, issue,
    pricesChanged: items.some(item => item.priceChanged),
    signature: JSON.stringify(items.map(item => [item.productId, item.quantity, item.unitPriceCents])) };
}
export type CheckoutReview = ReturnType<typeof reviewCheckoutCart>;
