import { z } from 'zod';
import type { Cart } from '@/entities/cart/model/types';
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

export function reviewCheckoutCart(cart: Cart) {
  const business = cart.businessId ? LocalStoreRepository.getBusinessById(cart.businessId) : undefined;
  let issue: string | null = !business ? 'La tienda ya no está disponible. Revisa tu carrito.'
    : business.status && business.status !== 'active' ? 'La tienda no está activa para recibir pedidos. Revisa tu carrito.'
    : !cart.items.length ? 'Tu carrito está vacío.' : null;
  const ids = new Set<string>();
  const items = cart.items.map(item => {
    const product = LocalStoreRepository.getProductById(item.productId);
    if (!issue) {
      if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0 || ids.has(item.productId)) issue = 'Hay una cantidad o un producto inválido. Revisa tu carrito.';
      else if (!product || product.status !== 'published' || product.businessId !== cart.businessId) issue = `«${item.product.name}» ya no está disponible para este pedido. Revisa tu carrito.`;
      else if (product.stock < item.quantity) issue = `Solo quedan ${product.stock} unidades de «${product.name}». Ajusta la cantidad en tu carrito.`;
    }
    ids.add(item.productId);
    const unitPriceCents = product?.priceCents ?? item.unitPriceCents;
    return { productId: item.productId, name: product?.name || item.product.name, imageUrl: product?.imageUrl || item.product.imageUrl,
      quantity: item.quantity, unitPriceCents, subtotalCents: unitPriceCents * item.quantity,
      priceChanged: unitPriceCents !== item.unitPriceCents };
  });
  const totalCents = items.reduce((sum, item) => sum + item.subtotalCents, 0);
  if (!Number.isSafeInteger(totalCents) || totalCents < 0) issue = 'No se pudo calcular el importe. Revisa tu carrito.';
  return { business, items, totalCents, issue, pricesChanged: items.some(item => item.priceChanged),
    signature: JSON.stringify([cart.businessId, ...items.map(item => [item.productId, item.quantity, item.unitPriceCents])]) };
}
export type CheckoutReview = ReturnType<typeof reviewCheckoutCart>;
