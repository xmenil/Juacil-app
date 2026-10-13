import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSession } from '@/app/providers/SessionProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { formatMoney } from '@/shared/lib/money';
import { formatDateTime } from '@/shared/lib/date';
import { buildOrderWhatsAppMessage, createWhatsAppLink } from '@/shared/lib/whatsapp';
import { ROUTES } from '@/shared/config/routes';
import { OrderStatusBadge } from '@/entities/order/ui/OrderStatusBadge';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { Alert } from '@/shared/ui/Alert';
import {
  ArrowLeft,
  Store,
  MessageCircle,
  Truck,
  MapPin,
  Calendar,
  XCircle,
  Clock,
} from 'lucide-react';

export const CustomerOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useSession();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState<string | null>(null);

  const order = id ? LocalStoreRepository.getOrderById(id) : undefined;

  if (!order) {
    return (
      <div className="container" style={{ padding: '64px 16px', textAlign: 'center' }}>
        <h2>Pedido no encontrado</h2>
        <p style={{ color: 'var(--color-text-muted)', margin: '16px 0' }}>
          La orden indicada no existe en el sistema.
        </p>
        <Button variant="primary" onClick={() => navigate(ROUTES.CUSTOMER_ORDERS)}>
          Volver a Mis Pedidos
        </Button>
      </div>
    );
  }

  // Verificación estricta de propiedad (P06): Aislamiento de datos
  if (!currentUser || order.customerId !== currentUser.id) {
    // Si el usuario no es el dueño ni la tienda, denegar acceso
    navigate(ROUTES.FORBIDDEN);
    return null;
  }

  const business = LocalStoreRepository.getBusinessById(order.businessId);

  const handleCancelOrder = () => {
    const res = LocalStoreRepository.cancelOrder(order.id, 'Cancelado a solicitud del cliente.');
    if (res.success) {
      setCancelFeedback('El pedido fue cancelado y el stock ha sido devuelto al inventario de la tienda.');
      setIsCancelModalOpen(false);
    } else {
      setCancelFeedback(res.error || 'No se pudo cancelar el pedido.');
    }
  };

  const canCancel = order.status === 'pendiente' || order.status === 'confirmado';

  const waText = business
    ? buildOrderWhatsAppMessage({
        orderCode: order.orderCode,
        customerName: order.customerName,
        businessName: order.businessName,
        items: order.items.map((i) => ({
          name: i.productName,
          quantity: i.quantity,
          subtotalFormatted: formatMoney(i.subtotalCents),
        })),
        totalFormatted: formatMoney(order.totalCents),
        deliveryType: order.deliveryType,
        deliveryAddress: order.deliveryAddress,
      })
    : '';
  const waLink = business ? createWhatsAppLink(business.whatsapp, waText) : '#';

  return (
    <div style={{ padding: '32px 0 64px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <Link
          to={ROUTES.CUSTOMER_ORDERS}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, marginBottom: '24px' }}
        >
          <ArrowLeft size={16} /> Volver a Mis Pedidos
        </Link>

        {cancelFeedback && (
          <div style={{ marginBottom: '20px' }}>
            <Alert variant="info">{cancelFeedback}</Alert>
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
              <span style={{ fontSize: '12px', color: 'var(--color-text-subtle)' }}>DETALLE DEL PEDIDO</span>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary-950)' }}>
                {order.orderCode}
              </h1>
            </div>

            <OrderStatusBadge status={order.status} />
          </div>

          {/* Información de la MYPE */}
          <div
            style={{
              backgroundColor: 'var(--color-surface-subtle)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: 700 }}>
                <Store size={16} color="var(--color-primary-800)" />
                <span>{order.businessName}</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-subtle)' }}>
                Fecha del pedido: {formatDateTime(order.createdAt)}
              </span>
            </div>

            {business && (
              <a href={waLink} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="accent" leftIcon={<MessageCircle size={15} color="#062413" />}>
                  Coordinar por WhatsApp
                </Button>
              </a>
            )}
          </div>

          {/* Lista de Productos Snapshot */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
              Productos en esta Orden:
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {order.items.map((item, idx) => (
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
                      src={item.productImageUrl}
                      alt=""
                      style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }}
                    />
                    <div>
                      <strong style={{ fontSize: '14px', display: 'block' }}>{item.productName}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {item.quantity} x {formatMoney(item.unitPriceCents)}
                      </span>
                    </div>
                  </div>

                  <span style={{ fontWeight: 700, color: 'var(--color-primary-900)' }}>
                    {formatMoney(item.subtotalCents)}
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
              <span>Total de la Orden:</span>
              <span>{formatMoney(order.totalCents)}</span>
            </div>
          </div>

          {/* Datos de Entrega */}
          <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={16} /> Modalidad de Entrega
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
              {order.deliveryType === 'pickup'
                ? 'Recojo presencial en la tienda de la Selva.'
                : `Envío a domicilio: ${order.deliveryAddress || 'Dirección referencial coordinada.'}`}
            </p>
            {order.notes && (
              <p style={{ fontSize: '13px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
                Nota: "{order.notes}"
              </p>
            )}
          </div>

          {/* Historial de Estados */}
          <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} /> Línea de Tiempo del Pedido
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {order.statusHistory.map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
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

          {/* Botón de Cancelación */}
          {canCancel && (
            <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '16px' }}>
              <Button
                variant="outline"
                style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                leftIcon={<XCircle size={16} />}
                onClick={() => setIsCancelModalOpen(true)}
              >
                Cancelar este Pedido
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Cancelación */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="¿Deseas cancelar este pedido?"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>
              No, mantener pedido
            </Button>
            <Button variant="danger" onClick={handleCancelOrder}>
              Sí, cancelar pedido
            </Button>
          </>
        }
      >
        <p>
          Si cancelas este pedido, el estado cambiará a <strong>Cancelado</strong> y las unidades
          reservadas serán devueltas inmediatamente al inventario de {order.businessName}.
        </p>
      </Modal>
    </div>
  );
};
