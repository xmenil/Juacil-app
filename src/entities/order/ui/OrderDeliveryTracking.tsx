import { Check, Truck } from 'lucide-react';
import type { Order, OrderStatus } from '../model/types';
import { formatDateTime } from '@/shared/lib/date';
import styles from './OrderDeliveryTracking.module.css';

const steps: { status: OrderStatus; label: string }[] = [
  { status: 'pendiente', label: 'Pedido recibido' },
  { status: 'confirmado', label: 'Confirmado' },
  { status: 'preparado', label: 'Preparado para entrega' },
  { status: 'entregado', label: 'Entregado' },
];

export function OrderDeliveryTracking({ order }: { order: Order }) {
  if (order.deliveryType !== 'delivery') return null;
  const cancelled = order.status === 'cancelado';
  const currentIndex = steps.findIndex(step => step.status === order.status);
  return <section className={styles.tracking} aria-label={`Seguimiento del envío ${order.orderCode}`}>
    <h2 className={styles.title}><Truck size={18} aria-hidden="true" />Seguimiento del envío</h2>
    <p className={styles.help}>Estado registrado por la tienda en este prototipo. La fecha y el transporte se coordinan con la tienda.</p>
    {cancelled ? <p className={styles.cancelled}>Pedido cancelado. El envío no continuará.</p> : <ol className={styles.steps}>
      {steps.map((step, index) => {
        const entry = order.statusHistory.find(item => item.status === step.status);
        const reached = index <= currentIndex;
        return <li key={step.status} className={`${styles.step} ${reached ? styles.reached : ''}`} aria-current={index === currentIndex ? 'step' : undefined}>
          <span className={styles.marker} aria-hidden="true">{reached ? <Check size={14} /> : index + 1}</span>
          <div><strong>{step.label}</strong><span>{index === currentIndex ? 'Estado actual' : reached ? 'Completado' : 'Pendiente'}{entry && <> · <time dateTime={entry.timestamp}>{formatDateTime(entry.timestamp)}</time></>}</span></div>
        </li>;
      })}
    </ol>}
    {order.deliveryAddress && <p className={styles.address}><strong>Dirección de entrega:</strong> {order.deliveryAddress}</p>}
  </section>;
}
