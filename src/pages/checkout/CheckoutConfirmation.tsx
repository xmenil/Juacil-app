import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Check, MessageCircle, ArrowRight } from 'lucide-react';
import type { Order } from '@/entities/order/model/types';
import { formatMoney } from '@/shared/lib/money';
import { ROUTES } from '@/shared/config/routes';
import { buildOrderWhatsAppMessage, createWhatsAppLink } from '@/shared/lib/whatsapp';
import styles from './CheckoutPage.module.css';

function OrderBlock({ order, multiple }: { order: Order; multiple: boolean }) {
  const phone = order.businessWhatsapp.replace(/\D/g, '');
  const contactAvailable = /^9\d{8}$/.test(phone) || /^519\d{8}$/.test(phone);
  const message = buildOrderWhatsAppMessage({ orderCode: order.orderCode, customerName: order.customerName, businessName: order.businessName,
    items: order.items.map(item => ({ name: item.productName, quantity: item.quantity, subtotalFormatted: formatMoney(item.subtotalCents) })),
    totalFormatted: formatMoney(order.totalCents), deliveryType: order.deliveryType, deliveryAddress: order.deliveryAddress });
  return <article className={multiple ? styles.orderBlock : undefined} aria-label={`Pedido ${order.orderCode} de ${order.businessName}`}>
    {multiple && <h2 className={styles.orderBlockTitle}>{order.businessName}</h2>}
    <dl className={styles.orderFacts}>
      <div><dt>Código de pedido</dt><dd className={styles.orderCode}>{order.orderCode}</dd></div>
      <div><dt>Total de productos</dt><dd>{formatMoney(order.totalCents)}</dd></div>
      <div><dt>Modalidad</dt><dd>{order.deliveryType === 'pickup' ? 'Recojo en tienda' : 'Entrega a domicilio'}</dd></div>
      {order.deliveryAddress && <div><dt>Dirección indicada</dt><dd>{order.deliveryAddress}</dd></div>}
    </dl>
    <div className={styles.orderBlockActions}>
      {contactAvailable ? <a className={styles.primaryLink} href={createWhatsAppLink(order.businessWhatsapp, message)} target="_blank" rel="noopener noreferrer"><MessageCircle size={19} aria-hidden="true" />Coordinar por WhatsApp</a>
        : <p className={styles.warning}>La tienda no tiene un número de WhatsApp válido registrado. Consulta sus datos en el detalle del pedido.</p>}
      <Link className={styles.secondaryLink} to={ROUTES.CUSTOMER_ORDER_DETAIL(order.id)}>Ver detalle del pedido <ArrowRight size={17} aria-hidden="true" /></Link>
    </div>
  </article>;
}

export function CheckoutConfirmation({ orders }: { orders: Order[] }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  const multiple = orders.length > 1;
  const first = orders[0];
  return <section className={styles.confirmation} aria-label="Confirmación del pedido">
    <div className={styles.successMark}><Check size={30} aria-hidden="true" /></div>
    <p className={styles.eyebrow}>Pedido registrado en la demostración</p>
    <h1 ref={heading} tabIndex={-1}>{multiple ? `Registramos ${orders.length} pedidos` : 'Tu pedido quedó registrado'}</h1>
    <p className={styles.intro}>{multiple
      ? <>Se creó un pedido por cada tienda. Todos están pendientes de confirmación por su negocio.</>
      : <>El pedido de <strong>{first.businessName}</strong> está pendiente de confirmación por la tienda.</>}</p>
    <div className={styles.nextStep}><h2>Ahora coordina con {multiple ? 'cada tienda' : 'la tienda'}</h2><p>Acuerda disponibilidad, pago y {first.deliveryType === 'pickup' ? 'recojo' : 'entrega'}. El enlace prepara el mensaje de tu pedido; tú decides si lo envías.</p></div>
    {orders.map(order => <OrderBlock key={order.id} order={order} multiple={multiple} />)}
    <div className={styles.confirmationActions}><Link className={styles.secondaryLink} to={ROUTES.CUSTOMER_ORDERS}>Ver mis pedidos <ArrowRight size={17} aria-hidden="true" /></Link><Link className={styles.textLink} to={ROUTES.CATALOG}>Seguir explorando</Link></div>
  </section>;
}
