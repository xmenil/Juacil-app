/**
 * Generador de enlaces estructurados a WhatsApp
 * Simula la coordinación de venta directa entre clientes y MYPES de la Selva
 */

export function sanitizePeruvianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('51') && digits.length === 11) {
    return digits;
  }
  if (digits.length === 9) {
    return `51${digits}`;
  }
  return digits || '51999999999';
}

export function createWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = sanitizePeruvianPhone(phone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export interface OrderWhatsAppDetails {
  orderCode: string;
  customerName: string;
  businessName: string;
  items: Array<{ name: string; quantity: number; subtotalFormatted: string }>;
  totalFormatted: string;
  deliveryType: string;
  deliveryAddress?: string;
}

export function buildOrderWhatsAppMessage(details: OrderWhatsAppDetails): string {
  let msg = `¡Hola *${details.businessName}*! 👋\n`;
  msg += `Vengo desde la plataforma *JUÁCIL* (Tu tienda online).\n\n`;
  msg += `📦 *Pedido:* ${details.orderCode}\n`;
  msg += `👤 *Cliente:* ${details.customerName}\n`;
  msg += `🚚 *Modalidad:* ${details.deliveryType === 'pickup' ? 'Recojo en tienda' : 'Coordinar envío'}\n`;
  if (details.deliveryAddress) {
    msg += `📍 *Dirección/Zona:* ${details.deliveryAddress}\n`;
  }
  msg += `\n*Detalle de productos:*\n`;
  details.items.forEach((item) => {
    msg += `• ${item.quantity}x ${item.name} (${item.subtotalFormatted})\n`;
  });
  msg += `\n💰 *Total a coordinar:* ${details.totalFormatted}\n\n`;
  msg += `¿Podemos coordinar el pago (Yape/Plin/Transferencia) y la entrega? ¡Muchas gracias!`;
  return msg;
}
