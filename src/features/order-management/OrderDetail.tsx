import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Package, CheckCircle2, Truck, ClipboardList } from 'lucide-react';
import { Order, OrderStatus } from '@/entities/order/model/types';
import { ORDER_STATUS_LABELS, canTransitionOrder } from '@/entities/order/model/orderStateMachine';
import { OrderStatusBadge } from '@/entities/order/ui/OrderStatusBadge';
import { formatMoney } from '@/shared/lib/money';
import { formatDateTime } from '@/shared/lib/date';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { Alert } from '@/shared/ui/Alert';
import buttonStyles from '@/shared/ui/Button.module.css';
import styles from './Orders.module.css';

interface OrderDetailProps {
  order: Order;
  backTo: string;
  whatsappUrl: string;
  feedback: { type: 'success' | 'danger'; message: string } | null;
  onAdvance: (status: OrderStatus) => void;
  onCancel: () => boolean;
}

const nextSteps = [
  { from: 'pendiente', to: 'confirmado', label: 'Confirmar pedido', icon: CheckCircle2, description: 'Revisa los productos solicitados y confirma su disponibilidad.' },
  { from: 'confirmado', to: 'preparado', label: 'Marcar como preparado', icon: Package, description: 'Marca el pedido como preparado cuando los productos estén listos para entregar.' },
  { from: 'preparado', to: 'entregado', label: 'Marcar como entregado', icon: Truck, description: 'Marca el pedido como entregado después de que tu cliente lo reciba.' },
] as const;

const SnapshotImage: React.FC<{ src: string }> = ({ src }) => {
  const [failed, setFailed] = useState(false);
  return src && !failed
    ? <img className={styles.productImage} src={src} alt="" onError={() => setFailed(true)} />
    : <span className={styles.imageFallback} role="img" aria-label="Producto sin foto"><Package size={22} aria-hidden="true" /></span>;
};

export const OrderNotFound: React.FC<{ backTo: string }> = ({ backTo }) => (
  <div className={styles.page}><div className="container">
    <section className={styles.emptyState}>
      <ClipboardList size={28} aria-hidden="true" /><h1>No encontramos este pedido</h1>
      <p>Vuelve a la lista para revisar los pedidos disponibles.</p>
      <Link to={backTo} className={styles.textLink}><ArrowLeft size={16} aria-hidden="true" />Volver a pedidos</Link>
    </section>
  </div></div>
);

export const OrderDetail: React.FC<OrderDetailProps> = ({ order, backTo, whatsappUrl, feedback, onAdvance, onCancel }) => {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelAttempted, setCancelAttempted] = useState(false);
  const nextStep = nextSteps.find(step => step.from === order.status && canTransitionOrder(order.status, step.to));
  const StepIcon = nextStep?.icon;
  const canCancel = canTransitionOrder(order.status, 'cancelado');
  const cancel = () => { setCancelAttempted(true); if (onCancel()) setIsCancelModalOpen(false); };

  return (
    <div className={styles.page}><div className="container">
      <Link to={backTo} className={styles.backLink}><ArrowLeft size={16} aria-hidden="true" />Volver a pedidos</Link>
      <header className={styles.detailHeader}>
        <div><p className={styles.eyebrow}>Detalle del pedido</p><h1>{order.orderCode}</h1><time dateTime={order.createdAt}>{formatDateTime(order.createdAt)}</time></div>
        <OrderStatusBadge status={order.status} />
      </header>
      {feedback && !isCancelModalOpen && <Alert variant={feedback.type} className={styles.feedback}>{feedback.message}</Alert>}
      <div className={styles.detailGrid}>
        <section className={styles.nextStep} aria-labelledby="next-step-title">
          <h2 id="next-step-title">{nextStep ? 'Siguiente paso' : 'Pedido finalizado'}</h2>
          <p>{nextStep?.description || (order.status === 'entregado' ? 'Este pedido fue entregado. No requiere más cambios de estado.' : 'Este pedido fue cancelado. Las unidades reservadas volvieron al stock.')}</p>
          <dl className={styles.actionTotal}><dt>Total del pedido</dt><dd>{formatMoney(order.totalCents)}</dd></dl>
          {nextStep && <Button key={nextStep.to} variant="accent" className={styles.primaryAction}
            leftIcon={StepIcon ? <StepIcon size={18} /> : undefined} onClick={() => onAdvance(nextStep.to)}>{nextStep.label}</Button>}
          {canCancel && <Button variant="ghost" className={styles.cancelAction} onClick={() => { setCancelAttempted(false); setIsCancelModalOpen(true); }}>Cancelar pedido</Button>}
        </section>

        <section className={styles.contactSection} aria-labelledby="customer-title">
          <h2 id="customer-title">Cliente y entrega</h2>
          <dl className={styles.contactDetails}>
            <div><dt>Cliente</dt><dd>{order.customerName}</dd></div>
            <div><dt>WhatsApp</dt><dd>{order.customerPhone}</dd></div>
            <div><dt>Modalidad</dt><dd>{order.deliveryType === 'pickup' ? 'Recojo en tienda' : 'Entrega a domicilio'}</dd></div>
            {order.deliveryType === 'delivery' && <div><dt>Dirección</dt><dd>{order.deliveryAddress || 'Coordina la dirección con tu cliente.'}</dd></div>}
          </dl>
          {order.notes && <div className={styles.customerNote}><strong>Nota del cliente</strong><p>{order.notes}</p></div>}
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            className={`${buttonStyles.button} ${buttonStyles.md} ${buttonStyles.outline} ${styles.whatsappLink}`}>
            <MessageCircle size={17} aria-hidden="true" />Abrir WhatsApp<span className="sr-only"> (se abre en otra pestaña)</span>
          </a>
          <p className={styles.helperText}>Se abrirá WhatsApp con el mensaje preparado. Tú decides cuándo enviarlo.</p>
        </section>

        <section className={styles.productsSection} aria-labelledby="products-title">
          <h2 id="products-title">Productos del pedido</h2>
          <ul className={styles.productList}>
            {order.items.map((item, index) => (
              <li key={item.productId + '-' + index} className={styles.productRow}>
                <SnapshotImage src={item.productImageUrl} />
                <div className={styles.productDescription}><strong>{item.productName}</strong><span>{item.quantity} {item.quantity === 1 ? 'unidad' : 'unidades'} × {formatMoney(item.unitPriceCents)}</span></div>
                <strong className={styles.productSubtotal}>{formatMoney(item.subtotalCents)}</strong>
              </li>
            ))}
          </ul>
          <div className={styles.orderTotal}><span>Total del pedido</span><strong>{formatMoney(order.totalCents)}</strong></div>
        </section>

        <section className={styles.historySection} aria-labelledby="history-title">
          <h2 id="history-title">Historial del pedido</h2>
          {order.statusHistory.length > 0 ? (
            <ol className={styles.history}>
              {order.statusHistory.map((entry, index) => (
                <li key={index}><span className={styles.historyDot} aria-hidden="true" /><div><strong>{ORDER_STATUS_LABELS[entry.status]}</strong>
                  <time dateTime={entry.timestamp}>{formatDateTime(entry.timestamp)}</time>{entry.note && <p>{entry.note}</p>}</div></li>
              ))}
            </ol>
          ) : <p className={styles.helperText}>Todavía no hay cambios registrados en este pedido.</p>}
        </section>
      </div>
      <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title="¿Cancelar este pedido?"
        footer={<><Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>Volver al pedido</Button><Button variant="danger" onClick={cancel}>Cancelar pedido</Button></>}>
        <p>Al cancelar el pedido <strong>{order.orderCode}</strong>, las unidades reservadas vuelven al stock. El pedido ya no podrá confirmarse ni prepararse.</p>
        {cancelAttempted && feedback?.type === 'danger' && <Alert variant="danger" className={styles.modalFeedback}>{feedback.message}</Alert>}
      </Modal>
    </div></div>
  );
};
