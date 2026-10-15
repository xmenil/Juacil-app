import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { ROUTES } from '@/shared/config/routes';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { OrderDeliveryTracking } from '@/entities/order/ui/OrderDeliveryTracking';
import styles from './OrderTrackingLookup.module.css';

export function OrderTrackingLookup({ customerId }: { customerId: string }) {
  const [code, setCode] = useState('');
  const [queriedCode, setQueriedCode] = useState<string | null>(null);
  const order = queriedCode ? LocalStoreRepository.getOrdersByCustomer(customerId).find(item => item.orderCode.toUpperCase() === queriedCode) : undefined;
  return <section className={styles.lookup} aria-labelledby="tracking-lookup-title">
    <h2 id="tracking-lookup-title">Consulta tu envío</h2>
    <p>Ingresa el código de tu pedido. Lo encontrarás en la confirmación y en tus compras.</p>
    <form className={styles.form} onSubmit={event => { event.preventDefault(); setQueriedCode(code.trim().toUpperCase()); }}>
      <Input id="tracking-code" label="Código de pedido" placeholder="Ej. JUA-0001" value={code} onChange={event => { setCode(event.target.value); setQueriedCode(null); }} autoCapitalize="characters" maxLength={64} required />
      <Button type="submit" variant="outline" leftIcon={<Search size={18} aria-hidden="true" />}>Consultar seguimiento</Button>
    </form>
    {queriedCode !== null && <div className={styles.result} aria-live="polite">
      {!order ? <p role="status">No encontramos ese código en tus compras. Comprueba el código y la cuenta con la que hiciste el pedido.</p>
        : <><strong>Pedido {order.orderCode} · {order.businessName}</strong>
          {order.deliveryType === 'delivery' ? <OrderDeliveryTracking order={order} /> : <p>Elegiste recojo en tienda. Este pedido no tiene seguimiento de envío.</p>}
          <Link className={styles.detail} to={ROUTES.CUSTOMER_ORDER_DETAIL(order.id)}>Ver detalle del pedido</Link></>}
    </div>}
  </section>;
}
