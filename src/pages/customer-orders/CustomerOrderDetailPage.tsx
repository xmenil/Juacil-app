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
import styles from './CustomerOrderDetailPage.module.css';
import buttonStyles from '@/shared/ui/Button.module.css';
import { Package } from 'lucide-react';
import {
  ArrowLeft,
  Store,
  MessageCircle,
  Truck,
  XCircle,
  Clock,
} from 'lucide-react';

export const CustomerOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useSession();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const order = id ? LocalStoreRepository.getOrderById(id) : undefined;

  if (!order) {
    return (
      <div className="container" style={{ padding: '64px 16px', textAlign: 'center' }}>
        <h2>No encontramos este pedido</h2>
        <p style={{ color: 'var(--color-text-muted)', margin: '16px 0' }}>
          Vuelve a mis pedidos para consultar tus compras.
        </p>
        <Button variant="primary" onClick={() => navigate(ROUTES.CUSTOMER_ORDERS)}>
          Volver a mis pedidos
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
      setCancelError(null);
      setCancelFeedback('Las unidades volvieron al stock de la tienda.');
      setIsCancelModalOpen(false);
    } else {
      setCancelError(res.error || 'No pudimos cancelar el pedido. Inténtalo nuevamente.');
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
    <div className={styles.page}>
      <div className={`container ${styles.container}`}>
        <Link
          to={ROUTES.CUSTOMER_ORDERS}
          className={styles.backLink}
        >
          <ArrowLeft size={16} aria-hidden="true" /> Volver a mis pedidos
        </Link>

        {cancelFeedback && (
          <div className={styles.feedback}>
            <Alert variant="success" title="Pedido cancelado">{cancelFeedback}</Alert>
          </div>
        )}

        <div className={styles.content}>
          {/* Cabecera */}
          <header className={styles.header}>
            <div className={styles.headingRow}>
              <h1 className={styles.title}>Pedido {order.orderCode}</h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className={styles.date}>
              Fecha del pedido: <time dateTime={order.createdAt}>{formatDateTime(order.createdAt)}</time>
            </p>
            <p className={styles.nextStep}>
              {{
                pendiente: 'La tienda aún debe confirmar tu pedido.',
                confirmado: 'La tienda confirmó tu pedido. Puedes coordinar la entrega o el recojo.',
                preparado: 'Tu pedido está preparado. Coordina la entrega o el recojo con la tienda.',
                entregado: 'Tu pedido figura como entregado.',
                cancelado: 'Este pedido está cancelado.',
              }[order.status]}
            </p>
          </header>

          {/* Información de la MYPE */}
          <section className={styles.coordination} aria-labelledby="order-store">
            <div className={styles.storeInfo}>
              <h2 id="order-store" className={styles.sectionTitle}>
                <Store size={16} aria-hidden="true" /> {order.businessName}
              </h2>
              <h3 className={styles.deliveryTitle}><Truck size={16} aria-hidden="true" /> Entrega o recojo</h3>
              <p className={styles.bodyText}>
                {order.deliveryType === 'pickup'
                  ? `Recojo en ${order.businessName}. Coordina el horario con la tienda.`
                  : order.deliveryAddress
                    ? `Entrega a domicilio: ${order.deliveryAddress}.`
                    : 'Coordina la dirección de entrega con la tienda.'}
              </p>
              {order.notes && <p className={styles.bodyText}><strong>Nota:</strong> {order.notes}</p>}
            </div>
            <div className={styles.contact}>
              {business ? (
                <>
                  <a href={waLink} target="_blank" rel="noopener noreferrer"
                    className={`${buttonStyles.button} ${buttonStyles.md} ${order.status === 'entregado' || order.status === 'cancelado' ? buttonStyles.outline : buttonStyles.accent} ${styles.contactLink}`}>
                    <MessageCircle size={16} aria-hidden="true" /> Coordinar por WhatsApp
                  </a>
                  <p className={styles.contactHelp}>Se abrirá WhatsApp con los datos de tu pedido. Tú decides cuándo enviar el mensaje.</p>
                </>
              ) : <Alert variant="warning">La información de contacto de esta tienda no está disponible.</Alert>}
            </div>
          </section>

          {/* Lista de Productos Snapshot */}
          <section aria-labelledby="order-products" className={styles.products}>
            <h2 id="order-products" className={styles.sectionTitle}>Productos del pedido</h2>

            <div className={styles.productList}>
              {order.items.length === 0 && <Alert variant="info">No hay productos registrados en este pedido.</Alert>}
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className={styles.productRow}
                >
                  <div className={styles.productInfo}>
                    <span className={styles.imageFrame} aria-hidden="true">
                      <Package size={24} />
                      <img
                      src={item.productImageUrl}
                      alt=""
                      className={styles.productImage}
                      onError={(event) => { event.currentTarget.hidden = true; }}
                      />
                    </span>
                    <div>
                      <strong className={styles.productName}>{item.productName}</strong>
                      <span className={styles.quantity}>
                        {item.quantity} × {formatMoney(item.unitPriceCents)}
                      </span>
                    </div>
                  </div>

                  <span className={styles.subtotal}>
                    {formatMoney(item.subtotalCents)}
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.total}>
              <span>Total del pedido</span>
              <span>{formatMoney(order.totalCents)}</span>
            </div>
          </section>

          {/* Historial de Estados */}
          <section className={styles.history} aria-labelledby="order-history">
            <h2 id="order-history" className={styles.sectionTitle}>
              <Clock size={16} aria-hidden="true" /> Historial del pedido
            </h2>
            {order.statusHistory.length === 0 ? (
              <p className={styles.bodyText}>No hay movimientos registrados.</p>
            ) : <ol className={styles.historyList}>
              {order.statusHistory.map((h, i) => (
                <li key={i} className={styles.historyItem}>
                  <time className={styles.historyDate} dateTime={h.timestamp}>
                    {formatDateTime(h.timestamp)}
                  </time>
                  <div className={styles.historyEntry}>
                    <OrderStatusBadge status={h.status} />
                    {h.note && <p className={styles.bodyText}>{h.note}</p>}
                  </div>
                </li>
              ))}
            </ol>}
          </section>

          {/* Botón de Cancelación */}
          {canCancel && (
            <section className={styles.cancellation} aria-labelledby="order-cancel">
              <div>
                <h2 id="order-cancel" className={styles.sectionTitle}>Cancelar pedido</h2>
                <p className={styles.bodyText}>Puedes cancelar mientras el pedido esté pendiente o confirmado.</p>
              </div>
              <Button
                variant="outline"
                className={styles.cancelButton}
                leftIcon={<XCircle size={16} />}
                onClick={() => { setCancelError(null); setIsCancelModalOpen(true); }}
              >
                Cancelar pedido
              </Button>
            </section>
          )}
        </div>
      </div>

      {/* Modal de Cancelación */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title={`¿Cancelar el pedido ${order.orderCode}?`}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>
              Mantener pedido
            </Button>
            <Button variant="danger" onClick={handleCancelOrder}>
              Sí, cancelar pedido
            </Button>
          </>
        }
      >
        <p>
          El pedido quedará <strong>cancelado</strong> y las unidades volverán al stock de {order.businessName}.
        </p>
        {cancelError && <div className={styles.modalError}><Alert variant="danger" title="No se pudo cancelar">{cancelError}</Alert></div>}
      </Modal>
    </div>
  );
};
