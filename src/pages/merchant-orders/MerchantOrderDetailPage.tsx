import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSession } from '@/app/providers/SessionProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { formatMoney } from '@/shared/lib/money';
import { formatDateTime } from '@/shared/lib/date';
import { createWhatsAppLink } from '@/shared/lib/whatsapp';
import { OrderStatus } from '@/entities/order/model/types';
import { ORDER_STATUS_LABELS } from '@/entities/order/model/orderStateMachine';
import { ROUTES } from '@/shared/config/routes';
import { OrderStatusBadge } from '@/entities/order/ui/OrderStatusBadge';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { Alert } from '@/shared/ui/Alert';
import {
  ArrowLeft,
  User,
  MessageCircle,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  XCircle,
} from 'lucide-react';

export const MerchantOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isMerchant, businessId } = useSession();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  const order = id ? LocalStoreRepository.getOrderById(id) : undefined;

  // Verificación estricta de propiedad (P06): Aislamiento MYPE
  if (!isMerchant || !businessId || (order && order.businessId !== businessId)) {
    navigate(ROUTES.FORBIDDEN);
    return null;
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '64px 16px', textAlign: 'center' }}>
        <h2>Pedido no encontrado</h2>
        <Button variant="primary" onClick={() => navigate(ROUTES.MERCHANT_ORDERS)}>
          Volver a Pedidos
        </Button>
      </div>
    );
  }

  const handleAdvanceStatus = (target: OrderStatus, note: string) => {
    setFeedback(null);
    const res = LocalStoreRepository.updateOrderStatus(order.id, target, note);
    if (res.success) {
      setFeedback({
        type: 'success',
        message: `Estado actualizado a "${ORDER_STATUS_LABELS[target]}" exitosamente.`,
      });
    } else {
      setFeedback({
        type: 'danger',
        message: res.error || 'No se pudo actualizar el estado.',
      });
    }
  };

  const handleCancel = () => {
    const res = LocalStoreRepository.cancelOrder(order.id, 'Cancelado por el emprendimiento.');
    if (res.success) {
      setFeedback({
        type: 'success',
        message: 'El pedido fue cancelado y el stock se devolvió al inventario.',
      });
      setIsCancelModalOpen(false);
    } else {
      setFeedback({
        type: 'danger',
        message: res.error || 'No se pudo cancelar el pedido.',
      });
    }
  };

  const waCustomerMessage = `¡Hola ${order.customerName}! Te escribimos de *${order.businessName}* respecto a tu pedido *${order.orderCode}* en JUÁCIL. Actualmente su estado es *${ORDER_STATUS_LABELS[order.status]}*.`;
  const waCustomerLink = createWhatsAppLink(order.customerPhone, waCustomerMessage);

  return (
    <div style={{ padding: '32px 0 64px' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        <Link
          to={ROUTES.MERCHANT_ORDERS}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, marginBottom: '24px' }}
        >
          <ArrowLeft size={16} /> Volver a Pedidos Recibidos
        </Link>

        {feedback && (
          <div style={{ marginBottom: '20px' }}>
            <Alert variant={feedback.type}>{feedback.message}</Alert>
          </div>
        )}

        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* Cabecera */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              borderBottom: '1px solid var(--color-border-subtle)',
              paddingBottom: '16px',
            }}
          >
            <div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-subtle)' }}>GESTIÓN DE PEDIDO</span>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary-950)' }}>
                {order.orderCode}
              </h1>
            </div>

            <OrderStatusBadge status={order.status} />
          </div>

          {/* Acciones de la Máquina de Estados */}
          <div
            style={{
              backgroundColor: 'var(--color-surface-subtle)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid var(--color-border)',
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>
              Transición de Ciclo de Vida:
            </h3>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {order.status === 'pendiente' && (
                <>
                  <Button
                    variant="accent"
                    leftIcon={<CheckCircle2 size={16} />}
                    onClick={() => handleAdvanceStatus('confirmado', 'Disponibilidad y stock confirmados por la MYPE.')}
                  >
                    Confirmar Pedido
                  </Button>
                  <Button
                    variant="outline"
                    style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                    leftIcon={<XCircle size={16} />}
                    onClick={() => setIsCancelModalOpen(true)}
                  >
                    Rechazar / Cancelar
                  </Button>
                </>
              )}

              {order.status === 'confirmado' && (
                <>
                  <Button
                    variant="primary"
                    leftIcon={<Package size={16} />}
                    onClick={() => handleAdvanceStatus('preparado', 'Empaque y productos listos en tienda.')}
                  >
                    Marcar como Preparado
                  </Button>
                  <Button
                    variant="outline"
                    style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                    leftIcon={<XCircle size={16} />}
                    onClick={() => setIsCancelModalOpen(true)}
                  >
                    Cancelar Pedido
                  </Button>
                </>
              )}

              {order.status === 'preparado' && (
                <Button
                  variant="primary"
                  leftIcon={<Truck size={16} />}
                  onClick={() => handleAdvanceStatus('entregado', 'Entrega finalizada con éxito.')}
                >
                  Marcar como Entregado al Cliente
                </Button>
              )}

              {(order.status === 'entregado' || order.status === 'cancelado') && (
                <span style={{ fontSize: '13px', color: 'var(--color-text-subtle)' }}>
                  Este pedido se encuentra en estado final (no admite más transiciones).
                </span>
              )}
            </div>
          </div>

          {/* Información del Cliente */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              borderBottom: '1px solid var(--color-border-subtle)',
              paddingBottom: '16px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: 700 }}>
                <User size={16} color="var(--color-primary-800)" />
                <span>Cliente: {order.customerName}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                WhatsApp: <strong>{order.customerPhone}</strong>
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                Modalidad: <strong>{order.deliveryType === 'pickup' ? 'Recojo en tienda' : `Envío: ${order.deliveryAddress || 'Dirección referencial'}`}</strong>
              </p>
              {order.notes && (
                <p style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
                  Nota del comprador: "{order.notes}"
                </p>
              )}
            </div>

            <a href={waCustomerLink} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="accent" leftIcon={<MessageCircle size={15} color="#062413" />}>
                Contactar al Cliente por WhatsApp
              </Button>
            </a>
          </div>

          {/* Snapshot de Productos */}
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
              Productos Solicitados:
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {order.items.map((it, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={it.productImageUrl}
                      alt=""
                      style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover' }}
                    />
                    <div>
                      <strong style={{ fontSize: '14px', display: 'block' }}>{it.productName}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {it.quantity} unids. x {formatMoney(it.unitPriceCents)}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary-900)' }}>
                    {formatMoney(it.subtotalCents)}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '18px',
                fontWeight: 800,
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid var(--color-border-subtle)',
              }}
            >
              <span>Total del Pedido:</span>
              <span>{formatMoney(order.totalCents)}</span>
            </div>
          </div>

          {/* Historial */}
          <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} /> Historial de Cambios de Estado
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {order.statusHistory.map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                  <span style={{ color: 'var(--color-text-subtle)', minWidth: '130px' }}>
                    {formatDateTime(h.timestamp)}
                  </span>
                  <div>
                    <strong style={{ textTransform: 'capitalize' }}>{h.status}:</strong>{' '}
                    <span>{h.note || ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="¿Confirmas la cancelación del pedido?"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>
              No, volver
            </Button>
            <Button variant="danger" onClick={handleCancel}>
              Sí, cancelar y restaurar stock
            </Button>
          </>
        }
      >
        <p>
          Al cancelar la orden {order.orderCode}, las unidades reservadas se reintegrarán
          inmediatamente a tu catálogo disponible.
        </p>
      </Modal>
    </div>
  );
};
