import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { formatMoney } from '@/shared/lib/money';
import { ROUTES } from '@/shared/config/routes';
import type { CheckoutReview } from './checkoutModel';
import styles from './CheckoutPage.module.css';

function SummaryItem({ item }: { item: CheckoutReview['items'][number] }) {
  const [failed, setFailed] = useState(false);
  return <li className={styles.summaryItem}>
    <div className={styles.thumb}>{item.imageUrl && !failed ? <img src={item.imageUrl} alt="" onError={() => setFailed(true)} /> : <Package size={22} aria-hidden="true" />}</div>
    <div><span>{item.name}</span><small>{item.quantity} × {formatMoney(item.unitPriceCents)}</small></div>
    <strong>{formatMoney(item.subtotalCents)}</strong>
  </li>;
}

export function CheckoutSummary({ review, deliveryType, isSubmitting, isOnline }: {
  review: CheckoutReview; deliveryType: 'pickup' | 'delivery'; isSubmitting: boolean; isOnline: boolean;
}) {
  return <aside className={styles.summary} aria-label="Resumen del pedido">
    <div className={styles.summaryHeader}><h2>Tu pedido</h2>{!isSubmitting && <Link to={ROUTES.CART}>Editar carrito</Link>}</div>
    <p className={styles.businessName}>{review.business?.name || 'Tienda no disponible'}<span>{review.business?.location}</span></p>
    <ul className={styles.summaryItems} aria-label="Productos a confirmar">{review.items.map(item => <SummaryItem key={item.productId} item={item} />)}</ul>
    {review.pricesChanged && <p className={styles.warning}>Hay precios actualizados desde que agregaste los productos. El resumen muestra los importes vigentes.</p>}
    <div className={styles.total}><span>Total de productos</span><strong>{formatMoney(review.totalCents)}</strong></div>
    <p className={styles.summaryNote}>{deliveryType === 'delivery' ? 'El costo y el horario de entrega se coordinan con la tienda. El envío no está incluido en este importe.' : 'El horario y el punto de recojo se coordinan con la tienda.'}</p>
    <p className={styles.demoNote}>Registrarás un pedido de demostración. El pago se acuerda con el vendedor; aquí no se realiza ningún cobro.</p>
    <Button type="submit" fullWidth size="lg" className={styles.submit} isLoading={isSubmitting} disabled={!isOnline || !!review.issue || isSubmitting} rightIcon={<ArrowRight size={18} />}>{isSubmitting ? 'Registrando pedido…' : 'Registrar mi pedido'}</Button>
  </aside>;
}
