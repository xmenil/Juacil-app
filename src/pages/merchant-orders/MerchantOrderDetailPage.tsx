import React, { useState } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { useSession } from '@/app/providers/SessionProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { createWhatsAppLink } from '@/shared/lib/whatsapp';
import { OrderStatus } from '@/entities/order/model/types';
import { ORDER_STATUS_LABELS } from '@/entities/order/model/orderStateMachine';
import { ROUTES } from '@/shared/config/routes';
import { OrderDetail, OrderNotFound } from '@/features/order-management/OrderDetail';
import { getOrderFilter } from '@/features/order-management/orderFilters';

const statusNotes: Record<OrderStatus, string> = {
  confirmado: 'Disponibilidad y stock confirmados por la MYPE.',
  preparado: 'Empaque y productos listos en tienda.',
  entregado: 'Entrega finalizada con éxito.',
  pendiente: '',
  cancelado: '',
};

export const MerchantOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isMerchant, businessId } = useSession();
  const [searchParams] = useSearchParams();
  const [feedback, setFeedback] = useState<{ orderId: string; type: 'success' | 'danger'; message: string } | null>(null);
  const order = id ? LocalStoreRepository.getOrderById(id) : undefined;
  const backTo = `${ROUTES.MERCHANT_ORDERS}?filtro=${getOrderFilter(searchParams.get('filtro'))}`;

  if (!isMerchant || !businessId || (order && order.businessId !== businessId)) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }
  if (!order) return <OrderNotFound backTo={backTo} />;

  const handleAdvanceStatus = (target: OrderStatus) => {
    setFeedback(null);
    const res = LocalStoreRepository.updateOrderStatus(order.id, target, statusNotes[target]);
    setFeedback(res.success ? {
      orderId: order.id, type: 'success',
      message: target === 'confirmado' ? 'Pedido confirmado.' : target === 'preparado' ? 'Pedido preparado.' : 'Pedido entregado.',
    } : { orderId: order.id, type: 'danger', message: res.error || 'No pudimos actualizar el pedido. Intenta nuevamente.' });
  };

  const handleCancel = () => {
    const res = LocalStoreRepository.cancelOrder(order.id, 'Cancelado por el emprendimiento.');
    setFeedback(res.success ? {
      orderId: order.id, type: 'success', message: 'Pedido cancelado. Las unidades reservadas volvieron al stock.',
    } : { orderId: order.id, type: 'danger', message: res.error || 'No pudimos cancelar el pedido. Intenta nuevamente.' });
    return res.success;
  };

  const waCustomerMessage = `¡Hola ${order.customerName}! Te escribimos de *${order.businessName}* respecto a tu pedido *${order.orderCode}* en JUÁCIL. Actualmente su estado es *${ORDER_STATUS_LABELS[order.status]}*.`;
  const waCustomerLink = createWhatsAppLink(order.customerPhone, waCustomerMessage);

  return <OrderDetail key={order.id} order={order} backTo={backTo} whatsappUrl={waCustomerLink}
    feedback={feedback?.orderId === order.id ? feedback : null} onAdvance={handleAdvanceStatus} onCancel={handleCancel} />;
};
